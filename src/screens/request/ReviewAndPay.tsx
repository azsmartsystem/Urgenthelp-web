import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, Banknote, ShieldCheck, Lock } from 'lucide-react';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';
import { useBookingRequest } from '@/context/BookingRequestContext';

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
      <div className="font-display font-semibold text-[18px] tracking-[-0.0111em] text-ink">Review and pay</div>
      <span className="w-11 h-11 shrink-0" />
    </header>
  );
}

export function ReviewAndPay() {
  const navigate = useNavigate();
  const { selectedHelper, selectedDate, selectedTime } = useBookingRequest();
  const [method, setMethod] = useState<'card' | 'wallet'>('card');
  const [paying, setPaying] = useState(false);

  const helperName = selectedHelper?.display_name ?? 'Adaeze';
  const servicePrice = selectedHelper?.price_quote ?? 21500;
  const protection = 800;
  const total = servicePrice + protection;

  function pay() {
    setPaying(true);
    setTimeout(() => navigate('/request/confirmed'), 900);
  }

  return (
    <FlowScreenShell>
      <StepHeader />
      <div className="px-5 md:px-8 pt-4 flex-1 flex flex-col">
        <div className="bg-panel border border-line rounded-card-lg p-4 flex items-center gap-3">
          <img src="/figma/helper-adaeze-square.png" alt="" className="w-14 h-14 rounded-full object-cover shrink-0" />
          <div className="min-w-0">
            <div className="font-semibold text-ink text-base truncate">Deep clean with {helperName.split(' ')[0]}</div>
            <div className="text-ink-soft text-sm mt-0.5">
              {selectedDate || 'Sat 4 Oct'} · {selectedTime || '9:00 AM'} · about 4 hrs
            </div>
            <div className="text-ink-soft text-sm">12 Admiralty Way, Lekki Phase 1</div>
          </div>
        </div>

        <h2 className="font-display font-semibold text-lg text-ink mt-6">Pay with</h2>
        <div className="flex flex-col gap-2.5 mt-3">
          <button
            type="button"
            onClick={() => setMethod('card')}
            className={`flex items-center gap-3 p-4 rounded-card-lg border text-left ${
              method === 'card' ? 'border-2 border-brand bg-panel' : 'border-line bg-panel'
            }`}
          >
            <span className="w-10 h-10 rounded-full bg-[#EDF2FC] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-brand" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-semibold text-ink text-base">Card or bank transfer</span>
              <span className="block text-ink-soft text-sm">Visa •••• 4821</span>
            </span>
            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${method === 'card' ? 'border-brand' : 'border-line'}`}>
              {method === 'card' && <span className="w-3 h-3 rounded-full bg-brand" />}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('wallet')}
            className={`flex items-center gap-3 p-4 rounded-card-lg border text-left ${
              method === 'wallet' ? 'border-2 border-brand bg-panel' : 'border-line bg-panel'
            }`}
          >
            <span className="w-10 h-10 rounded-full bg-panel-2 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-ink-soft" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-semibold text-ink text-base">Urgent Help wallet</span>
              <span className="block text-ink-soft text-sm">Balance ₦5,200 — not enough</span>
            </span>
            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${method === 'wallet' ? 'border-brand' : 'border-line'}`}>
              {method === 'wallet' && <span className="w-3 h-3 rounded-full bg-brand" />}
            </span>
          </button>

          <button type="button" className="flex items-center gap-2 text-brand font-semibold text-sm self-start">
            <Banknote className="w-[18px] h-[18px]" />
            Pay cash instead
          </button>
        </div>

        <div className="bg-panel border border-line rounded-card-lg p-4 mt-6">
          <div className="flex justify-between text-sm">
            <span className="text-ink-soft">Service (Adaeze's offer)</span>
            <span className="font-semibold text-ink">₦{servicePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-3">
            <span className="text-ink-soft">Service protection</span>
            <span className="font-semibold text-ink">₦{protection.toLocaleString()}</span>
          </div>
          <div className="h-px bg-line my-3" />
          <div className="flex justify-between">
            <span className="font-semibold text-ink text-base">Total</span>
            <span className="font-display font-semibold text-xl text-ink">₦{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-[#EDF2FC] rounded-card-lg p-3.5 flex items-center gap-3 mt-4">
          <ShieldCheck className="w-[22px] h-[22px] text-brand shrink-0" />
          <div>
            <div className="font-semibold text-sm text-brand">Your money is protected</div>
            <div className="text-xs text-ink-soft mt-0.5">
              We only pay {helperName.split(' ')[0]} after you confirm the job is done. If something goes wrong, you get it back.
            </div>
          </div>
        </div>

        <div className="mt-auto pb-8 pt-8">
          <button onClick={pay} disabled={paying} className="btn btn-primary w-full disabled:opacity-60 gap-2">
            <Lock className="w-[18px] h-[18px]" />
            {paying ? 'Processing…' : `Pay ₦${total.toLocaleString()}`}
          </button>
        </div>
      </div>
    </FlowScreenShell>
  );
}
