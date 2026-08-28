'use client';
import { useEffect, useState } from 'react';

// Live tracking view — polls GET /api/bookings/{id}/tracking every 5s.
// Renders the same premium map treatment as the approved design (grid
// background + pins + route line) using plain SVG so it works with zero
// Maps provider credentials. If MAPS_PROVIDER_API_KEY is configured in a
// future iteration, this component is the natural place to swap in a real
// embedded map — the polling/data contract stays the same.
export function TrackingMap({ bookingId }: { bookingId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function poll() {
      const res = await fetch(`/api/bookings/${bookingId}/tracking`);
      const json = await res.json();
      if (active) {
        setData(json);
        setLoading(false);
      }
    }
    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [bookingId]);

  if (loading) {
    return <div className="h-72 rounded-2xl bg-line animate-pulse" />;
  }

  if (!data?.available) {
    return (
      <div className="h-72 rounded-2xl bg-panel border border-line flex flex-col items-center justify-center text-center px-6">
        <div className="text-3xl mb-2">📍</div>
        <div className="font-bold text-ink text-sm">Live location unavailable</div>
        <div className="text-xs text-ink-faint mt-1">
          {data?.reason === 'no_helper_assigned'
            ? 'A helper hasn\u2019t been assigned yet.'
            : 'Waiting for the helper\u2019s device to send its next location update.'}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-line relative">
      <svg viewBox="0 0 375 280" width="100%" height="280" style={{ background: '#0D1220' }}>
        <defs>
          <pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="375" height="280" fill="url(#grid)" />
        <path d="M 60 220 C 140 220, 120 120, 200 100 S 300 60, 320 40" stroke="#2563EB" strokeWidth="3" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
        <circle cx="320" cy="40" r="7" fill="#2563EB" opacity="0.9" />
        <circle cx="60" cy="220" r="7" fill="#06B6D4" opacity="0.9" />
      </svg>
      <div className="absolute top-3 right-3 bg-panel shadow-card rounded-xl px-3 py-1.5 text-xs font-extrabold text-ink">
        ETA {data.eta_minutes} min
      </div>
      <div className="absolute bottom-3 left-3 bg-panel shadow-card rounded-xl px-3 py-1.5 text-xs font-bold text-ink-soft">
        {data.helper_name} · {data.distance_km} km away
      </div>
    </div>
  );
}
