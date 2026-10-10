# Urgent Help — Web Prototype

Frontend prototype of the Urgent Help customer app, built in React against
the "Urgent Help" canvas of the Figma design file (fileKey
`i4pipHNVS1GclySydJFCDi`, onboarding concept C / immersive). This replaces
the earlier Next.js full-stack implementation that used to live in this
repo (see "History" below) — there is currently **no backend**: every
screen renders from local mock data in `src/mocks/` and `src/data/`.

---

## Stack

- Vite + React 18 + TypeScript
- React Router (`src/router.tsx`) for the screen flow
- Tailwind CSS, design tokens in `tailwind.config.ts`
- Framer Motion for transitions, Swiper for the onboarding carousel
- Lucide for icons

## Running it

```bash
npm install
npm run dev        # starts the Vite dev server
npm run typecheck  # tsc --noEmit
npm run build       # production build
```

## What's built

All screens are mocked (no auth, no API calls, no persistence beyond
in-memory React context) but fully click-through:

**Get started**
Splash → Onboarding (3-slide concept C carousel) → Phone → Verify code →
Your name → Your address

**Book a service** (`src/screens/request/`)
Home (dashboard) → Job details → When & where → Fair price → Finding
helpers → Offers → Helper profile → Review & pay → Booking confirmed →
Tracking → Job in progress → Job done → Rate helper

Booking state (selected helper, date/time, job details) flows through
`BookingRequestContext`; auth/profile fields (name, phone, address) flow
through `AuthSetupContext`. Both are in-memory only — a refresh resets them.

## Responsive behavior

The Figma file only designs a 390px mobile frame for every screen, so the
desktop/tablet treatment is a net-new addition on top of it, not something
pulled from Figma:

- **Mobile (< 768px):** full-bleed, matches the Figma frame exactly.
- **Tablet (768–1023px):** centered "floating phone" card.
- **Desktop (≥ 1024px):** two-pane layout — a persistent brand panel on the
  left, screen content in a readable column on the right with its own
  scroll (`src/components/shell/FlowScreenShell.tsx`).

`Home` and the rest of the dashboard-style screens use `AppShell.tsx`
instead — a left sidebar on desktop, a bottom pill nav on mobile.

## Known gaps

- No helper-side ("Give Help") screens yet.
- No admin panel in this prototype (the old Next.js app had one — see
  History).
- No backend: pricing, matching, payments, and messaging are all static
  mock data, not live logic.
- The onboarding carousel's floating assistant ("A") bubble seen in some
  Figma frames isn't implemented yet — the designer has pending edits to
  that element.

## History

This repo previously held a production Next.js implementation (Supabase
Postgres + RLS, real AI matching/pricing with fallbacks, Paystack/
Flutterwave payments, an admin panel, atomic wallet operations, etc.). That
implementation was removed in favor of this Figma-accurate frontend
prototype; it's still recoverable from git history prior to the prototype's
introduction if it's ever needed as a reference.
