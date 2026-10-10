import { useNavigate } from 'react-router-dom';
import { Info, Sparkles, Star, BadgeCheck, RefreshCw } from 'lucide-react';
import { useBookingRequest } from '@/context/BookingRequestContext';
import { HELPER_OFFERS } from '@/mocks/helperOffers';
import type { MatchCandidate } from '@/types';

function StepHeader() {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-5 md:px-8 pt-4 pb-1 max-w-5xl mx-auto w-full">
      <button
        onClick={() => navigate(-1)}
        aria-label="Back"
        className="w-11 h-11 rounded-full bg-panel border border-line flex items-center justify-center text-ink shrink-0"
      >
        ←
      </button>
      <div className="text-center">
        <div className="font-display font-semibold text-[18px] tracking-[-0.0111em] text-ink">Your offers</div>
        <div className="text-xs text-ink-soft font-medium">Deep clean · Sat 4 Oct</div>
      </div>
      <span className="w-11 h-11 shrink-0" />
    </header>
  );
}

export function Offers() {
  return (
    <div className="min-h-screen bg-surface">
      <StepHeader />
      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-3 pb-10">
        <div className="bg-[#EDF2FC] rounded-card-lg p-3.5 flex items-center gap-3">
          <Info className="w-5 h-5 text-brand shrink-0" />
          <div>
            <div className="font-semibold text-sm text-brand">Fair price: ₦18,000 – ₦24,000</div>
            <div className="text-xs text-ink-soft mt-0.5">Offers are held for 9:52. Prices can't change once you choose.</div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {HELPER_OFFERS.map((offer, i) => (
            <OfferCard key={offer.helper_id} offer={offer} best={i === 0} />
          ))}
        </div>

        <div className="flex justify-center mt-5">
          <button className="h-11 px-[18px] rounded-full border border-line bg-panel text-brand text-sm font-bold flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Ask for more offers
          </button>
        </div>
      </div>
    </div>
  );
}

function priceNote(offer: MatchCandidate) {
  if (offer.price_quote > 24000) {
    const pct = Math.round(((offer.price_quote - 21000) / 21000) * 100);
    return { text: `${pct}% above fair range`, className: 'text-amber-700' };
  }
  return { text: 'Within fair range', className: 'text-brand' };
}

function OfferCard({ offer, best }: { offer: MatchCandidate; best: boolean }) {
  const navigate = useNavigate();
  const { selectHelper } = useBookingRequest();
  const note = priceNote(offer);

  function choose() {
    selectHelper(offer);
    navigate('/request/review');
  }
  function view() {
    selectHelper(offer);
    navigate(`/request/helper/${offer.helper_id}`);
  }

  return (
    <div className={`bg-panel rounded-card-lg p-4 ${best ? 'border-2 border-brand' : 'border border-line'}`}>
      {best && (
        <span className="inline-flex items-center gap-1 bg-[#EDF2FC] text-brand text-xs font-medium px-2 h-6 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Best match for you
        </span>
      )}
      <div className="flex items-center gap-3">
        <img src={offer.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-ink text-base truncate">{offer.display_name}</span>
            {offer.verified && <BadgeCheck className="w-4 h-4 text-brand shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-sm text-ink-soft mt-0.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            {offer.rating} · {offer.jobs_completed} jobs
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-0.5">
            {offer.distance_km} km · arrives in {offer.eta_minutes} min
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div>
          <div className="font-display font-semibold text-xl text-ink">₦{offer.price_quote.toLocaleString()}</div>
          <div className={`text-xs font-medium ${note.className}`}>{note.text}</div>
        </div>
        {best ? (
          <button onClick={choose} className="h-11 px-[18px] rounded-full bg-brand text-white text-sm font-bold">
            Choose
          </button>
        ) : (
          <button onClick={view} className="h-11 px-[18px] rounded-full bg-panel-2 text-ink text-sm font-bold">
            View
          </button>
        )}
      </div>
    </div>
  );
}
