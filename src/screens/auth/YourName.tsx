import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowHeader } from '@/components/shell/FlowHeader';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';
import { useAuthSetup } from '@/context/AuthSetupContext';

export function YourName() {
  const navigate = useNavigate();
  const { firstName, lastName, email, setNameFields } = useAuthSetup();
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [mail, setMail] = useState(email);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setNameFields(first, last, mail);
    navigate('/address');
  }

  return (
    <FlowScreenShell>
      <FlowHeader />
      <form onSubmit={submit} className="px-5 md:px-8 pt-2 flex-1 flex flex-col">
        <h1 className="font-display font-semibold text-[28px] leading-[32px] tracking-[-0.0286em] text-ink">
          What should we call you?
        </h1>
        <p className="text-ink-soft text-base mt-2">Helpers see your first name only.</p>

        <label className="mt-6 block">
          <span className="text-sm font-semibold text-ink">First name</span>
          <input
            type="text"
            required
            autoFocus
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            placeholder="Tolu"
            className="mt-2 w-full bg-white border-2 border-brand rounded-2xl px-4 h-14 outline-none text-ink placeholder:text-ink-faint"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-ink">Last name</span>
          <input
            type="text"
            required
            value={last}
            onChange={(e) => setLast(e.target.value)}
            placeholder="Adeyemi"
            className="mt-2 w-full bg-white border border-line rounded-2xl px-4 h-14 outline-none text-ink placeholder:text-ink-faint focus:border-brand focus:border-2"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-ink">Email (optional)</span>
          <input
            type="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full bg-white border border-line rounded-2xl px-4 h-14 outline-none text-ink placeholder:text-ink-faint focus:border-brand focus:border-2"
          />
          <span className="text-xs text-ink-soft mt-1.5 block">For receipts only. You can add it later.</span>
        </label>

        <div className="mt-auto pb-8 pt-8">
          <button type="submit" disabled={!first || !last} className="btn btn-primary w-full disabled:opacity-40">
            Continue
          </button>
        </div>
      </form>
    </FlowScreenShell>
  );
}
