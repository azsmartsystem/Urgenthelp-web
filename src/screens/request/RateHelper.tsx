import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, BadgeCheck } from 'lucide-react';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';
import { useBookingRequest } from '@/context/BookingRequestContext';

const TAGS = ['On time', 'Very thorough', 'Friendly', 'Good communication', 'Would book again'];
const TIPS = ['None', '₦500', '₦1,000', '₦2,000'];

export function RateHelper() {
  const navigate = useNavigate();
  const { selectedHelper, reset } = useBookingRequest();
  const helperFirst = selectedHelper?.display_name.split(' ')[0] ?? 'Adaeze';
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [tags, setTags] = useState<string[]>(['On time', 'Very thorough']);
  const [tip, setTip] = useState('None');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function toggleTag(t: string) {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  function submit() {
    setSubmitting(true);
    setTimeout(() => {
      reset();
      navigate('/home');
    }, 700);
  }

  return (
    <FlowScreenShell>
      <div className="px-5 md:px-8 pt-6 flex-1 flex flex-col">
        <div className="flex flex-col items-center text-center">
          <img
            src="/figma/helper-adaeze-square.png"
            alt=""
            className="w-16 h-16 rounded-full object-cover border-[3px] border-white shadow-card"
          />
          <div className="flex items-center gap-1 mt-3">
            <h1 className="font-display font-semibold text-xl text-ink">How was {helperFirst}?</h1>
            <BadgeCheck className="w-5 h-5 text-brand" />
          </div>
          <p className="text-ink-soft text-sm mt-1">Deep clean · 3-bedroom flat</p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${n} star`}
              className="p-1"
            >
              <Star
                className={`w-9 h-9 ${
                  n <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-line fill-line'
                }`}
              />
            </button>
          ))}
        </div>

        <h2 className="font-display font-semibold text-lg text-ink mt-6">What stood out?</h2>
        <div className="flex flex-wrap gap-2 mt-3">
          {TAGS.map((t) => {
            const active = tags.includes(t);
            return (
              <button
                type="button"
                key={t}
                onClick={() => toggleTag(t)}
                className={`h-11 px-4 rounded-full text-sm font-bold border transition ${
                  active ? 'bg-brand border-brand text-white' : 'bg-panel border-line text-ink'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        <h2 className="font-display font-semibold text-lg text-ink mt-6">Add a tip?</h2>
        <div className="flex flex-wrap gap-2 mt-3">
          {TIPS.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTip(t)}
              className={`h-11 px-4 rounded-full text-sm font-bold border transition ${
                tip === t ? 'bg-brand border-brand text-white' : 'bg-panel border-line text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <h2 className="font-display font-semibold text-lg text-ink mt-6">Leave a comment</h2>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`Tell others what it was like working with ${helperFirst}…`}
          rows={3}
          className="mt-3 w-full bg-white border border-line rounded-2xl px-4 py-3 outline-none text-ink placeholder:text-ink-faint focus:border-brand focus:border-2 resize-none"
        />

        <div className="mt-auto pb-8 pt-8 flex flex-col items-center gap-2">
          <button onClick={submit} disabled={submitting} className="btn btn-primary w-full disabled:opacity-60">
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
          <button onClick={() => { reset(); navigate('/home'); }} className="text-ink-soft font-semibold text-sm">
            Skip for now
          </button>
        </div>
      </div>
    </FlowScreenShell>
  );
}
