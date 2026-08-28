'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TAGS = ['Punctual', 'Thorough', 'Friendly', 'Great value', 'Professional'];

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  async function submit() {
    setSubmitting(true);
    const res = await fetch(`/api/bookings/${bookingId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment, tags }),
    });
    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
      router.refresh();
    }
  }

  if (submitted) return <div className="card p-5 text-center text-sm text-success font-bold">Thanks for your review!</div>;

  return (
    <div className="card p-5">
      <div className="text-[11px] font-bold text-ink-faint uppercase mb-3">Leave a review</div>
      <div className="flex gap-1 justify-center mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            className="text-2xl"
            aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
            aria-pressed={n <= rating}
            style={{ color: n <= rating ? '#F59E0B' : 'rgba(255,255,255,0.12)' }}
          >
            ★
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
            className={`badge ${tags.includes(t) ? 'badge-verified' : 'badge-navy'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <textarea
        placeholder="Leave a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full bg-panel-2 border border-line rounded-xl px-4 py-3 text-sm h-20 text-ink placeholder:text-ink-faint"
      />
      <button onClick={submit} disabled={submitting} className="btn btn-primary w-full mt-3">
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>
    </div>
  );
}
