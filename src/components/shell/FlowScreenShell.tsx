import type { ReactNode } from 'react';

// Shared responsive wrapper for every onboarding/auth/booking-wizard screen.
// Figma only designs a 390px mobile frame for these, so below lg we reuse
// that frame as-is: full-bleed on mobile, a centered "floating phone" card
// on md/tablet (there isn't enough width yet for a second pane). From lg up
// we stop floating a tiny card in an empty page and switch to a two-pane
// layout — a persistent brand panel on the left, the screen content
// scrolling independently on the right at a readable column width. This is
// the one deliberate net-new desktop pattern reused across all of them for
// consistency.
export function FlowScreenShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface lg:flex lg:h-screen">
      <div className="hidden lg:flex lg:w-[38%] xl:w-[34%] lg:shrink-0 lg:flex-col lg:justify-between bg-brand relative overflow-hidden p-10 xl:p-14">
        <div className="relative z-10 flex items-center gap-2.5 text-white font-bold text-lg font-display">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-black text-sm">UH</div>
          Urgent Help
        </div>
        <div className="relative z-10">
          <h2 className="font-display font-semibold text-[32px] xl:text-[40px] leading-[1.1] tracking-[-0.02em] text-white max-w-sm">
            Trusted help, right when you need it
          </h2>
          <p className="text-white/80 text-base mt-3 max-w-xs">
            Verified cleaners, plumbers and electricians — booked in minutes, paid safely.
          </p>
        </div>
        <span className="absolute -right-28 -bottom-28 w-[420px] h-[420px] rounded-full border border-white/10" />
        <span className="absolute -right-10 -bottom-10 w-[260px] h-[260px] rounded-full border border-white/10" />
      </div>

      <div className="flex flex-col md:items-center md:justify-center lg:block lg:flex-1 lg:h-screen lg:overflow-y-auto">
        <div className="w-full flex-1 md:flex-none flex flex-col md:max-w-[420px] md:max-h-[85vh] md:rounded-card-lg md:shadow-lg2 md:border md:border-line md:bg-panel md:overflow-y-auto lg:max-w-[480px] lg:mx-auto lg:my-10 lg:flex-none lg:max-h-none lg:overflow-visible lg:rounded-none lg:shadow-none lg:border-0 lg:bg-surface">
          {children}
        </div>
      </div>
    </div>
  );
}
