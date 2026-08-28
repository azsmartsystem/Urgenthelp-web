import { createServiceRoleClient } from '@/lib/supabase/server';

export default async function AdminPaymentsPage() {
  const supabase = createServiceRoleClient();
  const { data: payments } = await supabase
    .from('payments')
    .select('*, bookings(services(name), customer_profiles(display_name))')
    .order('initiated_at', { ascending: false })
    .limit(50);

  const { count: totalSuccessful } = await supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'successful');
  const { data: commissionRows } = await supabase.from('commissions').select('amount');
  const totalCommission = (commissionRows ?? []).reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink mb-6">Payments</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-[11px] font-bold text-ink-faint uppercase">Successful payments</div>
          <div className="text-2xl font-extrabold text-ink mt-2">{totalSuccessful ?? 0}</div>
        </div>
        <div className="card p-5">
          <div className="text-[11px] font-bold text-ink-faint uppercase">Total commission earned</div>
          <div className="text-2xl font-extrabold text-ink mt-2">₦{totalCommission.toLocaleString()}</div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-ink-faint text-[11px] font-bold uppercase">
            <tr>
              <th className="text-left px-4 py-3">Reference</th>
              <th className="text-left px-4 py-3">Booking</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Provider</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((p: any) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-3 font-mono text-xs text-ink-soft">{p.provider_reference}</td>
                <td className="px-4 py-3 text-ink font-semibold">{p.bookings?.services?.name}</td>
                <td className="px-4 py-3 text-ink-soft">{p.bookings?.customer_profiles?.display_name ?? '—'}</td>
                <td className="px-4 py-3 text-ink-soft capitalize">{p.provider}</td>
                <td className="px-4 py-3 font-semibold text-ink">₦{Number(p.amount).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      p.status === 'successful' ? 'badge-verified' : p.status === 'failed' ? 'badge-danger' : 'badge-amber'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!payments || payments.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-faint">
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
