import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { FlowHeader } from '@/components/shell/FlowHeader';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';
import { useAuthSetup } from '@/context/AuthSetupContext';

export function Phone() {
  const navigate = useNavigate();
  const { phone, setPhone } = useAuthSetup();
  const [value, setValue] = useState(phone);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setPhone(value);
    navigate('/verify');
  }

  return (
    <FlowScreenShell>
      <FlowHeader />
      <form onSubmit={submit} className="px-5 md:px-8 pt-2 flex-1 flex flex-col">
        <div className="w-[52px] h-[52px] rounded-2xl bg-brand flex items-center justify-center text-white font-black font-display text-lg">
          UH
        </div>

        <h1 className="font-display font-semibold text-[28px] leading-[32px] tracking-[-0.0286em] text-ink mt-6">
          What's your phone number?
        </h1>
        <p className="text-ink-soft text-base mt-2">
          We'll text you a 6-digit code to confirm it's really you.
        </p>

        <label className="mt-6 block">
          <span className="text-sm font-semibold text-ink">Phone number</span>
          <div className="mt-2 flex items-center gap-2.5 bg-white border-2 border-brand rounded-2xl px-4 h-14">
            <span className="text-ink font-semibold">+234</span>
            <span className="w-px h-6 bg-line" />
            <input
              type="tel"
              required
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
              placeholder="803 456 7890"
              className="flex-1 bg-transparent outline-none text-ink placeholder:text-ink-faint"
            />
          </div>
        </label>

        <div className="flex items-center gap-2.5 mt-4">
          <Lock className="w-[18px] h-[18px] text-ink-soft shrink-0" />
          <p className="text-ink-soft text-sm">Helpers only see your number after you book.</p>
        </div>

        <div className="mt-auto pb-8 pt-8">
          <button type="submit" disabled={value.length < 10} className="btn btn-primary w-full disabled:opacity-40">
            Send code
          </button>
          <p className="text-center text-xs text-ink-faint mt-3">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </form>
    </FlowScreenShell>
  );
}
