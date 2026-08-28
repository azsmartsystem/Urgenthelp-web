'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TYPES = [
  { value: 'quality', label: 'Job quality' },
  { value: 'payment', label: 'Payment issue' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'other', label: 'Other' },
] as const;

export function ReportIssueForm({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<(typeof TYPES)[number]['value']>('quality');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  async function submit() {
    setError(null);
    if (description.trim().length < 10) return setError('Please give a few more details (at least 10 characters).');
    setLoading(true);
    const res = await fetch('/api/disputes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, type, description }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return setError(body?.error?.message ?? 'Could not submit your report.');
    }
    setSubmitted(true);
    router.refresh();
  }

  if (submitted) {
    return (
      <div className="card p-4 text-sm text-ink-soft">
        Your report has been sent to our Trust &amp; Safety team — we&apos;ll follow up by notification.
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-ghost text-danger w-full">
        Report an issue
      </button>
    );
  }

  return (
    <div className="card p-4 space-y-3">
      <div className="text-sm font-bold text-ink">Report an issue with this booking</div>
      <div className="flex gap-2 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`px-3 py-1.5 rounded-pill text-xs font-bold ${
              type === t.value ? 'bg-brand text-white' : 'bg-panel-2 border border-line text-ink-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What happened?"
        className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand h-24"
      />
      <div className="flex gap-2">
        <button onClick={submit} disabled={loading} className="btn btn-primary flex-1">
          {loading ? 'Submitting…' : 'Submit report'}
        </button>
        <button onClick={() => setOpen(false)} className="btn btn-ghost">
          Cancel
        </button>
      </div>
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  );
}
