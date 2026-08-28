import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { Logo } from '@/components/Logo';
import { NavBar } from '@/components/NavBar';

export default async function HelperProfilePage({ params }: { params: { id: string } }) {
  const { supabase } = await getCurrentAppUserServer();

  const { data: helper } = await supabase
    .from('helper_profiles')
    .select('*')
    .eq('id', params.id)
    .eq('verification_status', 'verified')
    .maybeSingle();
  if (!helper) notFound();

  const { data: skills } = await supabase
    .from('helper_skills')
    .select('helper_price, services(id, name)')
    .eq('helper_id', helper.id)
    .eq('is_active', true);

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comment, tags, created_at, reviewer:users!reviews_reviewer_id_fkey(id)')
    .eq('reviewee_id', helper.user_id)
    .order('created_at', { ascending: false })
    .limit(10);

  const ratingCount = reviews?.length ?? 0;
  const avgRating = ratingCount > 0 ? (reviews!.reduce((s, r) => s + r.rating, 0) / ratingCount).toFixed(1) : null;

  const primaryService = skills?.[0]?.services as any;

  return (
    <main className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel sticky top-0 z-30">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <NavBar />
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-panel-2 border border-line flex items-center justify-center text-2xl font-extrabold text-ink-soft shrink-0">
            {helper.display_name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-ink">{helper.display_name}</h1>
            {primaryService && <p className="text-sm text-ink-faint mt-0.5">{primaryService.name}</p>}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="badge badge-verified">✓ ID Verified</span>
              {helper.years_experience > 0 && (
                <span className="badge badge-navy">{helper.years_experience} yrs experience</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="card p-4 text-center">
            <div className="text-lg font-extrabold text-ink">{avgRating ?? '—'}</div>
            <div className="text-[10.5px] text-ink-faint mt-0.5">Rating</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-lg font-extrabold text-ink">{ratingCount}</div>
            <div className="text-[10.5px] text-ink-faint mt-0.5">Reviews</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-lg font-extrabold text-ink">{Math.round(helper.trust_score_cached ?? 70)}</div>
            <div className="text-[10.5px] text-ink-faint mt-0.5">Trust score</div>
          </div>
        </div>

        {helper.bio && (
          <section className="mt-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint mb-2">About</h2>
            <p className="text-sm text-ink-soft">{helper.bio}</p>
          </section>
        )}

        {skills && skills.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint mb-3">Services offered</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((s: any, i) => (
                <span key={i} className="badge badge-navy">
                  {s.services?.name} {s.helper_price ? `₦${Number(s.helper_price).toLocaleString()}` : ''}
                </span>
              ))}
            </div>
          </section>
        )}

        {reviews && reviews.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint mb-3">Recent reviews</h2>
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="card p-4">
                  <div className="text-amber-400 text-sm">{'★'.repeat(r.rating)}</div>
                  {r.comment && <p className="text-sm text-ink-soft mt-2">{r.comment}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="sticky bottom-4 mt-8">
          <Link
            href={primaryService ? `/dashboard/request?category=${primaryService.id}` : '/dashboard/request'}
            className="btn btn-primary w-full block text-center"
          >
            Request this service
          </Link>
          <p className="text-[10.5px] text-ink-faint text-center mt-2">
            Urgent Help matches you with the best available verified helper — {helper.display_name} may or may not be assigned,
            based on real-time availability and AI matching.
          </p>
        </div>
      </div>
    </main>
  );
}
