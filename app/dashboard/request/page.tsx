'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { uploadFile } from '@/lib/storage/client-upload';
import { AppSidebar } from '@/components/AppSidebar';

// Request Service -> AI Matching flow. Calls the real API routes:
// POST /api/bookings (creates booking + AI price estimate)
// POST /api/bookings/{id}/match (runs AI matching, returns ranked helpers)
//
// Service/category and address selection read and write directly against
// Supabase from the browser (owner-scoped RLS on `addresses`, public read
// on `services`/`service_categories`) — the same pattern used elsewhere
// in this codebase (e.g. helper onboarding's skill picker) rather than a
// bespoke API route for simple CRUD the database already protects.
export default function RequestServicePage() {
  const [step, setStep] = useState<'form' | 'uploading' | 'pricing' | 'matching' | 'results' | 'error'>('form');
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [addressId, setAddressId] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', line1: '', city: '' });
  const [notes, setNotes] = useState('');
  const [urgency, setUrgency] = useState<'standard' | 'urgent'>('standard');
  const [photos, setPhotos] = useState<File[]>([]);
  const [priceEstimate, setPriceEstimate] = useState<any>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        setCategories(data ?? []);
        // Read the preselected category from the URL directly rather than
        // useSearchParams() — that hook forces this page to either be
        // wrapped in a Suspense boundary or bail out of static rendering
        // entirely at build time, for a value that's only needed once on
        // mount. (Same fix as app/login/page.tsx.)
        const preselect = new URLSearchParams(window.location.search).get('category');
        const match = data?.find((c) => c.slug === preselect);
        if (match) setCategoryId(match.id);
      });

    supabase
      .from('addresses')
      .select('*')
      .order('is_default', { ascending: false })
      .then(({ data }) => {
        setAddresses(data ?? []);
        if (data && data.length > 0) setAddressId(data[0].id);
      });
  }, [supabase]);

  useEffect(() => {
    if (!categoryId) {
      setServices([]);
      return;
    }
    supabase
      .from('services')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .then(({ data }) => {
        setServices(data ?? []);
        setServiceId(data?.[0]?.id ?? '');
      });
  }, [categoryId, supabase]);

  async function saveNewAddress() {
    if (!newAddress.line1) return;
    let lat = 6.4281;
    let lng = 3.4219; // Lagos default — overwritten by geolocation below
    if (navigator.geolocation) {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
            resolve();
          },
          () => resolve(),
          { timeout: 3000 }
        );
      });
    }
    const { data, error } = await supabase
      .from('addresses')
      .insert({ label: newAddress.label, line1: newAddress.line1, city: newAddress.city, lat, lng, is_default: addresses.length === 0 })
      .select()
      .single();
    if (!error && data) {
      setAddresses((prev) => [data, ...prev]);
      setAddressId(data.id);
      setShowNewAddress(false);
      setNewAddress({ label: 'Home', line1: '', city: '' });
    }
  }

  function addPhotos(files: FileList | null) {
    if (!files) return;
    setPhotos((prev) => [...prev, ...Array.from(files)].slice(0, 4));
  }

  async function submitRequest() {
    if (!serviceId || !addressId) {
      setErrorMsg('Choose a service and an address to continue.');
      setStep('error');
      return;
    }

    let mediaFileIds: string[] = [];
    if (photos.length > 0) {
      setStep('uploading');
      try {
        const uploaded = await Promise.all(photos.map((file) => uploadFile(file, 'job_photo', {})));
        mediaFileIds = uploaded.map((u) => u.fileId);
      } catch (err: any) {
        setErrorMsg(err.message ?? 'Photo upload failed.');
        setStep('error');
        return;
      }
    }

    setStep('pricing');
    let data: any;
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: serviceId, address_id: addressId, urgency, notes, media_file_ids: mediaFileIds }),
      });
      // A server-side crash (e.g. a missing table, an unhandled exception)
      // returns an HTML error page, not JSON — awaiting res.json() on that
      // throws, and previously nothing caught it: the UI stayed stuck on
      // this loading screen forever with setStep('pricing') never
      // resolving either way, no error shown, no explanation. That's
      // exactly what "I click continue and nothing happens" looks like.
      data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error?.message ?? 'Something went wrong.');
        setStep('error');
        return;
      }
    } catch {
      setErrorMsg("We couldn't reach the server just now. Please try again in a moment.");
      setStep('error');
      return;
    }
    setBookingId(data.id);
    setPriceEstimate(data.price_estimate);
    runMatching(data.id);
  }

  async function runMatching(id: string) {
    setStep('matching');
    try {
      const res = await fetch(`/api/bookings/${id}/match`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error?.message ?? 'No available helpers were found nearby.');
        setErrorCode(data.error?.code ?? null);
        setStep('error');
        return;
      }
      setCandidates(data.candidates);
      setErrorCode(null);
      setStep('results');
    } catch {
      setErrorMsg("We couldn't reach the server just now. Please try again in a moment.");
      setErrorCode(null);
      setStep('error');
    }
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="flex justify-end px-6 py-4">
        <AppSidebar />
      </div>
      <div className="flex items-center justify-center px-6 py-4">
      <div className="w-full max-w-md card p-8">
        {step === 'form' && (
          <div className="space-y-4">
            <h1 className="text-lg font-extrabold text-ink">Request Service</h1>

            <div>
              <label className="text-[11px] font-bold text-ink-faint uppercase">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand mt-1"
              >
                <option value="">Choose a category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {services.length > 0 && (
              <div>
                <label className="text-[11px] font-bold text-ink-faint uppercase">Service</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand mt-1"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ₦{s.base_price_min.toLocaleString()}–₦{s.base_price_max.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-ink-faint uppercase">Location</label>
              {!showNewAddress ? (
                <>
                  <select
                    value={addressId}
                    onChange={(e) => setAddressId(e.target.value)}
                    className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand mt-1"
                  >
                    {addresses.length === 0 && <option value="">No saved addresses</option>}
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label ? `${a.label} — ` : ''}
                        {a.line1}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => setShowNewAddress(true)} className="text-brand text-xs font-bold mt-1.5">
                    + Add a new address
                  </button>
                </>
              ) : (
                <div className="space-y-2 mt-1">
                  <input
                    placeholder="Label (e.g. Home, Office)"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress((a) => ({ ...a, label: e.target.value }))}
                    className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                  />
                  <input
                    placeholder="Street address"
                    value={newAddress.line1}
                    onChange={(e) => setNewAddress((a) => ({ ...a, line1: e.target.value }))}
                    className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                  />
                  <input
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))}
                    className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveNewAddress} disabled={!newAddress.line1} className="btn btn-primary btn-sm flex-1">
                      Save address
                    </button>
                    <button onClick={() => setShowNewAddress(false)} className="btn btn-ghost btn-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <textarea
              placeholder="Describe what you need help with…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand h-24"
            />

            <div className="flex gap-2">
              {(['standard', 'urgent'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgency(u)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border ${
                    urgency === u ? 'bg-navy text-white border-navy' : 'border-line text-ink-soft'
                  }`}
                >
                  {u === 'standard' ? 'Standard' : 'Urgent'}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] font-bold text-ink-faint uppercase">Photos (optional)</label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {photos.map((f, i) => (
                  <div key={i} className="w-16 h-16 rounded-xl bg-line overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white rounded-full text-[10px]"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photos.length < 4 && (
                  <label className="w-16 h-16 rounded-xl border border-dashed border-line flex items-center justify-center text-ink-faint text-xl cursor-pointer">
                    +
                    <input type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(e.target.files)} aria-label="Add photos" />
                  </label>
                )}
              </div>
            </div>

            <button onClick={submitRequest} disabled={!serviceId || !addressId} className="btn btn-primary w-full">
              Continue to AI Pricing →
            </button>
          </div>
        )}

        {step === 'uploading' && <Loading label="Uploading photos…" />}
        {step === 'pricing' && <Loading label="Estimating a fair price…" />}

        {step === 'matching' && (
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-cyan-400/10 flex items-center justify-center text-2xl animate-pulse">
              ✨
            </div>
            <h2 className="font-extrabold text-ink mt-5">Finding your best match…</h2>
            <p className="text-xs text-ink-soft mt-2">AI is ranking verified helpers nearby.</p>
            {priceEstimate && (
              <div className="mt-6 card p-4 text-left">
                <div className="text-[11px] font-bold text-ink-faint">AI FAIR PRICE ESTIMATE</div>
                <div className="text-2xl font-extrabold text-ink mt-1">
                  ₦{priceEstimate.min.toLocaleString()} – ₦{priceEstimate.max.toLocaleString()}
                </div>
                <div className="text-[11px] text-ink-soft mt-2">{priceEstimate.explanation}</div>
              </div>
            )}
          </div>
        )}

        {step === 'results' && (
          <div className="space-y-4">
            {candidates.length > 0 ? (
              <>
                <h2 className="font-extrabold text-ink">Recommended helpers</h2>
                {candidates.map((c) => (
                  <div key={c.helperId} className="card p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-ink text-sm">Helper #{c.helperId.slice(0, 8)}</div>
                      <div className="text-[11px] text-ink-faint">{c.distanceKm} km away</div>
                    </div>
                    <span className="badge badge-ai">{Math.round(c.matchScore * 100)}% match</span>
                  </div>
                ))}
                <button onClick={() => router.push(`/dashboard/bookings/${bookingId}`)} className="btn btn-primary w-full">
                  Continue to booking
                </button>
              </>
            ) : (
              <div className="card p-6 text-center space-y-4">
                <div className="text-3xl">🔍</div>
                <div>
                  <div className="font-bold text-ink text-sm">No verified helpers are currently available</div>
                  <p className="text-xs text-ink-faint mt-1.5 leading-relaxed">
                    Your price estimate is still saved — we just couldn&apos;t find a matching helper nearby right
                    now. This can happen at off-peak hours or for less common services in your area.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => bookingId && runMatching(bookingId)} className="btn btn-primary w-full">
                    Try matching again
                  </button>
                  <button onClick={() => router.push('/dashboard/bookings')} className="btn btn-ghost w-full">
                    Keep this request open — I&apos;ll check back later
                  </button>
                  <button onClick={() => setStep('form')} className="btn btn-ghost w-full">
                    Change service or location
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-6">
            <div className="text-danger font-bold text-sm">{errorMsg}</div>
            {errorCode === 'NO_AVAILABLE_HELPERS' ? (
              <>
                {priceEstimate && (
                  <div className="card p-4 mt-4 text-left">
                    <div className="text-[11px] font-bold text-ink-faint uppercase">Your price estimate is still valid</div>
                    <div className="text-lg font-extrabold text-ink mt-1">
                      ₦{priceEstimate.min.toLocaleString()} – ₦{priceEstimate.max.toLocaleString()}
                    </div>
                  </div>
                )}
                <p className="text-xs text-ink-faint mt-2">
                  Your request is saved — we&apos;ll keep looking. You can also try a different service or address.
                </p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => bookingId && runMatching(bookingId)} className="btn btn-ghost flex-1">
                    Try again
                  </button>
                  <button onClick={() => setStep('form')} className="btn btn-ghost flex-1">
                    Change service/address
                  </button>
                </div>
                <a href="/dashboard/bookings" className="text-xs text-brand font-bold mt-4 inline-block">
                  View my requests →
                </a>
              </>
            ) : (
              <button onClick={() => setStep('form')} className="btn btn-ghost w-full mt-4">
                Try again
              </button>
            )}
          </div>
        )}
      </div>
      </div>
    </main>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="text-center py-10">
      <div className="w-10 h-10 mx-auto rounded-full border-4 border-line border-t-brand animate-spin" />
      <p className="text-sm text-ink-soft mt-4">{label}</p>
    </div>
  );
}
