import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, Lock } from 'lucide-react';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';
import { useBookingRequest } from '@/context/BookingRequestContext';

const PHOTOS = [
  '/figma/onboarding-2-kitchen.png',
  '/figma/onboarding-3-livingroom.png',
  '/figma/onboarding-1-helper-door.png',
  '/figma/onboarding-2-kitchen.png',
];

export function JobDone() {
  const navigate = useNavigate();
  const { selectedHelper } = useBookingRequest();
  const [releasing, setReleasing] = useState(false);
  const helperFirst = selectedHelper?.display_name.split(' ')[0] ?? 'Adaeze';
  const total = (selectedHelper?.price_quote ?? 21500) + 800;

  function release() {
    setReleasing(true);
    setTimeout(() => navigate('/request/rate'), 700);
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
          <h1 className="font-display font-semibold text-[26px] leading-[30px] tracking-[-0.0286em] text-ink mt-4">
            {helperFirst} says the job is done
          </h1>
          <p className="text-ink-soft text-base mt-2 max-w-xs">
            Take a look at the photos and your space, then release payment when you're happy.
          </p>
        </div>

        <h2 className="font-display font-semibold text-lg text-ink mt-6">4 photos from {helperFirst}</h2>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {PHOTOS.map((src, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-panel-2">
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="bg-panel border border-line rounded-card-lg p-4 mt-6 flex items-center justify-between">
          <div>
            <div className="font-semibold text-ink text-base">₦{total.toLocaleString()} held safely</div>
            <div className="text-ink-soft text-sm mt-0.5">Released to {helperFirst} once you confirm</div>
          </div>
          <Lock className="w-5 h-5 text-ink-soft shrink-0" />
        </div>

        <div className="mt-auto pb-8 pt-8 flex flex-col items-center gap-3">
          <button onClick={release} disabled={releasing} className="btn btn-primary w-full disabled:opacity-60">
            {releasing ? 'Releasing…' : `Release ₦${total.toLocaleString()}`}
          </button>
          <button className="flex items-center gap-2 text-ink-soft font-semibold text-sm">
            <Flag className="w-4 h-4" />
            Tell us about an issue instead
          </button>
        </div>
      </div>
    </FlowScreenShell>
  );
}
