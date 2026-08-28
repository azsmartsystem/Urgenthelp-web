'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function VerificationDecision({ helperId }: { helperId: string }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function decide(decision: 'approve' | 'reject') {
    setLoading(true);
    await fetch(`/api/admin/verification/${helperId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, reason: decision === 'reject' ? reason : undefined }),
    });
    setLoading(false);
    router.push('/admin/verification');
    router.refresh();
  }

  return (
    <div className="card p-5 mt-4">
      <h2 className="font-extrabold text-ink text-sm mb-3">Decision</h2>
      <textarea
        placeholder="Rejection reason (required if rejecting)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand h-20"
      />
      <div className="flex gap-3 mt-3">
        <button
          onClick={() => decide('reject')}
          disabled={loading || !reason}
          className="btn btn-ghost flex-1"
          style={{ color: '#EF4444', borderColor: '#F6D6D6' }}
        >
          Reject
        </button>
        <button onClick={() => decide('approve')} disabled={loading} className="btn btn-primary flex-1">
          Approve helper
        </button>
      </div>
    </div>
  );
}
