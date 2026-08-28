'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Helper "I'm Available for Jobs" toggle. Writes to Postgres via the API
// route (which also mirrors to Redis so the matching pipeline's "online"
// filter is real-time) instead of a direct client-side table write,
// since RLS scoping through auth_user_id
// -> users.id -> helper_profiles.user_id is easier to get right in one
// server-side place than to duplicate on the client.
export function AvailabilityToggle({
  initialStatus,
  disabled,
}: {
  initialStatus: 'online' | 'offline';
  disabled?: boolean;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (disabled) return;
    setLoading(true);
    const next = status === 'online' ? 'offline' : 'online';
    const res = await fetch('/api/helpers/me/availability', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) setStatus(next);
    setLoading(false);
  }

  return (
    <div className="card px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full ${status === 'online' ? 'bg-success' : 'bg-line'}`} />
        <div>
          <div className="font-extrabold text-ink text-sm">
            {status === 'online' ? "You're Available for Jobs" : "You're currently offline"}
          </div>
          <div className="text-[11px] text-ink-faint">
            {status === 'online' ? 'Visible to nearby customers' : 'Go online to start receiving job opportunities'}
          </div>
        </div>
      </div>
      <button
        onClick={toggle}
        disabled={disabled || loading}
        aria-label="Toggle availability"
        className={`w-[46px] h-[26px] rounded-full relative transition-colors ${
          status === 'online' ? 'bg-success' : 'bg-line'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <span
          className="absolute top-[3px] w-5 h-5 rounded-full bg-panel shadow transition-all"
          style={{ left: status === 'online' ? '23px' : '3px' }}
        />
      </button>
    </div>
  );
}
