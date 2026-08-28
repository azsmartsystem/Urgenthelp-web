'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';
import { NavBar } from '@/components/NavBar';
import { haversineKm } from '@/lib/location/distance';

type SortMode = 'best_match' | 'top_rated' | 'nearest';

interface HelperResult {
  helperId: string;
  displayName: string;
  avatarUrl: string | null;
  verificationStatus: string;
  availabilityStatus: string;
  trustScore: number;
  serviceName: string;
  price: number | null;
  rating: number;
  reviewCount: number;
  distanceKm: number | null;
}

// A dedicated browse/search experience for finding a helper directly —
// distinct from the "Request Service" flow (app/dashboard/request), which
// is for booking a specific job. This is for "who's out there for X" —
// the AI Matching screen only ever shows candidates *after* a booking is
// created, so there was previously no way to browse helpers first.
export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HelperResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortMode>('best_match');
  const [underBudget, setUnderBudget] = useState(false);
  const [availableNow, setAvailableNow] = useState(false);
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Load once, for the "Nearest" sort — the customer's default/most
    // recent address stands in for "current location" here, same as the
    // rest of the app (there's no live GPS permission flow yet).
    supabase
      .from('addresses')
      .select('lat, lng')
      .order('is_default', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.lat != null && data?.lng != null) setCustomerLocation({ lat: data.lat, lng: data.lng });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => runSearch(query), 300); // debounce
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, customerLocation]);

  async function runSearch(term: string) {
    setLoading(true);

    let skillsQuery = supabase
      .from('helper_skills')
      .select(
        'helper_price, service_id, helper_id, services(name), helper_profiles!inner(id, user_id, display_name, avatar_url, verification_status, availability_status, trust_score_cached, service_areas(center_lat, center_lng))'
      )
      .eq('is_active', true)
      .eq('helper_profiles.verification_status', 'verified');

    if (term.trim()) {
      skillsQuery = skillsQuery.ilike('services.name', `%${term.trim()}%`);
    }

    const { data: rows, error } = await skillsQuery.limit(50);
    if (error || !rows) {
      setResults([]);
      setLoading(false);
      return;
    }

    const helperUserIds = Array.from(new Set(rows.map((r: any) => r.helper_profiles.user_id)));
    const { data: reviewRows } = helperUserIds.length
      ? await supabase.from('reviews').select('reviewee_id, rating').in('reviewee_id', helperUserIds)
      : { data: [] };

    const ratingByUser = new Map<string, { sum: number; count: number }>();
    for (const r of reviewRows ?? []) {
      const cur = ratingByUser.get(r.reviewee_id) ?? { sum: 0, count: 0 };
      cur.sum += r.rating;
      cur.count += 1;
      ratingByUser.set(r.reviewee_id, cur);
    }

    const mapped: HelperResult[] = rows.map((r: any) => {
      const hp = r.helper_profiles;
      const agg = ratingByUser.get(hp.user_id);
      const area = hp.service_areas?.[0];
      const distanceKm =
        customerLocation && area ? haversineKm(customerLocation.lat, customerLocation.lng, area.center_lat, area.center_lng) : null;
      return {
        helperId: hp.id,
        displayName: hp.display_name ?? 'Helper',
        avatarUrl: hp.avatar_url,
        verificationStatus: hp.verification_status,
        availabilityStatus: hp.availability_status,
        trustScore: hp.trust_score_cached ?? 70,
        serviceName: r.services?.name ?? '',
        price: r.helper_price,
        rating: agg ? agg.sum / agg.count : 0,
        reviewCount: agg?.count ?? 0,
        distanceKm,
      };
    });

    setResults(mapped);
    setLoading(false);
  }

  const filtered = results
    .filter((r) => !underBudget || (r.price != null && r.price <= 8000))
    .filter((r) => !availableNow || r.availabilityStatus === 'online')
    .sort((a, b) => {
      if (sort === 'top_rated') return b.rating - a.rating;
      if (sort === 'nearest') {
        if (a.distanceKm == null) return 1; // no address on file — push to the end, don't crash the sort
        if (b.distanceKm == null) return -1;
        return a.distanceKm - b.distanceKm;
      }
      return b.trustScore + b.rating * 10 - (a.trustScore + a.rating * 10); // best match
    });

  return (
    <main className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel sticky top-0 z-30">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <NavBar />
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-2 card px-4 py-3">
          <span className="text-ink-faint">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a service (e.g. cleaning, plumbing)"
            className="flex-1 bg-transparent text-ink placeholder:text-ink-faint text-sm outline-none"
          />
        </div>

        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-1 px-1">
          {([
            ['best_match', 'AI Best Match'],
            ['top_rated', 'Top Rated'],
            ['nearest', 'Nearest'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`shrink-0 px-4 py-2 rounded-pill text-xs font-bold whitespace-nowrap ${
                sort === key ? 'bg-brand text-white' : 'bg-panel border border-line text-ink-soft'
              }`}
            >
              {key === 'best_match' && '✨ '}
              {label}
            </button>
          ))}
          <button
            onClick={() => setUnderBudget((v) => !v)}
            className={`shrink-0 px-4 py-2 rounded-pill text-xs font-bold whitespace-nowrap ${
              underBudget ? 'bg-brand text-white' : 'bg-panel border border-line text-ink-soft'
            }`}
          >
            Under ₦8k
          </button>
          <button
            onClick={() => setAvailableNow((v) => !v)}
            className={`shrink-0 px-4 py-2 rounded-pill text-xs font-bold whitespace-nowrap ${
              availableNow ? 'bg-brand text-white' : 'bg-panel border border-line text-ink-soft'
            }`}
          >
            Available now
          </button>
        </div>

        <div className="text-xs text-ink-faint mt-4 mb-3">
          {loading ? 'Searching…' : `${filtered.length} verified helper${filtered.length === 1 ? '' : 's'}`}
          {sort === 'best_match' && !loading && filtered.length > 0 && (
            <>
              {' '}
              · sorted by <span className="text-ai font-semibold">AI match score</span>
            </>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card p-4 h-24 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center text-ink-faint text-sm">
            {query ? `No verified helpers found for "${query}" yet.` : 'Search for a service to see verified helpers nearby.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <Link key={r.helperId} href={`/dashboard/helpers/${r.helperId}`} className="card p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-ink text-sm">{r.displayName}</div>
                  <div className="text-xs text-ink-faint mt-0.5">{r.serviceName}</div>
                  <div className="flex items-center gap-2 mt-2 text-xs flex-wrap">
                    <span className="text-amber-400 font-semibold">
                      ★ {r.rating > 0 ? r.rating.toFixed(1) : 'New'} {r.reviewCount > 0 && `(${r.reviewCount})`}
                    </span>
                    {r.distanceKm != null && <span className="text-ink-faint">{r.distanceKm.toFixed(1)} km away</span>}
                    {r.availabilityStatus === 'online' && <span className="badge badge-verified">Available now</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-extrabold text-ink text-sm">{r.price ? `₦${Number(r.price).toLocaleString()}` : '—'}</div>
                  {sort === 'best_match' && <span className="badge badge-ai mt-2 inline-block">✨ Best Match</span>}
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
