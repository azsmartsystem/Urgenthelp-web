import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Check, Camera } from 'lucide-react';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';
import { useBookingRequest, type CleanType } from '@/context/BookingRequestContext';

const CLEAN_TYPES: { id: CleanType; name: string; desc: string }[] = [
  { id: 'standard', name: 'Standard clean', desc: 'Tidy up, dust, floors, kitchen and bathroom surfaces' },
  { id: 'deep', name: 'Deep clean', desc: 'Everything in standard, plus inside cabinets, appliances and scrubbing' },
  { id: 'move', name: 'Move-in or move-out', desc: 'An empty home, cleaned top to bottom' },
];
const BEDROOMS = ['Studio', '1', '2', '3', '4+'];
const EXTRAS = ['Inside fridge', 'Inside oven', 'Balcony', 'Windows'];

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
        <div className="text-xs text-ink-soft font-medium">Step 1 of 3</div>
      </div>
      <span className="w-11 h-11 shrink-0" />
    </header>
  );
}

export function JobDetails() {
  const navigate = useNavigate();
  const { cleanType, bedrooms, bathrooms, extras, photoCount, setJobDetails } = useBookingRequest();

  function toggleExtra(e: string) {
    setJobDetails({ extras: extras.includes(e) ? extras.filter((x) => x !== e) : [...extras, e] });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate('/request/when-and-where');
  }

  return (
    <FlowScreenShell>
      <StepHeader />
      <form onSubmit={submit} className="px-5 md:px-8 pt-4 flex-1 flex flex-col">
        <div className="flex gap-1.5">
          <span className="flex-1 h-1 rounded-pill bg-brand" />
          <span className="flex-1 h-1 rounded-pill bg-line" />
          <span className="flex-1 h-1 rounded-pill bg-line" />
        </div>

        <h2 className="font-display font-semibold text-lg text-ink mt-6">Type of clean</h2>
        <div className="flex flex-col gap-2.5 mt-3">
          {CLEAN_TYPES.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setJobDetails({ cleanType: t.id })}
              className={`flex items-center gap-3 p-4 rounded-card border text-left transition ${
                cleanType === t.id ? 'border-2 border-brand bg-panel' : 'border-line bg-panel'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink text-base">{t.name}</div>
                <div className="text-ink-soft text-sm mt-0.5">{t.desc}</div>
              </div>
              <span
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  cleanType === t.id ? 'border-brand' : 'border-line'
                }`}
              >
                {cleanType === t.id && <span className="w-3 h-3 rounded-full bg-brand" />}
              </span>
            </button>
          ))}
        </div>

        <h2 className="font-display font-semibold text-lg text-ink mt-6">Bedrooms</h2>
        <div className="flex flex-wrap gap-2 mt-3">
          {BEDROOMS.map((b) => (
            <button
              type="button"
              key={b}
              onClick={() => setJobDetails({ bedrooms: b })}
              className={`h-11 px-4 rounded-full text-sm font-bold border transition ${
                bedrooms === b ? 'bg-brand border-brand text-white' : 'bg-panel border-line text-ink'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <h2 className="font-display font-semibold text-lg text-ink mt-6">Bathrooms</h2>
        <div className="flex items-center gap-4 mt-3">
          <button
            type="button"
            onClick={() => setJobDetails({ bathrooms: Math.max(1, bathrooms - 1) })}
            className="w-10 h-10 rounded-full bg-panel border border-line flex items-center justify-center text-ink"
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="font-display font-semibold text-xl text-ink w-6 text-center">{bathrooms}</span>
          <button
            type="button"
            onClick={() => setJobDetails({ bathrooms: bathrooms + 1 })}
            className="w-10 h-10 rounded-full bg-panel border border-line flex items-center justify-center text-ink"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-6">
          <h2 className="font-display font-semibold text-lg text-ink">Extras</h2>
          <span className="text-xs text-ink-soft">Optional</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {EXTRAS.map((e) => {
            const active = extras.includes(e);
            return (
              <button
                type="button"
                key={e}
                onClick={() => toggleExtra(e)}
                className={`h-11 px-4 rounded-full text-sm font-bold border flex items-center gap-1.5 transition ${
                  active ? 'bg-brand border-brand text-white' : 'bg-panel border-line text-ink'
                }`}
              >
                {active && <Check className="w-3.5 h-3.5" />}
                {e}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-6">
          <h2 className="font-display font-semibold text-lg text-ink">Photos</h2>
          <span className="text-xs text-ink-soft">Optional</span>
        </div>
        <div className="flex gap-2 mt-3">
          {photoCount > 0 && (
            <div className="w-20 h-20 rounded-2xl bg-panel-2 overflow-hidden">
              <img src="/figma/onboarding-2-kitchen.png" alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <button
            type="button"
            onClick={() => setJobDetails({ photoCount: photoCount + 1 })}
            className="w-20 h-20 rounded-2xl border border-dashed border-line bg-panel flex flex-col items-center justify-center gap-1 text-brand"
          >
            <Camera className="w-[22px] h-[22px]" />
            <span className="text-xs font-semibold">Add</span>
          </button>
        </div>
        <p className="text-xs text-ink-soft mt-2.5">Photos help helpers make accurate offers.</p>

        <div className="mt-auto pb-8 pt-8">
          <button type="submit" className="btn btn-primary w-full">
            Continue
          </button>
        </div>
      </form>
    </FlowScreenShell>
  );
}
