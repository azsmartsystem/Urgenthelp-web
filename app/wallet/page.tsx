import { redirect } from 'next/navigation';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { Logo } from '@/components/Logo';
import { NavBar } from '@/components/NavBar';
import { WithdrawButton } from '@/components/WithdrawButton';

export default async function WalletPage() {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) redirect('/login');

  const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', appUser.id).maybeSingle();
  const { data: transactions } = wallet
    ? await supabase.from('wallet_transactions').select('*').eq('wallet_id', wallet.id).order('created_at', { ascending: false }).limit(20)
    : { data: [] };
  const { data: bankAccounts } = await supabase.from('bank_accounts').select('*').eq('user_id', appUser.id);
  const { data: feeSetting } = await supabase.from('platform_settings').select('value_json').eq('key', 'commission_rate_percent').maybeSingle();
  const withdrawalFeePercent = Number(feeSetting?.value_json ?? 12);
  const { data: helper } = await supabase.from('helper_profiles').select('id').eq('user_id', appUser.id).maybeSingle();

  // Last 7 days of net inflow, grouped by weekday, for the simple bar chart.
  const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const weekTotals = [0, 0, 0, 0, 0, 0, 0];
  if (wallet) {
    const { data: weekTx } = await supabase
      .from('wallet_transactions')
      .select('amount, created_at')
      .eq('wallet_id', wallet.id)
      .gte('created_at', sevenDaysAgo.toISOString());
    for (const t of weekTx ?? []) {
      const d = new Date(t.created_at);
      const amt = Number(t.amount);
      if (amt > 0) weekTotals[d.getDay()] += amt;
    }
  }
  const maxDay = Math.max(...weekTotals, 1);

  const typeLabels: Record<string, string> = {
    booking_charge: 'Booking payment',
    payout: 'Job payout',
    withdrawal: 'Withdrawal',
    refund: 'Refund',
    commission: 'Platform commission',
    adjustment: 'Adjustment',
  };

  return (
    <main className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel">
        <Logo />
        <NavBar />
      </header>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-extrabold text-ink mb-5">Wallet</h1>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-navy to-[#16294f] text-white relative overflow-hidden">
          <div className="text-[11px] font-bold text-[#9FB0D4]">AVAILABLE BALANCE</div>
          <div className="text-3xl font-extrabold mt-1">₦{Number(wallet?.balance ?? 0).toLocaleString()}</div>
          {helper && (
            <div className="mt-4">
              <WithdrawButton bankAccounts={bankAccounts ?? []} maxAmount={Number(wallet?.balance ?? 0)} feePercent={withdrawalFeePercent} />
            </div>
          )}
        </div>

        <h2 className="mt-8 mb-3 text-xs font-extrabold uppercase tracking-wide text-ink-faint">This week</h2>
        <div className="card p-5">
          <div className="flex items-end justify-between gap-2 h-32">
            {weekTotals.map((total, i) => {
              const dayIndex = (sevenDaysAgo.getDay() + i) % 7;
              const heightPct = Math.max((total / maxDay) * 100, total > 0 ? 8 : 3);
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-brand to-ai"
                    style={{ height: `${heightPct}%`, opacity: total > 0 ? 1 : 0.15 }}
                    title={`₦${total.toLocaleString()}`}
                  />
                  <div className="text-[10px] font-bold text-ink-faint">{dayLabels[dayIndex]}</div>
                </div>
              );
            })}
          </div>
        </div>

        <h2 className="mt-8 mb-3 text-xs font-extrabold uppercase tracking-wide text-ink-faint">Recent transactions</h2>
        {transactions && transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((t: any) => (
              <div key={t.id} className="card p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-ink text-sm">{typeLabels[t.type] ?? t.type}</div>
                  <div className="text-[11px] text-ink-faint mt-0.5">{new Date(t.created_at).toLocaleDateString()}</div>
                </div>
                <div className={`font-extrabold text-sm ${Number(t.amount) >= 0 ? 'text-success' : 'text-ink'}`}>
                  {Number(t.amount) >= 0 ? '+' : ''}₦{Math.abs(Number(t.amount)).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-ink-faint text-sm">No transactions yet.</div>
        )}
      </div>
    </main>
  );
}
