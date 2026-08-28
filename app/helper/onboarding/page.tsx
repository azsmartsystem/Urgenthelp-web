'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';
import { AppSidebar } from '@/components/AppSidebar';

const STEPS = ['Profile', 'Skills', 'Service Area', 'Verification', 'Review'] as const;

export default function HelperOnboardingWizard() {
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    years_experience: 1,
    service_radius_km: 10,
    center_lat: 6.4281,
    center_lng: 3.4219, // Lekki, Lagos default — overwritten by geolocation below
  });
  const [idFile, setIdFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [verifiedNow, setVerifiedNow] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from('services')
      .select('*, service_categories(name)')
      .eq('is_active', true)
      .then(({ data }) => setServices(data ?? []));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setForm((f) => ({ ...f, center_lat: pos.coords.latitude, center_lng: pos.coords.longitude })),
        () => {} // keep default on denial — don't block onboarding
      );
    }
  }, [supabase]);

  async function submitAll() {
    setSubmitting(true);
    setError(null);

    const res = await fetch('/api/helpers/me/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, skill_service_ids: selectedServiceIds }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSubmitting(false);
      return setError(data.error?.message ?? 'Could not complete onboarding.');
    }

    // Upload the ID document to Supabase Storage, then link it via the
    // verification API. Storage bucket `verification-documents` must exist
    // with owner-only access policies (private bucket).
    let verified = false;
    if (idFile) {
      const path = `${data.user_id ?? data.id}/${Date.now()}_${idFile.name}`;
      const { error: uploadErr } = await supabase.storage.from('verification-documents').upload(path, idFile);
      if (!uploadErr) {
        const verifyRes = await fetch('/api/verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'government_id', storage_path: path }),
        });
        verified = verifyRes.ok;
      }
    }

    setSubmitting(false);
    setVerifiedNow(verified);
    setDone(true);
  }

  if (done) {
    return (
      <main className="min-h-screen bg-surface">
        <div className="flex justify-end px-6 py-4">
          <AppSidebar />
        </div>
        <div className="flex items-center justify-center px-6 -mt-20 min-h-screen">
        <div className="card p-10 text-center max-w-sm">
          {verifiedNow ? (
            <>
              <div className="text-3xl mb-3">✅</div>
              <h1 className="font-extrabold text-ink text-lg">You&apos;re verified!</h1>
              <p className="text-sm text-ink-soft mt-2">
                Your ID was received and your account is now verified — you can start accepting jobs right away.
              </p>
            </>
          ) : (
            <>
              <div className="text-3xl mb-3">⚠️</div>
              <h1 className="font-extrabold text-ink text-lg">Profile created — one step left</h1>
              <p className="text-sm text-ink-soft mt-2">
                Your profile is saved, but we couldn&apos;t verify your account because no ID was uploaded
                {/* or the upload failed — either way, be honest that it didn't happen rather than */}
                {/* claiming "Verified" like the success path above does. */}
                . You can explore Helper Mode now, but you&apos;ll need to upload a government ID before you can
                accept jobs.
              </p>
              <a href="/profile" className="btn btn-primary w-full mt-6 inline-flex">
                Upload ID now
              </a>
            </>
          )}
          <button onClick={() => router.push('/helper')} className="btn btn-ghost w-full mt-3">
            Go to Helper Dashboard
          </button>
        </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="flex justify-end px-6 py-4">
        <AppSidebar />
      </div>
      <div className="flex items-center justify-center px-6 py-4">
      <div className="w-full max-w-md card p-8">
        <Logo className="mb-6 justify-center" />
        <div className="flex gap-1 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded ${i <= step ? 'bg-brand' : 'bg-line'}`} />
          ))}
        </div>
        <div className="text-[11px] font-bold text-ink-faint mb-1">
          STEP {step + 1} OF {STEPS.length}
        </div>
        <h1 className="text-lg font-extrabold text-ink mb-5">{STEPS[step]}</h1>

        {step === 0 && (
          <div className="space-y-3">
            <input
              placeholder="Display name"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm"
            />
            <textarea
              placeholder="Short bio — tell customers about your experience"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm h-24"
            />
            <input
              type="number"
              placeholder="Years of experience"
              value={form.years_experience}
              onChange={(e) => setForm({ ...form, years_experience: Number(e.target.value) })}
              className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm"
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {services.map((s) => (
              <label key={s.id} className="flex items-center gap-3 card p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedServiceIds.includes(s.id)}
                  onChange={(e) =>
                    setSelectedServiceIds((prev) => (e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)))
                  }
                />
                <div>
                  <div className="text-sm font-bold text-ink">{s.name}</div>
                  <div className="text-[11px] text-ink-faint">{s.service_categories?.name}</div>
                </div>
              </label>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-ink-soft">
              We detected your current location as your service area center. Set how far you're willing to travel.
            </p>
            <input
              type="range"
              min={1}
              max={50}
              value={form.service_radius_km}
              onChange={(e) => setForm({ ...form, service_radius_km: Number(e.target.value) })}
              aria-label="Service radius in kilometers"
              aria-valuetext={`${form.service_radius_km} kilometers`}
              className="w-full"
            />
            <div className="text-sm font-bold text-ink text-center">{form.service_radius_km} km radius</div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="text-xs text-ink-soft">Upload a government-issued ID for verification.</p>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setIdFile(e.target.files?.[0] ?? null)} aria-label="Upload government-issued ID" className="text-sm" />
            <p className="text-[11px] text-ink-faint">
              File is uploaded to a private Supabase Storage bucket. Verification completes automatically once it&apos;s
              received — no waiting on manual review.
            </p>
            {!idFile && <p className="text-[11px] text-amber-400 font-semibold">Required to start accepting jobs — you can&apos;t skip this and be verified.</p>}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2 text-sm">
            <div>
              <b>Name:</b> {form.display_name}
            </div>
            <div>
              <b>Services:</b> {selectedServiceIds.length} selected
            </div>
            <div>
              <b>Radius:</b> {form.service_radius_km} km
            </div>
            <div>
              <b>ID document:</b> {idFile ? idFile.name : 'Not uploaded'}
            </div>
          </div>
        )}

        {error && <p className="text-danger text-xs mt-3">{error}</p>}

        <div className="flex gap-2 mt-6">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn btn-ghost flex-1">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !form.display_name}
              className="btn btn-primary flex-1"
            >
              Continue
            </button>
          ) : (
            <button onClick={submitAll} disabled={submitting} className="btn btn-primary flex-1">
              {submitting ? 'Submitting…' : 'Submit application'}
            </button>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}
