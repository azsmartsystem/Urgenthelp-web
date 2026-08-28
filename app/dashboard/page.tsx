import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { Logo } from '@/components/Logo';
import { NavBar } from '@/components/NavBar';
import { CategoryIcon } from '@/components/CategoryIcon';

// Real, relevant photos per category (same Pexels set used on the public
// landing page — see app/page.tsx for licensing notes: CC0, free for
// commercial use). Falls back to a generic "helper at work" photo for any
// category not in this map so a newly-added category never renders blank.
const PEXELS: Record<string, number> = {
  'home-services': 6195288,
  plumbing: 6419128,
  electrical: 257736,
  'cooking-catering': 3298637,
  'child-family': 7356477,
  'garden-outdoor': 11400230,
  'delivery-logistics': 7464676,
  education: 8613119,
};
function pexels(id: number, w: number) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}

export default async function CustomerDashboard() {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) redirect('/login');

  const { data: profile } = await supabase.from('customer_profiles').select('*').eq('user_id', appUser.id).single();
  const { data: categories } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .is('parent_category_id', null)
    .order('sort_order');
  const { data: recentBookings } = await supabase
    .from('bookings')
    .select('*, services(name)')
    .eq('customer_id', profile?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <main className="min-h-screen bg-surface">
      {/* Sidebar (NavBar -> AppSidebar) already carries Get Help / Give
          Help — this header no longer duplicates that with ModeSwitch,
          which used to render right next to the hamburger that opens the
          exact same switch. */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel sticky top-0 z-30">
        <Logo />
        <NavBar />
      </header>

      {/* Hero greeting with a real photo — this used to be a flat text
          block; the whole home screen read as "dull" because nothing on
          it had any imagery at all. */}
      <div className="relative overflow-hidden bg-navy">
        <div className="absolute inset-0">
          <Image
            src={pexels(6195288, 900)}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/80 to-surface" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 pt-8 pb-10 animate-[fade-up_0.5s_ease-out]">
          <div className="text-xs font-bold text-[#8EA0C7]">GOOD TO SEE YOU</div>
          <h1 className="text-2xl font-extrabold text-white mt-1">{profile?.display_name ?? 'there'} 👋</h1>

          <Link
            href="/dashboard/search"
            className="mt-6 flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-5 py-4 text-[#B9C4DE] text-sm backdrop-blur"
          >
            🔍 What do you need help with?
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-4 pb-8">
        <div className="rounded-2xl p-4 badge-ai border border-cyan-400/20 flex gap-3 relative z-10">
          <span>✨</span>
          <div>
            <div className="text-sm font-extrabold text-ink">AI Concierge suggests</div>
            <div className="text-xs text-ink-soft mt-0.5">
              Tell us what you need and we&apos;ll find verified helpers nearby, with fair AI-estimated pricing.
            </div>
          </div>
        </div>

        <h2 className="mt-8 mb-3 text-xs font-extrabold uppercase tracking-wide text-ink-faint">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(categories ?? []).map((c, i) => (
            <Link
              key={c.id}
              href={`/dashboard/request?category=${c.slug}`}
              className="card overflow-hidden flex flex-col hover:border-brand/40 transition-colors animate-[fade-up_0.4s_ease-out_backwards]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="relative h-16 w-full">
                <Image src={pexels(PEXELS[c.slug] ?? 6195288, 240)} alt="" fill sizes="140px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-1.5 left-1.5 w-6 h-6 rounded-md bg-white/15 backdrop-blur flex items-center justify-center text-white">
                  <CategoryIcon slug={c.slug} iconKey={c.icon_key} className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-[11px] font-bold text-ink-soft text-center py-2 px-1">{c.name}</div>
            </Link>
          ))}
        </div>

        <h2 className="mt-8 mb-3 text-xs font-extrabold uppercase tracking-wide text-ink-faint">Recent bookings</h2>
        {recentBookings && recentBookings.length > 0 ? (
          <div className="space-y-3">
            {recentBookings.map((b: any) => (
              <Link key={b.id} href={`/dashboard/bookings/${b.id}`} className="card p-4 flex justify-between items-center block">
                <div>
                  <div className="font-bold text-ink text-sm">{b.services?.name}</div>
                  <div className="text-xs text-ink-faint mt-0.5 capitalize">{b.status.replace('_', ' ')}</div>
                </div>
                <div className="font-extrabold text-ink text-sm">₦{b.price_recommended?.toLocaleString()}</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-ink-faint text-sm">
            No bookings yet — request your first service above.
          </div>
        )}
      </div>
    </main>
  );
}
