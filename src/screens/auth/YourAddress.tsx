import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Navigation, Search, Home as HomeIcon, Briefcase } from 'lucide-react';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';
import { useAuthSetup } from '@/context/AuthSetupContext';

const SAVE_AS = ['Home', 'Work', 'Other'] as const;

export function YourAddress() {
  const navigate = useNavigate();
  const { setAddress } = useAuthSetup();
  const [line, setLine] = useState('12 Admiralty Way, Lekki Phase 1, Lagos');
  const [landmark, setLandmark] = useState('');
  const [saveAs, setSaveAs] = useState<(typeof SAVE_AS)[number]>('Home');
  const [locating, setLocating] = useState(false);

  function useMyLocation() {
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      () => setLocating(false),
      () => setLocating(false),
      { timeout: 4000 }
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setAddress(saveAs, line);
    navigate('/home');
  }

  return (
    <FlowScreenShell>
      <div className="relative h-[280px] md:h-[320px] bg-panel-2 overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute left-0 right-0 top-[36%] h-4 bg-white" />
          <div className="absolute left-0 right-0 top-[71%] h-3 bg-white" />
          <div className="absolute top-0 bottom-0 left-[31%] w-3.5 bg-white" />
          <div className="absolute top-0 bottom-0 left-[73%] w-4 bg-white" />
          <div className="absolute left-[5%] top-[43%] w-20 h-20 bg-line rounded-xl" />
          <div className="absolute left-[38%] top-[42%] w-24 h-24 bg-line rounded-xl" />
          <div className="absolute left-[38%] top-[76%] w-24 h-20 bg-line rounded-xl" />
          <div className="absolute left-[79%] top-[79%] w-16 h-16 bg-line rounded-xl" />
        </div>
        <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center shadow-card">
            <HomeIcon className="w-[22px] h-[22px] text-white" />
          </div>
          <span className="w-[3px] h-3.5 bg-brand -mt-0.5" />
        </div>

        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="absolute left-5 top-5 w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-card"
        >
          <ChevronLeft className="w-5 h-5 text-ink" />
        </button>
        <button
          onClick={useMyLocation}
          className="absolute right-5 top-5 h-11 px-[18px] rounded-full bg-white flex items-center gap-2 shadow-card text-brand font-bold text-sm"
        >
          <Navigation className="w-4 h-4" />
          {locating ? 'Locating…' : 'Use my location'}
        </button>
      </div>

      <form onSubmit={submit} className="flex-1 flex flex-col bg-panel rounded-t-[28px] -mt-7 relative px-5 md:px-8 pt-3 pb-8">
        <div className="w-10 h-1 rounded-full bg-line mx-auto mb-4" />
        <h1 className="font-display font-semibold text-[22px] leading-[28px] tracking-[-0.0182em] text-ink">
          Where do you need help?
        </h1>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-ink">Address</span>
          <div className="mt-2 flex items-center gap-2.5 bg-white border border-line rounded-2xl px-4 h-14 focus-within:border-brand focus-within:border-2">
            <Search className="w-4 h-4 text-ink-faint shrink-0" />
            <input
              type="text"
              required
              value={line}
              onChange={(e) => setLine(e.target.value)}
              className="flex-1 bg-transparent outline-none text-ink"
            />
          </div>
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-ink">Landmark or directions</span>
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="Opposite Mega Chicken, black gate"
            className="mt-2 w-full bg-white border border-line rounded-2xl px-4 h-14 outline-none text-ink placeholder:text-ink-faint focus:border-brand focus:border-2"
          />
          <span className="text-xs text-ink-soft mt-1.5 block">
            Lagos addresses can be tricky — this helps your helper find you.
          </span>
        </label>

        <div className="flex gap-2 mt-4">
          {SAVE_AS.map((label) => (
            <button
              type="button"
              key={label}
              onClick={() => setSaveAs(label)}
              className={`inline-flex items-center gap-1.5 px-4 h-11 rounded-full text-sm font-bold border transition ${
                saveAs === label ? 'bg-brand border-brand text-white' : 'bg-white border-line text-ink'
              }`}
            >
              {label === 'Home' && <HomeIcon className="w-4 h-4" />}
              {label === 'Work' && <Briefcase className="w-4 h-4" />}
              {label}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <button type="submit" className="btn btn-primary w-full">
            Save address
          </button>
        </div>
      </form>
    </FlowScreenShell>
  );
}
