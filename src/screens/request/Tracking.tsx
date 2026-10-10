import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, MessageCircle, ShieldCheck } from 'lucide-react';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';
import { useBookingRequest } from '@/context/BookingRequestContext';

export function Tracking() {
  const navigate = useNavigate();
  const { selectedHelper } = useBookingRequest();
  const helperFirst = selectedHelper?.display_name.split(' ')[0] ?? 'Adaeze';

  useEffect(() => {
    const t = setTimeout(() => navigate('/request/in-progress'), 3500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <FlowScreenShell>
      <div className="relative h-[280px] md:h-[320px] bg-panel-2 overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute left-0 right-0 top-[30%] h-4 bg-white" />
          <div className="absolute left-0 right-0 top-[66%] h-3 bg-white" />
          <div className="absolute top-0 bottom-0 left-[28%] w-3.5 bg-white" />
          <div className="absolute top-0 bottom-0 left-[70%] w-4 bg-white" />
          <div className="absolute left-[8%] top-[38%] w-16 h-16 bg-line rounded-xl" />
          <div className="absolute left-[40%] top-[12%] w-20 h-16 bg-line rounded-xl" />
          <div className="absolute left-[60%] top-[72%] w-24 h-20 bg-line rounded-xl" />
        </div>

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" fill="none">
          <path
            d="M60 240 C 120 200, 160 180, 200 150 S 280 90, 330 60"
            stroke="#1E4BB8"
            strokeWidth="4"
            strokeDasharray="2 10"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute left-[15%] bottom-[18%] w-11 h-11 rounded-full bg-panel flex items-center justify-center shadow-card">
          <div className="w-4 h-4 rounded-full bg-ink" />
        </div>
        <div className="absolute right-[15%] top-[18%] flex flex-col items-center">
          <img
            src="/figma/helper-adaeze-square.png"
            alt=""
            className="w-11 h-11 rounded-full object-cover border-[3px] border-white shadow-card"
          />
          <span className="w-[3px] h-3.5 bg-brand -mt-0.5" />
        </div>

        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="absolute left-5 top-5 w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-card"
        >
          <ChevronLeft className="w-5 h-5 text-ink" />
        </button>
        <button className="absolute right-5 top-5 h-11 px-[18px] rounded-full bg-white flex items-center gap-2 shadow-card text-brand font-bold text-sm">
          <Phone className="w-4 h-4" />
          Call
        </button>
      </div>

      <div className="flex-1 flex flex-col bg-panel rounded-t-[28px] -mt-7 relative px-5 md:px-8 pt-5 pb-8">
        <div className="w-10 h-1 rounded-full bg-line mx-auto mb-4" />

        <div className="flex items-center gap-3">
          <img src="/figma/helper-adaeze-square.png" alt="" className="w-14 h-14 rounded-full object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-semibold text-xl text-ink truncate">{helperFirst} is on her way</h1>
            <div className="text-ink-soft text-sm mt-0.5">Arriving in about 6 minutes</div>
          </div>
          <button
            aria-label="Message"
            className="w-11 h-11 rounded-full bg-panel-2 flex items-center justify-center text-ink shrink-0"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#EDF2FC] rounded-card-lg p-4 mt-5">
          <span className="text-brand font-semibold text-sm">Your start code</span>
          <p className="text-ink-soft text-sm mt-1">Share this with {helperFirst} only when she's at your door.</p>
          <div className="flex gap-2 mt-3">
            {['8', '2', '1', '4'].map((d, i) => (
              <span
                key={i}
                className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-display font-semibold text-xl text-ink shadow-card"
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-panel-2 rounded-card-lg p-3.5 flex items-center gap-3 mt-4">
          <ShieldCheck className="w-5 h-5 text-ink-soft shrink-0" />
          <p className="text-ink-soft text-sm">We'll move you to the job screen automatically once she arrives.</p>
        </div>

        <div className="mt-auto pt-8">
          <button onClick={() => navigate('/request/in-progress')} className="btn btn-ghost w-full">
            Skip ahead
          </button>
        </div>
      </div>
    </FlowScreenShell>
  );
}
