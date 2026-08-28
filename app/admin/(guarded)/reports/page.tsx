import { createServiceRoleClient } from '@/lib/supabase/server';

// Real aggregate queries against Postgres, not fabricated numbers.
// A dedicated analytics_events-driven dashboard can replace this once
// event volume justifies a materialized view.
export default async function AdminReportsPage() {
  const supabase = createServiceRoleClient();

  const [{ count: totalUsers }, { count: totalHelpers }, { count: completedBookings }, { data: paymentsSum }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('helper_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('payments').select('amount').eq('status', 'successful'),
  ]);

  const gmv = (paymentsSum ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  const { data: byCategory } = await supabase
    .from('bookings')
    .select('services(service_categories(name))')
    .eq('status', 'completed');

  const categoryCounts: Record<string, number> = {};
  for (const row of byCategory ?? []) {
    const name = (row as any).services?.service_categories?.name ?? 'Unknown';
    categoryCounts[name] = (categoryCounts[name] ?? 0) + 1;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink mb-6">Reports</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          ['Total Users', totalUsers ?? 0],
          ['Total Helpers', totalHelpers ?? 0],
          ['Completed Bookings', completedBookings ?? 0],
          ['Gross Marketplace Value', `₦${gmv.toLocaleString()}`],
        ].map(([label, value]) => (
          <div key={label as string} className="card p-5">
            <div className="text-[11px] font-bold text-ink-faint uppercase">{label}</div>
            <div className="text-2xl font-extrabold text-ink mt-2">{value}</div>
          </div>
        ))}
      </div>

      <h2 className="font-extrabold text-ink text-sm mb-3">Completed bookings by category</h2>
      <div className="card p-5">
        {Object.entries(categoryCounts).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-32 text-sm font-semibold text-ink">{name}</div>
                  <div className="flex-1 h-2 bg-line rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand to-ai"
                      style={{ width: `${(count / Math.max(...Object.values(categoryCounts))) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm font-bold text-ink w-8 text-right">{count}</div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-ink-faint">No completed bookings yet.</p>
        )}
      </div>
    </div>
  );
}
