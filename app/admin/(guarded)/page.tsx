import { createServiceRoleClient } from '@/lib/supabase/server';

// Admin Overview. Uses the
// service-role client (server-only) since admin reads intentionally
// bypass the customer/helper RLS policies; real deployments should gate
// this behind the admin auth domain checked in middleware.ts.
export default async function AdminOverview() {
  const supabase = createServiceRoleClient();

  const [{ count: totalBookings }, { count: activeBookings }, { count: verifiedHelpers }, { count: openDisputes }] =
    await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['matched', 'accepted', 'en_route', 'in_progress']),
      supabase.from('helper_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
      supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    ]);

  const { data: pendingVerifications } = await supabase
    .from('helper_profiles')
    .select('id, display_name, created_at')
    .eq('verification_status', 'pending')
    .limit(6);

  const kpis = [
    { label: 'Total Bookings', value: totalBookings ?? 0 },
    { label: 'Active Bookings', value: activeBookings ?? 0 },
    { label: 'Verified Helpers', value: verifiedHelpers ?? 0 },
    { label: 'Open Disputes', value: openDisputes ?? 0 },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {kpis.map((k) => (
        <div key={k.label} className="card p-5">
          <div className="text-[11px] font-bold text-ink-faint uppercase">{k.label}</div>
          <div className="text-2xl font-extrabold text-ink mt-2">{k.value}</div>
        </div>
      ))}

      <div className="col-span-4 card p-5 mt-2">
        <h2 className="font-extrabold text-ink mb-4">Pending helper verifications</h2>
        {pendingVerifications && pendingVerifications.length > 0 ? (
          <div className="space-y-2">
            {pendingVerifications.map((h) => (
              <div key={h.id} className="flex justify-between items-center py-2 border-t border-line first:border-t-0">
                <span className="text-sm font-semibold text-ink">{h.display_name}</span>
                <a href={`/admin/verification/${h.id}`} className="text-brand text-xs font-bold">
                  Review →
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-faint">No pending verifications.</p>
        )}
      </div>
    </div>
  );
}
