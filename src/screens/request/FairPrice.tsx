import { useNavigate } from 'react-router-dom';
import { SprayCan, ListChecks, Clock, MapPin, Info } from 'lucide-react';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';

function StepHeader() {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-5 md:px-8 pt-4 pb-1">
      <button
        onClick={() => navigate(-1)}
        aria-label="Back"
        className="w-11 h-11 rounded-full bg-panel border border-line flex items-center justify-center text-ink shrink-0"
      >
        ←
      </button>
      <div className="text-center">
        <div className="font-display font-semibold text-[18px] tracking-[-0.0111em] text-ink">Home cleaning</div>
        <div className="text-xs text-ink-soft font-medium">Step 3 of 3</div>
      </div>
      <span className="w-11 h-11 shrink-0" />
    </header>
  );
}

const COVERS = [
  { icon: SprayCan, text: 'Deep clean · 3 bedrooms · 2 bathrooms' },
  { icon: ListChecks, text: 'Extras: inside fridge, windows' },
  { icon: Clock, text: 'About 4 hours on Sat 4 Oct, 9:00 AM' },
  { icon: MapPin, text: 'Lekki Phase 1 — no travel surcharge' },
];

const STEPS = [
  { title: 'Up to 3 verified cleaners send offers', desc: 'They can adjust the price a little — never more than 30%.' },
  { title: 'You compare and choose', desc: 'See ratings, reviews and arrival time side by side.' },
  { title: 'Pay safely', desc: 'We hold your money until you confirm the job is done.' },
];

export function FairPrice() {
  const navigate = useNavigate();

  return (
    <FlowScreenShell>
      <StepHeader />
      <div className="px-5 md:px-8 pt-4 flex-1 flex flex-col">
        <div className="flex gap-1.5">
          <span className="flex-1 h-1 rounded-pill bg-brand" />
          <span className="flex-1 h-1 rounded-pill bg-brand" />
          <span className="flex-1 h-1 rounded-pill bg-brand" />
        </div>

        <div className="flex flex-col items-center text-center pt-5 pb-1">
          <span className="text-ink-soft font-semibold text-sm">Your fair price</span>
          <span className="font-display font-semibold text-[32px] leading-[36px] tracking-[-0.0313em] text-ink mt-2">
            ₦18,000 – ₦24,000
          </span>
          <p className="text-ink-soft text-sm mt-2 max-w-xs">
            Most deep cleans like yours in Lekki cost about ₦21,000.
          </p>
        </div>

        <div className="relative h-10 mt-2">
          <div className="absolute left-0 right-0 top-2 h-2 rounded-pill bg-line" />
          <div className="absolute top-2 h-2 rounded-pill bg-brand" style={{ left: '26%', width: '49%' }} />
          <div className="absolute top-0 w-5 h-5 rounded-full bg-white border-4 border-brand" style={{ left: '47%' }} />
          <span className="absolute left-0 top-[26px] text-xs text-ink-soft">₦14k</span>
          <span className="absolute top-[26px] text-xs text-ink-soft" style={{ left: '43%' }}>Typical</span>
          <span className="absolute right-0 top-[26px] text-xs text-ink-soft">₦28k</span>
        </div>

        <div className="bg-panel border border-line rounded-card-lg p-4 mt-6">
          <h2 className="font-display font-semibold text-lg text-ink">What this price covers</h2>
          <div className="flex flex-col gap-3 mt-3">
            {COVERS.map((c) => (
              <div key={c.text} className="flex items-center gap-2.5">
                <c.icon className="w-[18px] h-[18px] text-ink-soft shrink-0" />
                <span className="text-ink text-sm">{c.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-panel border border-line rounded-card-lg p-4 mt-4">
          <h2 className="font-display font-semibold text-lg text-ink">What happens next</h2>
          <div className="flex flex-col gap-3 mt-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-[#EDF2FC] text-brand font-bold text-sm flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div>
                  <div className="font-semibold text-ink text-sm">{s.title}</div>
                  <div className="text-ink-soft text-sm mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-4 text-ink-soft text-xs">
          <Info className="w-4 h-4 shrink-0" />
          Based on 1,240 similar jobs in Lagos this year.
        </div>

        <div className="mt-auto pb-8 pt-8 flex flex-col items-center gap-2">
          <button onClick={() => navigate('/request/finding-helpers')} className="btn btn-primary w-full">
            Find helpers
          </button>
          <span className="text-xs text-ink-soft">Free to ask. You only pay when you choose someone.</span>
        </div>
      </div>
    </FlowScreenShell>
  );
}
