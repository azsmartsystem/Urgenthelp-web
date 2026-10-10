import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Check, Hourglass, X } from 'lucide-react';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';

const STATUS = [
  { text: '14 verified cleaners available nearby', done: true },
  { text: 'Picked the 3 best matches for your job', done: true },
  { text: '1 of 3 offers received', done: false },
];

export function FindingHelpers() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/request/offers'), 2600);
    return () => clearTimeout(t);
  }, [navigate]);

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
        <span />
        <span className="w-11 h-11" />
      </header>

      <div className="px-5 md:px-8 pt-2 flex-1 flex flex-col items-center text-center">
        <div className="relative w-[260px] h-[260px] shrink-0">
          <motion.span
            className="absolute inset-0 rounded-full border border-[#B7C8F0]"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="absolute inset-[35px] rounded-full border border-[#B7C8F0] bg-white" />
          <span className="absolute inset-[70px] rounded-full border border-[#B7C8F0] bg-[#EDF2FC]" />
          <motion.div
            className="absolute inset-0 m-auto w-[72px] h-[72px] rounded-full bg-brand flex items-center justify-center"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Search className="w-[30px] h-[30px] text-white" />
          </motion.div>
          <img
            src="/figma/helper-adaeze-square.png"
            alt=""
            className="absolute top-[14%] left-[15%] w-[52px] h-[52px] rounded-full object-cover border-[3px] border-white shadow-card"
          />
          <img
            src="/figma/helper-kemi.png"
            alt=""
            className="absolute top-[33%] right-[8%] w-[52px] h-[52px] rounded-full object-cover border-[3px] border-white shadow-card"
          />
          <img
            src="/figma/helper-ifeanyi.png"
            alt=""
            className="absolute bottom-[8%] right-[18%] w-[52px] h-[52px] rounded-full object-cover border-[3px] border-white shadow-card"
          />
        </div>

        <h1 className="font-display font-semibold text-[28px] leading-[32px] tracking-[-0.0286em] text-ink mt-5">
          Finding your helpers
        </h1>
        <p className="text-ink-soft text-base mt-2 max-w-xs">
          We've sent your job to 3 top-rated cleaners near Lekki. Offers usually arrive in under 5 minutes.
        </p>

        <div className="bg-panel border border-line rounded-card-lg p-4 w-full mt-6 text-left">
          {STATUS.map((s) => (
            <div key={s.text} className="flex items-center gap-2.5 py-1">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  s.done ? 'bg-brand text-white' : 'bg-panel-2 text-ink-soft'
                }`}
              >
                {s.done ? <Check className="w-3.5 h-3.5" /> : <Hourglass className="w-3.5 h-3.5" />}
              </span>
              <span className={`text-sm ${s.done ? 'text-ink' : 'text-ink-soft'}`}>{s.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pb-8 pt-8 w-full flex flex-col items-center gap-2">
          <button onClick={() => navigate('/home')} className="btn btn-ghost w-full">
            Cancel request
          </button>
          <span className="text-xs text-ink-soft">You can leave this screen — we'll notify you.</span>
        </div>
      </div>
    </FlowScreenShell>
  );
}
