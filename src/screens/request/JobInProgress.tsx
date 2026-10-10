import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, Circle, MessageCircle, Flag } from 'lucide-react';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';
import { useBookingRequest } from '@/context/BookingRequestContext';

const TASKS = [
  { text: 'Arrived and started', done: true },
  { text: 'Removing dust and clutter', done: true },
  { text: 'Mopping and vacuuming floors', done: false },
  { text: 'Kitchen and bathroom surfaces', done: false },
  { text: 'Final walkthrough', done: false },
];

export function JobInProgress() {
  const navigate = useNavigate();
  const { selectedHelper } = useBookingRequest();
  const helperFirst = selectedHelper?.display_name.split(' ')[0] ?? 'Adaeze';
  const [elapsed, setElapsed] = useState(6490);

  useEffect(() => {
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    const nav = setTimeout(() => navigate('/request/job-done'), 3500);
    return () => {
      clearInterval(tick);
      clearTimeout(nav);
    };
  }, [navigate]);

  const h = String(Math.floor(elapsed / 3600)).padStart(1, '0');
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');

  return (
    <FlowScreenShell>
      <header className="flex items-center justify-between px-5 md:px-8 pt-4 pb-1">
        <button
          onClick={() => navigate('/home')}
          aria-label="Close"
          className="w-11 h-11 rounded-full bg-panel border border-line flex items-center justify-center text-ink"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="font-bold text-ink text-base">Job in progress</span>
        <span className="w-11 h-11" />
      </header>

      <div className="px-5 md:px-8 pt-4 flex-1 flex flex-col">
        <div className="flex flex-col items-center text-center pt-2">
          <span className="font-display font-semibold text-[48px] leading-none tracking-[-0.02em] text-ink">
            {h}:{m}:{s}
          </span>
          <p className="text-ink-soft text-sm mt-2">{helperFirst} started at 9:04 AM</p>
        </div>

        <div className="flex items-center gap-3 bg-panel border border-line rounded-card-lg p-4 mt-6">
          <img src="/figma/helper-adaeze-square.png" alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-ink text-base truncate">{selectedHelper?.display_name ?? 'Adaeze Okafor'}</div>
            <div className="text-ink-soft text-sm">Deep clean · 3-bedroom flat</div>
          </div>
          <button
            aria-label="Message"
            className="w-11 h-11 rounded-full bg-panel-2 flex items-center justify-center text-ink shrink-0"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>

        <h2 className="font-display font-semibold text-lg text-ink mt-6">What's happening</h2>
        <div className="bg-panel border border-line rounded-card-lg p-4 mt-3">
          {TASKS.map((t) => (
            <div key={t.text} className="flex items-center gap-2.5 py-1.5">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  t.done ? 'bg-brand text-white' : 'bg-panel-2 text-ink-faint'
                }`}
              >
                {t.done ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-2.5 h-2.5 fill-current" />}
              </span>
              <span className={`text-sm ${t.done ? 'text-ink' : 'text-ink-soft'}`}>{t.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pb-8 pt-8 flex flex-col items-center gap-2">
          <button className="flex items-center gap-2 text-ink-soft font-semibold text-sm">
            <Flag className="w-4 h-4" />
            Report an issue
          </button>
          <span className="text-xs text-ink-soft">You can leave this screen — we'll notify you when she's done.</span>
        </div>
      </div>
    </FlowScreenShell>
  );
}
