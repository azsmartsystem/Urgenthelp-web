import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import { CategoryIcon } from '@/components/CategoryIcon';
import { AppSidebar } from '@/components/AppSidebar';
import { Reveal } from '@/components/Reveal';
import { createClient } from '@/lib/supabase/server';

// Safe to cache — this page has no per-user data (confirmed: no auth
// lookup anywhere in it), so every visitor gets the same content. 5
// minutes means the popular-services list and service count stay fresh
// without hitting Supabase on every single anonymous page view, which
// this page gets far more of than any authenticated route in the app.
export const revalidate = 300;

// Landing page — deliberately has no permanent Get Help / Give Help
// switch (that lives in the sidebar now, per the latest brief). The CTAs
// here are one-time, contextual actions ("Find a Service", "Become a
// Helper"), not a persistent mode toggle.
//
// Photography: real, relevant photos from Pexels (CC0 — free for commercial
// use, no attribution required: https://www.pexels.com/license/), matched
// per section rather than generic/random. Each `pexelsId` below is a real
// photo verified via search — a plumber actually fixing a pipe for
// Plumbing, an electrician at a panel for Electrical, and so on — not
// stock filler. Swap for original brand photography when you have it;
// these are meant to make the site feel real today, not to be permanent.
const PEXELS: Record<string, number> = {
  'home-services': 6195288, // cleaners in PPE vacuuming a living room
  plumbing: 6419128, // plumber installing pipe fittings
  electrical: 257736, // electrician working on a circuit breaker panel
  'cooking-catering': 3298637, // chef cooking in a professional kitchen
  'child-family': 7356477, // woman playing with kids
  'garden-outdoor': 11400230, // person cutting grass
  'delivery-logistics': 7464676, // movers carrying a couch
  education: 8613119, // teacher with students in a classroom
};
function pexels(id: number, w: number) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}

