import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { Logo } from '@/components/Logo';
import { NavBar } from '@/components/NavBar';

const STATUS_LABEL: Record<string, string> = {
  requested: 'Requested',
  matched: 'Matched',
  accepted: 'Accepted',
  en_route: 'Helper en route',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

export default async function BookingsListPage({ searchParams }: { searchParams: { status?: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) redirect('/login');

  const { data: profile } = await supabase.from('customer_profiles').select('id').eq('user_id', appUser.id).single();

  let query = supabase
    .from('bookings')
    .select('*, services(name)')
    .eq('customer_id', profile?.id ?? '')
    .order('created_at', { ascending: false });

  const filter = searchParams.status;
  if (filter === 'active') {
    query = query.in('status', ['requested', 'matched', 'accepted', 'en_route', 'in_progress']);
  } else if (filter === 'completed') {
    query = query.eq('status', 'completed');
  } else if (filter === 'cancelled') {
    query = query.in('status', ['cancelled', 'disputed']);
  }

  const { data: bookings } = await query.limit(100);

  return (
    <main className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel sticky top-0 z-30">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <NavBar />
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-xl font-extrabold text-ink mb-4">My bookings</h1>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 mb-5">
          {([
            [undefined, 'All'],
            ['active', 'Active'],
            ['completed', 'Completed'],
            ['cancelled', 'Cancelled'],
          ] as const).map(([key, label]) => (
            <Link
              key={label}
              href={key ? `/dashboard/bookings?status=${key}` : '/dashboard/bookings'}
              className={`shrink-0 px-4 py-2 rounded-pill text-xs font-bold whitespace-nowrap ${
                filter === key ? 'bg-brand text-white' : 'bg-panel border border-line text-ink-soft'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {bookings && bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((b: any) => (
              <Link key={b.id} href={`/dashboard/bookings/${b.id}`} className="card p-4 flex justify-between items-center block">
                <div>
                  <div className="font-bold text-ink text-sm">{b.services?.name}</div>
                  <div className="text-xs text-ink-faint mt-0.5">
                    {STATUS_LABEL[b.status] ?? b.status} · {new Date(b.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-extrabold text-ink text-sm shrink-0">
                  {b.price_recommended ? `₦${Number(b.price_recommended).toLocaleString()}` : '—'}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center text-ink-faint text-sm">
            {filter ? `No ${filter} bookings.` : 'No bookings yet — request your first service to get started.'}
          </div>
        )}
      </div>
    </main>
  );
}
