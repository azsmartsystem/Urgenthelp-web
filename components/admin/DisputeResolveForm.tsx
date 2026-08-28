'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DisputeResolveForm({ disputeId }: { disputeId: string }) {
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function resolve(outcome: 'resolved' | 'rejected') {
    setLoading(true);
    await fetch(`/api/admin/disputes/${disputeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: outcome, resolution }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-4 pt-4 border-t border-line">
      <textarea
        placeholder="Resolution notes…"
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-brand h-16"
      />
      <div className="flex gap-2 mt-2">
        <button onClick={() => resolve('rejected')} disabled={loading || !resolution} className="btn btn-ghost btn-sm flex-1">
          Reject dispute
        </button>
        <button onClick={() => resolve('resolved')} disabled={loading || !resolution} className="btn btn-primary btn-sm flex-1">
          Mark resolved
        </button>
      </div>
    </div>
  );
}
