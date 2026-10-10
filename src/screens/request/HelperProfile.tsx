import { useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ChevronLeft, Heart, BadgeCheck, Check, Star } from 'lucide-react';
import { findHelperProfile } from '@/mocks/helperProfile';

export function HelperProfile() {
  const { helperId } = useParams();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const helper = helperId ? findHelperProfile(helperId) : null;

  if (!helper) return <Navigate to="/request/offers" replace />;

  return (
    <div className="min-h-screen bg-surface md:flex md:items-center md:justify-center md:py-10">
      <div className="bg-panel w-full md:max-w-3xl md:max-h-[85vh] md:rounded-card-lg md:shadow-lg2 md:border md:border-line overflow-y-auto">
        <div className="relative">
          <img
            src={helper.avatar_url}
            alt=""
            className="w-full h-[280px] md:h-[320px] object-cover"
          />
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="absolute left-5 top-5 w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-card"
          >
            <ChevronLeft className="w-5 h-5 text-ink" />
          </button>
          <button
            onClick={() => setSaved((s) => !s)}
            aria-label="Save helper"
            className="absolute right-5 top-5 w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-card"
          >
            <Heart className={`w-5 h-5 ${saved ? 'fill-rose-500 text-rose-500' : 'text-ink'}`} />
          </button>
        </div>

        <div className="rounded-t-[28px] -mt-7 relative bg-panel px-5 md:px-8 pt-6 pb-32 md:pb-28 md:grid md:grid-cols-[1fr_280px] md:gap-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-semibold text-[28px] text-ink">{helper.display_name}</h1>
              <BadgeCheck className="w-[22px] h-[22px] text-brand shrink-0" />
            </div>
            <p className="text-ink-soft text-sm mt-1">{helper.bio}</p>

            <div className="grid grid-cols-3 gap-2 mt-5 md:max-w-sm">
              <div className="bg-surface rounded-2xl py-3.5 text-center">
                <div className="font-display font-semibold text-xl text-ink">{helper.rating}</div>
                <div className="text-xs text-ink-soft mt-0.5">Rating</div>
              </div>
              <div className="bg-surface rounded-2xl py-3.5 text-center">
                <div className="font-display font-semibold text-xl text-ink">{helper.jobs_completed}</div>
                <div className="text-xs text-ink-soft mt-0.5">Jobs done</div>
              </div>
              <div className="bg-surface rounded-2xl py-3.5 text-center">
                <div className="font-display font-semibold text-xl text-ink">{helper.onTimePercent}%</div>
                <div className="text-xs text-ink-soft mt-0.5">On time</div>
              </div>
            </div>

            <h2 className="font-display font-semibold text-lg text-ink mt-6">Checked by Urgent Help</h2>
            <div className="flex flex-col divide-y divide-line mt-2">
              {helper.verificationChecks.map((c) => (
                <div key={c} className="flex items-center gap-2.5 py-2.5">
                  <span className="w-[22px] h-[22px] rounded-full bg-[#EDF2FC] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-brand" />
                  </span>
                  <span className="text-ink text-base">{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-[#EDF2FC] rounded-card-lg p-4 mt-6 md:mt-0">
              <span className="text-brand font-semibold text-sm">Her offer</span>
              <div className="font-display font-semibold text-[32px] text-ink mt-1">
                ₦{helper.price_quote.toLocaleString()}
              </div>
              <p className="text-ink-soft text-sm mt-1">Within your fair range. Includes cleaning supplies.</p>
            </div>

            <div className="flex items-center justify-between mt-6">
              <h2 className="font-display font-semibold text-lg text-ink">Reviews</h2>
              <button className="text-brand font-semibold text-sm">See all 164</button>
            </div>
            <div className="flex flex-col gap-3 mt-3">
              {helper.reviews.map((r, i) => (
                <div key={i} className="bg-surface rounded-card p-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-ink text-sm mt-2">{r.comment}</p>
                  <span className="text-ink-faint text-xs mt-1.5 block">{r.author}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed md:sticky bottom-0 left-0 right-0 bg-panel border-t border-line px-5 md:px-8 py-3 flex items-center gap-4">
          <div>
            <div className="font-display font-semibold text-xl text-ink">₦{helper.price_quote.toLocaleString()}</div>
            <div className="text-ink-soft text-xs">Held until done</div>
          </div>
          <button
            onClick={() => navigate('/request/review')}
            className="btn btn-primary flex-1"
          >
            Choose {helper.display_name.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
}
