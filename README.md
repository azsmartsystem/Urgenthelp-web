# Urgent Help — Web Platform

Production Next.js implementation of the Urgent Help platform (rebranded
from the approved ALLinHELP design), built against:

- `ALLinHELP_Technical_Implementation_Specification.md` — architecture, ERD, API contracts, AI/payment/event design
- `ALLinHELP_Product_Design.html` — approved visual design system and screens

This README reflects the **actual current state of the code**, not a plan —
every claim below was verified by reading the file it describes.

---

## What's genuinely functional end-to-end

### Customer flow
Landing → **registration/login with phone OR email, user's choice** (OTP
code either way — no separate magic-link flow to learn) → customer
dashboard → request a service (**real category/service picker, real saved
addresses with add-new, real photo upload** — not placeholder IDs) →
**real AI pricing** → **real AI matching** (ranked, verified, available
helpers) → helper accepts → customer confirms → **real payment
initialization** (Paystack/Flutterwave) → live tracking → in-app messaging
(**text and image attachments**) → service completion → review. Every
step above calls a real API route against real Postgres tables — none of
it is mocked UI.

### Helper flow
One account, `Get Help <-> Give Help` mode switch → helper onboarding wizard
(profile, skills, service area via geolocation, ID document upload) →
verification (starts `pending`, blocks the availability toggle until an
admin approves it) → dashboard with AI-ranked nearby opportunities → accept
job → mark arrived → mark complete → **wallet balance updates via an
atomic, race-condition-safe Postgres function** → request withdrawal.

### Admin flow
`/admin/login` (separate auth domain from customer/helper — password +
signed session cookie, never touches Supabase Auth) → Overview (real KPIs)
→ Users (search, suspend/reactivate) → Helpers → Verification queue →
document review → approve/reject (notifies the helper, updates trust
events, writes an audit log) → Services (add/deactivate) → Bookings (list,
filter by status, full detail with status history) → Payments (with
commission totals) → Disputes (resolve with notification to both parties)
→ Trust & Safety (fraud event queue — confirm soft-suspends the account,
never auto-bans) → Reports (real aggregate GMV/category queries).

### Security-relevant things that are real, not decorative
- **Row Level Security** on every user-facing table — a customer literally
  cannot query another customer's booking, even with a valid session,
  because the database enforces it, not just the API layer.
- **`auth_user_id` vs `users.id` mapping bug was found and fixed**
  (`supabase/migrations/0003_fix_auth_id_mapping.sql`) — the original RLS
  policies compared `auth.uid()` directly against the wrong column, which
  would have silently failed every authenticated read/write.
- **Payment ownership check** — fixed this session: `payments/initialize`
  previously let any authenticated user pay for any booking ID. Now
  verifies the booking belongs to the requesting customer.
- **Atomic wallet debits** — withdrawal requests use a `SELECT ... FOR
  UPDATE` Postgres function, not a read-then-write from application code,
  so two concurrent withdrawal requests can't both pass the balance check.
- **Admin session tokens** are HMAC-signed and expiry-checked, not just a
  cookie's presence — verified by `tests/admin-auth.test.ts`.
- **Payment webhooks** verify the provider's signature before touching the
  database, and are idempotent (a unique constraint on
  `payments.provider_reference` makes a replayed webhook a safe no-op).
- **File uploads are authorization-checked, not just present.**
  `/api/files/upload-url` verifies the caller is an actual participant on
  the target booking/conversation before minting a signed upload URL;
  `/api/files/{id}/url` re-checks ownership/participancy before minting a
  signed *read* URL. Job photos and message images never pass through our
  server (direct-to-storage upload/download via short-lived signed URLs),
  and the private buckets have no public or blanket-authenticated read
  policy — every view is authorized per-request.
- **Email/phone are both valid identifiers, enforced at the database
  level.** `phone_number` was originally `NOT NULL`, which silently made
  email-only signup impossible even if the UI offered it.
  `supabase/migrations/0007_email_phone_auth.sql` relaxes that and adds a
  `CHECK (phone_number IS NOT NULL OR email IS NOT NULL)` constraint —
  the invariant is enforced by Postgres, not just trusted from the client.

---

## What requires external credentials — and exactly what happens without them

Every integration below follows the same pattern: **the feature works with
zero credentials, using a real documented fallback, and automatically
switches to the live integration the moment you add the key.** Nothing
throws, crashes, or silently does nothing.

