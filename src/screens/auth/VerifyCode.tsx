import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { FlowHeader } from '@/components/shell/FlowHeader';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';
import { useAuthSetup } from '@/context/AuthSetupContext';

export function VerifyCode() {
  const navigate = useNavigate();
  const { phone } = useAuthSetup();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(42);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const complete = digits.every((d) => d !== '');
  const mins = Math.floor(cooldown / 60);
  const secs = String(cooldown % 60).padStart(2, '0');

  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 5) inputs.current[i + 1]?.focus();
  }

  function submit() {
    if (complete) navigate('/name');
  }

  return (
    <FlowScreenShell>
      <FlowHeader />
      <div className="px-5 md:px-8 pt-2 flex-1 flex flex-col">
        <h1 className="font-display font-semibold text-[28px] leading-[32px] tracking-[-0.0286em] text-ink">
          Enter the 6-digit code
        </h1>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-ink-soft text-base">Sent to +234 {phone || '803 456 7890'}</span>
          <button onClick={() => navigate('/phone')} className="text-brand font-semibold text-base">
            Change
          </button>
        </div>

        <div className="flex gap-2 mt-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              inputMode="numeric"
              maxLength={1}
              autoFocus={i === 0}
              className={`flex-1 min-w-0 h-14 text-center text-xl font-display font-semibold bg-white rounded-2xl text-ink outline-none border ${
                i === digits.findIndex((x) => x === '') || (complete && i === 5) ? 'border-2 border-brand' : 'border-line'
              }`}
            />
          ))}
        </div>

        <div className="mt-6">
          <p className="text-ink-soft text-sm">
            {cooldown > 0 ? `Didn't get it? Resend in ${mins}:${secs}` : "Didn't get it?"}
          </p>
          {cooldown === 0 && (
            <button onClick={() => setCooldown(42)} className="text-brand font-semibold text-sm mt-1">
              Resend code
            </button>
          )}
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 px-[18px] h-11 rounded-full bg-panel-2 text-ink text-sm font-bold"
          >
            <MessageCircle className="w-4 h-4" />
            Send code by WhatsApp instead
          </button>
        </div>

        <div className="mt-auto pb-8 pt-8">
          <button onClick={submit} disabled={!complete} className="btn btn-primary w-full disabled:opacity-40">
            Verify
          </button>
        </div>
      </div>
    </FlowScreenShell>
  );
}
