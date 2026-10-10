import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export function FlowHeader({ title, step, totalSteps }: { title?: string; step?: number; totalSteps?: number }) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-5 md:px-8 pt-4 pb-1">
      <button
        onClick={() => navigate(-1)}
        aria-label="Back"
        className="w-11 h-11 rounded-full bg-panel border border-line flex items-center justify-center text-ink shrink-0"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      {title && <h1 className="font-bold text-ink text-base">{title}</h1>}
      {step && totalSteps ? (
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-pill transition-all ${
                i < step ? 'w-6 bg-brand' : 'w-3 bg-panel-2'
              }`}
            />
          ))}
        </div>
      ) : (
        <span className="w-11 h-11 shrink-0" />
      )}
    </header>
  );
}
