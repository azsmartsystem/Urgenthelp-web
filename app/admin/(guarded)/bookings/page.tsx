import { createServiceRoleClient } from '@/lib/supabase/server';

const STATUSES = ['all', 'requested', 'matched', 'accepted', 'en_route', 'in_progress', 'completed', 'cancelled', 'disputed'];

export default async function AdminBookingsPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from('bookings')
    .select('id, status, urgency, price_recommended, final_price, created_at, services(name), customer_profiles(display_name), helper_profiles(display_name)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (searchParams.status && searchParams.status !== 'all') query = query.eq('status', searchParams.status);
  const { data: bookings } = await query;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink mb-4">Bookings</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <a
            key={s}
            href={s === 'all' ? '/admin/bookings' : `/admin/bookings?status=${s}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
              (searchParams.status ?? 'all') === s ? 'bg-navy text-white border-navy' : 'border-line text-ink-soft'
            }`}
          >
            {s.replace('_', ' ')}
          </a>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-ink-faint text-[11px] font-bold uppercase">
            <tr>
              <th className="text-left px-4 py-3">Service</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Helper</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Price</th>
              <th className="text-left px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {(bookings ?? []).map((b: any) => (
              <tr key={b.id} className="border-t border-line hover:bg-surface cursor-pointer">
                <td className="px-4 py-3">
                  <a href={`/admin/bookings/${b.id}`} className="font-semibold text-ink">
                    {b.services?.name}
                  </a>
                  {b.urgency === 'urgent' && <span className="badge badge-danger ml-2">Urgent</span>}
                </td>
                <td className="px-4 py-3 text-ink-soft">{b.customer_profiles?.display_name ?? '—'}</td>
                <td className="px-4 py-3 text-ink-soft">{b.helper_profiles?.display_name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className="badge badge-navy capitalize">{b.status.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-ink">₦{(b.final_price ?? b.price_recommended ?? 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-ink-faint text-xs">{new Date(b.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!bookings || bookings.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-faint">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