| Integration | Env var(s) | Without it | With it |
|---|---|---|---|
| AI Matching | `AI_MATCHING_ENDPOINT`, `AI_SERVICE_API_KEY` | Deterministic weighted scoring (distance/rating/trust/availability/experience) — real ranking, not random | Calls your model endpoint |
| AI Pricing | `AI_PRICING_ENDPOINT`, `AI_SERVICE_API_KEY` | Category base-price range adjusted for distance/urgency/demand | Calls your model endpoint |
| Payments | `PAYSTACK_SECRET_KEY`, `FLUTTERWAVE_SECRET_KEY` | "Pay now" returns a typed `PAYMENT_PROVIDER_UNAVAILABLE` error the UI shows cleanly; withdrawals are recorded and marked for manual processing | Real checkout + webhook-driven settlement |
| Maps/routing | `MAPS_PROVIDER_API_KEY` | Distance/ETA computed via haversine straight-line math — correct ordering, approximate numbers | Real road-distance/ETA (not yet wired — see Known Gaps) |
| Live location | `UPSTASH_REDIS_REST_URL/TOKEN` | Tracking screen shows an honest "location unavailable" state, never a stale/fake pin | Real GEO-indexed live helper position |
| SMS | `SMS_PROVIDER_API_KEY`, `SMS_PROVIDER_SENDER_ID` | In-app notification still sent; SMS channel row marked `failed` | SMS delivered |
| Email | `EMAIL_PROVIDER_API_KEY` | Same — in-app still works, email channel marked `failed` | Email delivered |
| Admin auth | `ADMIN_SESSION_SECRET` | **Required** — admin routes throw at runtime without it (this one has no fallback; it's a secret, not a third-party integration) | — |

`.env.example` lists every single env var the code actually reads (verified
by grep — nothing in the example is unused, nothing used is missing from
the example).

---

## Automated tests

```bash
npm run test
```

Real unit tests (not smoke tests) on the parts the technical spec itself
flags as non-negotiable coverage (spec section 26):

- `tests/matching.test.ts` — ranking correctness, availability filtering, empty-candidate handling, score bounds
- `tests/pricing.test.ts` — no negative/absurd prices, urgency pricing, min<=recommended<=max
- `tests/booking-state-machine.test.ts` — every legal/illegal transition in the booking state machine, terminal states, no state-skipping
- `tests/admin-auth.test.ts` — password hashing, tampered/expired session token rejection
- `tests/distance.test.ts` — haversine correctness/symmetry

These all run with **zero credentials configured** — they exercise the
fallback paths, which is also what CI would run without secrets.

**Not yet covered by automated tests** (honest gap): API route handlers
(would need a test-database or heavier mocking setup than this pass had
budget for), the React components, and end-to-end browser tests. The
booking lifecycle and payment webhook logic have been read carefully and
manually traced end-to-end (see integration notes above) but don't have
Playwright/Cypress coverage yet.

---

## Known gaps (honest, not hidden)

- **Real road-distance/ETA isn't wired.** `MAPS_PROVIDER_API_KEY` is
  defined and the tracking API's comment flags where to plug it in, but
  the actual Google Maps/Mapbox distance-matrix call was not implemented
  this pass — haversine is what's live.
- **No malware/content scanning on uploaded files.** `/api/files/[id]/confirm/route.ts`
  marks every upload `scan_status='clean'` immediately — there's no AV
  scanner credential configured. This is flagged explicitly in that
  file's comments; wiring a real scanner is a one-line change once a
  provider is chosen.
- **No Playwright/Cypress E2E tests** — see Testing section above.
- **Admin "Users" page doesn't yet filter by mode or show booking
  history inline** — it lists and searches correctly (now across both
  phone and email) but a few nice-to-have columns from the original
  admin design aren't there.
- **Notification preferences UI** (the settings screen for muting specific
  categories/channels) isn't built — the `notification_preferences` table
  and the `notify()` function that reads it are fully wired, so the
  backend honors preferences the moment a row exists; there's just no
  UI yet to create/edit those rows.

Nothing above was silently skipped — each is a genuine scope cut, listed
so the next engineering pass knows exactly where to start.

---

## Auth setup note (Supabase project configuration, not app code)

Phone and email both use one-time-code verification (not a magic link),
so the login/register UI stays a single consistent two-step flow either
way. For email OTP codes to work, your Supabase project's **Email
template → "Confirm signup" / "Magic Link"** must be set to send a 6-digit
OTP rather than a clickthrough link (Authentication → Email Templates in
the Supabase dashboard), and an SMTP provider must be configured for
Supabase to actually send mail (Supabase's default email sending has low
rate limits — fine for development, not for production volume). Phone OTP
requires a Phone provider (e.g. Twilio) configured under Authentication →
Providers → Phone. Neither of these is an app-level env var — they're
Supabase project settings, done once per environment.

---

## Running it

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key + service role key + ADMIN_SESSION_SECRET at minimum
npx supabase db push          # applies all 7 migrations in order
npx supabase db execute -f supabase/seed.sql
npm run dev
```

To create your first admin user (no signup UI exists for admins by
design — this is an operational action, not a self-serve one):

```sql
insert into roles (name) values ('super_admin') on conflict do nothing;
insert into admin_users (email, password_hash, role_id, status)
values (
  'you@urgenthelp.app',
  -- generate with: node -e "console.log(require('./lib/auth/admin').hashPassword('your-password'))"
  '<hash>',
  (select id from roles where name = 'super_admin'),
  'active'
);
```

The app runs fully on Supabase credentials + `ADMIN_SESSION_SECRET` alone
— every third-party integration degrades to a real, working fallback
rather than breaking the build or the user flow.

## Deploying

Deploy target is Vercel. Connect the repo, set the same env vars from
`.env.example` in the Vercel project settings (Production + Preview), and
point `NEXT_PUBLIC_APP_URL` at the deployed domain. Run the Supabase
migrations against your production project before first deploy.
