import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { BadgeCheck, Star, Lock } from 'lucide-react';
import { FlowScreenShell } from '@/components/shell/FlowScreenShell';
import 'swiper/css';
import 'swiper/css/pagination';

export function Onboarding() {
  const navigate = useNavigate();
  const swiperRef = useRef<SwiperType | null>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === 2;

  function next() {
    if (isLast) navigate('/phone');
    else swiperRef.current?.slideNext();
  }

  return (
    <FlowScreenShell>
      <div className="flex items-center justify-between px-5 md:px-8 pt-6 pb-2">
        <div className="flex items-center gap-2.5 font-bold text-ink text-[17px] font-display">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-black text-sm">
            UH
          </div>
          Urgent Help
        </div>
        <button onClick={() => navigate('/phone')} className="text-ink-soft font-semibold text-sm px-2 py-2.5">
          Skip
        </button>
      </div>

      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true, el: '.onboarding-dots' }}
        onSwiper={(s) => (swiperRef.current = s)}
        onSlideChange={(s) => setIndex(s.activeIndex)}
        className="w-full"
      >
        <SwiperSlide className="px-5 md:px-8">
          <div className="rounded-card-lg overflow-hidden bg-panel-2 h-[340px] relative flex flex-col justify-end p-3.5">
            <img src="/figma/onboarding-1-helper-door.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="relative bg-white rounded-[20px] p-3 flex items-center gap-3 shadow-card">
              <img src="/figma/onboarding-1-adaeze.png" alt="" className="w-11 h-11 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-ink text-base">Adaeze O.</span>
                  <BadgeCheck className="w-4 h-4 text-brand" />
                </div>
                <div className="text-xs text-ink-soft mt-0.5">ID and face checked · 212 jobs</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-sm text-ink">4.9</span>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <h1 className="font-display font-semibold text-[28px] leading-[32px] tracking-[-0.0286em] text-ink">
              Verified helpers, close to home
            </h1>
            <p className="text-ink-soft text-base mt-2.5">
              Every cleaner, plumber and electrician is ID-checked and reviewed by neighbours like you.
            </p>
          </div>
        </SwiperSlide>

        <SwiperSlide className="px-5 md:px-8">
          <div className="rounded-card-lg overflow-hidden bg-panel-2 h-[340px] relative flex flex-col justify-end p-3.5">
            <img src="/figma/onboarding-2-kitchen.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="relative bg-white rounded-[20px] p-4 flex flex-col gap-2 shadow-card">
              <span className="text-xs text-ink-soft">Fair price · Deep clean, 3 bed</span>
              <span className="font-display font-semibold text-xl text-ink">₦18,000 – ₦24,000</span>
              <span className="h-2 rounded-pill bg-panel-2 block" />
            </div>
          </div>
          <div className="mt-5">
            <h1 className="font-display font-semibold text-[28px] leading-[32px] tracking-[-0.0286em] text-ink">
              Know the fair price before you book
            </h1>
            <p className="text-ink-soft text-base mt-2.5">
              We show a fair range upfront. Helpers can adjust a little — never more than 30%.
            </p>
          </div>
        </SwiperSlide>

        <SwiperSlide className="px-5 md:px-8">
          <div className="rounded-card-lg overflow-hidden bg-panel-2 h-[340px] relative flex flex-col justify-end p-3.5">
            <img src="/figma/onboarding-3-livingroom.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="relative bg-white rounded-[20px] p-3.5 flex items-center gap-3 shadow-card">
              <div className="w-11 h-11 rounded-full bg-[#EDF2FC] flex items-center justify-center shrink-0">
                <Lock className="w-[22px] h-[22px] text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink text-base">₦22,300 held safely</div>
                <div className="text-xs text-ink-soft mt-0.5">Released when you confirm</div>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <h1 className="font-display font-semibold text-[28px] leading-[32px] tracking-[-0.0286em] text-ink">
              Pay safely. Release it when it's done.
            </h1>
            <p className="text-ink-soft text-base mt-2.5">
              We hold your money until you're happy with the job. Prefer cash? That's allowed too.
            </p>
          </div>
        </SwiperSlide>
      </Swiper>

      <div className="onboarding-dots flex items-center justify-center gap-1.5 py-4" />

      <div className="px-5 md:px-8 pb-8 pt-2 flex flex-col gap-2.5">
        <button onClick={next} className="btn btn-primary w-full">
          {isLast ? 'Get started' : 'Next'}
        </button>
        {isLast && (
          <button onClick={() => navigate('/phone')} className="btn btn-ghost w-full">
            I already have an account
          </button>
        )}
      </div>
    </FlowScreenShell>
  );
}