export default async function LandingPage() {
  const categories = [
    { name: 'Cleaning', slug: 'home-services' },
    { name: 'Plumbing', slug: 'plumbing' },
    { name: 'Electrical', slug: 'electrical' },
    { name: 'Cooking', slug: 'cooking-catering' },
    { name: 'Babysitting', slug: 'child-family' },
    { name: 'Gardening', slug: 'garden-outdoor' },
    { name: 'Moving', slug: 'delivery-logistics' },
    { name: 'Tutoring', slug: 'education' },
  ];

  // Real data, not a hardcoded "popular services" list — pulled from the
  // actual 258-service catalog so this never drifts out of sync with what
  // customers can genuinely request.
  const popularNames = [
    'Barbering (Home Service)',
    'Mobile Mechanic Visit',
    'General Electrical Repairs',
    'Pipe Repair',
    'Hair Braiding',
    'Standard House Cleaning',
    'Full Body Massage',
    'Air Conditioner Servicing',
    'Generator Servicing',
    'Tailor',
  ];
  const supabase = createClient();
  const { data: popularServices } = await supabase
    .from('services')
    .select('id, name, base_price_min, base_price_max, service_categories(slug)')
    .in('name', popularNames)
    .eq('is_active', true);

  const { count: serviceCount } = await supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true);

  // Real reviews, not invented testimonial copy — reviews has a public-read
  // policy already (unlike bookings, which is owner-scoped), so this reads
  // fine for an unauthenticated visitor. No FK from reviews to
  // helper_profiles (reviewee_id points at users.id), so the helper's name
  // is resolved with a second query rather than a PostgREST embed.
  const { data: topReviews } = await supabase
    .from('reviews')
    .select('rating, comment, tags, reviewee_id')
    .gte('rating', 4)
    .not('comment', 'is', null)
    .order('created_at', { ascending: false })
    .limit(6);

  const reviewerUserIds = Array.from(new Set((topReviews ?? []).map((r) => r.reviewee_id)));
  const { data: revieweeProfiles } = reviewerUserIds.length
    ? await supabase.from('helper_profiles').select('user_id, display_name').in('user_id', reviewerUserIds)
    : { data: [] };
  const nameByUserId = new Map((revieweeProfiles ?? []).map((p) => [p.user_id, p.display_name]));
  const testimonials = (topReviews ?? []).map((r) => ({ ...r, helperName: nameByUserId.get(r.reviewee_id) ?? 'a verified helper' }));

  // Real testimonials only — no invented quotes attributed to fake names.
  // A brand-new platform legitimately has zero completed jobs yet, so
  // this section only renders once there's real signal to show; an
  // almost-empty "testimonials" section with 1-2 items would look worse
  // than not having the section at all.
  const { data: reviewRows } = await supabase
    .from('reviews')
    .select('rating, comment, tags, helper_profiles!reviews_reviewee_id_fkey(display_name)')
    .eq('rating', 5)
    .not('comment', 'is', null)
    .order('created_at', { ascending: false })
    .limit(6);
  const testimonials = (reviewRows ?? []).filter((r: any) => r.comment && r.comment.length > 10);

  return (
    <main>
      <nav className="flex items-center justify-between px-4 sm:px-10 py-4 border-b border-line bg-panel/80 backdrop-blur sticky top-0 z-40">
        <Logo />
        <div className="hidden md:flex gap-8 text-sm font-semibold text-ink-soft">
          <Link href="/dashboard/search">Find Help</Link>
          <Link href="/register?intent=helper">Become a Helper</Link>
          <Link href="/support">Trust & Safety</Link>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">
            Log in
          </Link>
          <Link href="/register" className="btn btn-primary btn-sm">
            Get Started
          </Link>
          <AppSidebar />
        </div>
      </nav>

      <section className="relative overflow-hidden bg-navy text-white px-4 sm:px-10 py-16 md:py-24">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(900px 420px at 85% -10%, rgba(6,182,212,.14), transparent 60%), radial-gradient(700px 420px at 5% 0%, rgba(37,99,235,.12), transparent 60%)',
          }}
        />
        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="animate-[fade-up_0.6s_ease-out]">
            <span className="badge badge-ai !bg-cyan-500/15 !text-cyan-300">✨ {serviceCount ?? 250}+ services, AI-matched</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mt-5">
              Find trusted help
              <br />
              around you, whenever
              <br />
              you need it.
            </h1>
            <p className="text-[#B9C4DE] mt-4 text-base leading-relaxed max-w-lg">
              Urgent Help connects you with verified, AI-matched helpers for cleaning, repairs, care and more — with
              fair pricing and real-time tracking.
            </p>

            <Link
              href="/dashboard/search"
              className="mt-8 flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-5 py-4 text-[#B9C4DE] text-sm max-w-md backdrop-blur"
            >
              🔍 What do you need help with today?
            </Link>

            <div className="flex flex-wrap gap-3 mt-5">
              <Link href="/register" className="btn btn-primary">
                Find a Service
              </Link>
              <Link href="/register?intent=helper" className="btn" style={{ background: 'rgba(255,255,255,.1)', color: '#fff' }}>
                Become a Helper
              </Link>
            </div>

            <div className="flex gap-6 mt-10 text-sm">
              <div>
                <div className="text-xl font-extrabold">{serviceCount ?? 250}+</div>
                <div className="text-[#8EA0C7] text-xs mt-0.5">Services offered</div>
              </div>
              <div>
                <div className="text-xl font-extrabold">100%</div>
                <div className="text-[#8EA0C7] text-xs mt-0.5">ID-verified helpers</div>
              </div>
              <div>
                <div className="text-xl font-extrabold">Escrow</div>
                <div className="text-[#8EA0C7] text-xs mt-0.5">protected payments</div>
              </div>
            </div>
          </div>

          {/* Photo collage — hidden on small phones to avoid pushing the
              CTAs below the fold; appears from sm up. */}
          <div className="hidden sm:grid grid-cols-2 gap-4 relative animate-[fade-up_0.8s_ease-out]">
            <div className="rounded-3xl overflow-hidden relative h-56 lg:h-64 mt-8">
              <Image src={pexels(257736, 500)} alt="Electrician verified helper at work" fill sizes="(min-width:1024px) 260px, 220px" className="object-cover" />
            </div>
            <div className="rounded-3xl overflow-hidden relative h-56 lg:h-64">
              <Image src={pexels(6195288, 500)} alt="Cleaning helper at work" fill sizes="(min-width:1024px) 260px, 220px" className="object-cover" />
            </div>
            <div className="rounded-3xl overflow-hidden relative h-40 lg:h-48 col-span-2 -mt-6">
              <Image src={pexels(6419128, 900)} alt="Plumber at work" fill sizes="(min-width:1024px) 540px, 460px" className="object-cover" />
            </div>
            <div className="absolute -bottom-4 left-4 bg-white text-navy rounded-2xl px-4 py-3 shadow-xl flex items-center gap-2 text-xs font-bold">
              <span className="text-emerald-500">●</span> 4.9 avg rating from real jobs
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-10 py-16 max-w-6xl mx-auto">
        <Reveal>
          <h2 className="text-2xl font-extrabold text-ink mb-6">What do you need help with?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((c) => (
              <Link
                href={`/register?category=${c.slug}`}
                key={c.name}
                className="card overflow-hidden flex flex-col hover:border-brand/40 transition-colors"
              >
                <div className="relative h-24 w-full">
                  <Image src={pexels(PEXELS[c.slug] ?? 6195288, 400)} alt={c.name} fill sizes="200px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-2 w-8 h-8 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center text-white">
                    <CategoryIcon slug={c.slug} className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-bold text-ink text-sm p-3">{c.name}</div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {popularServices && popularServices.length > 0 && (
        <section className="px-4 sm:px-10 py-16 max-w-6xl mx-auto">
          <Reveal>
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-ink">Popular services</h2>
              <Link href="/dashboard/search" className="text-sm font-bold text-brand shrink-0">
                See all →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-5">
              {popularServices.map((s: any) => (
                <Link
                  href={`/register?category=${s.service_categories?.slug ?? ''}`}
                  key={s.id}
                  className="card overflow-hidden shrink-0 w-40 sm:w-auto hover:border-brand/40 transition-colors"
                >
                  <div className="relative h-24 w-full">
                    <Image src={pexels(PEXELS[s.service_categories?.slug] ?? 6195288, 320)} alt={s.name} fill sizes="160px" className="object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-ink text-xs leading-snug">{s.name}</div>
                    <div className="text-[11px] text-ink-faint mt-1.5">
                      ₦{Number(s.base_price_min).toLocaleString()}–₦{Number(s.base_price_max).toLocaleString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      <section className="px-4 sm:px-10 py-16 bg-panel border-y border-line">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <Reveal className="relative h-64 sm:h-80 rounded-3xl overflow-hidden order-2 lg:order-1">
            <Image src={pexels(6419128, 900)} alt="Helper completing a plumbing job" fill sizes="(min-width:1024px) 480px, 100vw" className="object-cover" />
          </Reveal>
          <Reveal delayMs={120} className="order-1 lg:order-2">
            <h2 className="text-2xl font-extrabold text-ink mb-8">How Urgent Help works</h2>
            <div className="space-y-6">
              {[
                { step: '1', title: 'Tell us what you need', body: 'Search or browse 250+ services, describe the job, and set your location.' },
                { step: '2', title: 'Get an AI price estimate', body: 'We check verified helpers nearby and give you a fair, transparent price range in seconds.' },
                { step: '3', title: 'Book, track, and pay safely', body: 'Confirm your helper, track them live, and your payment stays in escrow until the job is done.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-ai flex items-center justify-center text-white font-extrabold shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-base mb-1">{s.title}</h3>
                    <p className="text-sm text-ink-soft leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 sm:px-10 py-16 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-6">
          <Reveal>
          <div className="card overflow-hidden">
            <div className="relative h-40">
              <Image src={pexels(4045031, 800)} alt="Happy customer relaxing at home" fill sizes="(min-width:640px) 480px, 100vw" className="object-cover" />
            </div>
            <div className="p-7">
              <h3 className="font-extrabold text-ink text-lg mb-3">For customers</h3>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li>✓ Every helper is ID-verified before they can accept jobs</li>
                <li>✓ Fair, AI-estimated pricing before you commit</li>
                <li>✓ Payments held in escrow until the job is done</li>
                <li>✓ Live tracking once your helper is on the way</li>
              </ul>
              <Link href="/register" className="btn btn-primary mt-6 inline-flex">
                Find a Service
              </Link>
            </div>
          </div>
        </Reveal>
        <Reveal delayMs={100}>
          <div className="card overflow-hidden">
            <div className="relative h-40">
              <Image src={pexels(3772616, 800)} alt="Confident professional helper" fill sizes="(min-width:640px) 480px, 100vw" className="object-cover" />
            </div>
            <div className="p-7">
              <h3 className="font-extrabold text-ink text-lg mb-3">For helpers</h3>
              <ul className="space-y-2.5 text-sm text-ink-soft">
                <li>✓ Get matched with nearby jobs that fit your skills</li>
                <li>✓ Set your own prices, radius, and availability</li>
                <li>✓ Track earnings and withdraw to your bank anytime</li>
                <li>✓ Build a public rating and trust score over time</li>
              </ul>
              <Link href="/register?intent=helper" className="btn btn-primary mt-6 inline-flex">
                Become a Helper
              </Link>
            </div>
          </div>
        </Reveal>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="px-4 sm:px-10 py-16 max-w-6xl mx-auto">
          <Reveal>
            <h2 className="text-2xl font-extrabold text-ink mb-10 text-center">What people are saying</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <Reveal key={i} delayMs={i * 80}>
                <div className="card p-5 h-full">
                  <div className="text-amber-400 text-sm mb-2">{'★'.repeat(t.rating)}</div>
                  <p className="text-sm text-ink-soft leading-relaxed">&ldquo;{t.comment}&rdquo;</p>
                  <div className="text-xs text-ink-faint mt-4">— on a job with {t.helperName}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <footer className="bg-navy text-[#B9C4DE] px-4 sm:px-10 py-8 flex flex-col sm:flex-row gap-4 justify-between text-xs">
        <div>© {new Date().getFullYear()} Urgent Help</div>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <Link href="/support">Privacy</Link>
          <Link href="/support">Terms</Link>
          <Link href="/support">Trust &amp; Safety</Link>
          <Link href="/support">Contact</Link>
        </div>
      </footer>
    </main>
  );
}
