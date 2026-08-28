import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { Logo } from '@/components/Logo';
import { AvailabilityToggle } from '@/components/AvailabilityToggle';
import { NavBar } from '@/components/NavBar';
import { HelperServicesPanel } from '@/components/HelperServicesPanel';

export default async function HelperDashboard() {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) redirect('/login');

  const { data: helper } = await supabase.from('helper_profiles').select('*').eq('user_id', appUser.id).maybeSingle();
  if (!helper) redirect('/helper/onboarding');

  const { data: offeredSkills } = await supabase
    .from('helper_skills')
    .select('service_id, helper_price, is_active, services(name, service_categories(name))')
    .eq('helper_id', helper.id);
  const offeredServices = (offeredSkills ?? []).map((s: any) => ({
    service_id: s.service_id,
    service_name: s.services?.name ?? 'Unknown service',
    category_name: s.services?.service_categories?.name ?? '',
    helper_price: s.helper_price,
    is_active: s.is_active,
  }));

  const { data: catalogRows } = await supabase
    .from('services')
    .select('id, name, service_categories(name)')
    .eq('is_active', true)
    .order('name')
    .limit(300);
  const catalog = (catalogRows ?? []).map((s: any) => ({ id: s.id, name: s.name, category_name: s.service_categories?.name ?? '' }));

  const { data: opportunities } = await supabase
    .from('helper_offers')
    .select('*, matching_results(booking_id, bookings(services(name), urgency, price_recommended, addresses(city)))')
    .eq('helper_id', helper.id)
    .eq('status', 'notified')
    .order('rank')
    .limit(5);

  const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', appUser.id).maybeSingle();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  let todayEarnings = 0;
  if (wallet?.id) {
    const { data: todayTx } = await supabase
      .from('wallet_transactions')
      .select('amount')
      .eq('wallet_id', wallet.id)
      .eq('type', 'payout')
      .gte('created_at', startOfDay.toISOString());
    todayEarnings = (todayTx ?? []).reduce((sum: number, t: any) => sum + Number(t.amount ?? 0), 0);
  }

  return (
    <main className="min-h-screen bg-surface">
      {/* Sidebar already carries Get Help / Give Help — no more duplicate
          ModeSwitch pill sitting next to the hamburger that opens it. */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel sticky top-0 z-30">
        <Logo />
        <NavBar />
      </header>

      <div className="relative overflow-hidden bg-navy">
        <div className="absolute inset-0">
          <Image
            src="https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=900"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-25"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/80 to-surface" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 pt-8 pb-10 animate-[fade-up_0.5s_ease-out]">
          <div className="text-xs font-bold text-[#8EA0C7]">HELPER MODE</div>
          <h1 className="text-2xl font-extrabold text-white mt-1">{helper.display_name}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-4 pb-8 relative z-10">
        {helper.verification_status !== 'verified' && (
          <div className="rounded-2xl p-4 bg-amber-400/10 border border-amber-400/20 text-sm text-amber-300 font-semibold">
            {helper.verification_status === 'unverified' ? (
              <>
                Your account is unverified. <Link href="/helper/onboarding" className="underline">Upload your ID</Link> to
                start accepting jobs — verification is instant.
              </>
            ) : (
              `Your account is ${helper.verification_status}. Complete verification to start accepting jobs.`
            )}
          </div>
        )}

        <div className="mt-4">
          <AvailabilityToggle initialStatus={helper.availability_status} disabled={helper.verification_status !== 'verified'} />
        </div>

        <div className="mt-4">
          <HelperServicesPanel offered={offeredServices} catalog={catalog} />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="card p-4">
            <div className="text-[11px] font-bold text-ink-faint tracking-wide">TODAY&apos;S EARNINGS</div>
            <div className="text-xl font-extrabold text-ink mt-1">₦{todayEarnings.toLocaleString()}</div>
            <Link href="/wallet" className="text-[11px] text-brand font-bold mt-1 inline-block">
              ₦{Number(wallet?.balance ?? 0).toLocaleString()} available →
            </Link>
          </div>
          <div className="card p-4">
            <div className="text-[11px] font-bold text-ink-faint tracking-wide">TRUST SCORE</div>
            <div className="text-xl font-extrabold text-ink mt-1">{helper.trust_score_cached ?? 80} / 100</div>
            <div className="text-[11px] text-ink-faint mt-1">Keep completing jobs to climb</div>
          </div>
        </div>

        {helper.availability_status === 'online' && (
          <div className="mt-4 rounded-2xl p-4 badge-ai border border-cyan-400/20 flex gap-3 items-start">
            <span>✨</span>
            <div className="text-sm text-ink-soft">
              <span className="font-extrabold text-ink">Demand is high</span> nearby right now — great time to stay
              online.
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint">Nearby opportunities</h2>
        </div>
        {opportunities && opportunities.length > 0 ? (
          <div className="space-y-3">
            {opportunities.map((o: any) => {
              const booking = o.matching_results?.bookings;
              const urgency = booking?.urgency ?? 'standard';
              return (
                <Link key={o.id} href={`/dashboard/bookings/${o.matching_results?.booking_id}`} className="card p-4 block">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-ink text-sm">{booking?.services?.name}</div>
                      <div className="text-xs text-ink-faint mt-0.5">{booking?.addresses?.city}</div>
                    </div>
                    <span
                      className={`badge ${
                        urgency === 'urgent' ? 'badge-danger' : urgency === 'scheduled' ? 'badge-ai' : 'badge-amber'
                      } capitalize`}
                    >
                      {urgency}
                    </span>
                  </div>
                  <div className="flex justify-between items-end mt-3">
                    <div className="font-extrabold text-ink text-sm">₦{booking?.price_recommended?.toLocaleString()}</div>
                    <span className="badge badge-ai">✨ {Math.round(o.match_score * 100)}% match</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="card p-8 text-center text-ink-faint text-sm">
            {helper.availability_status === 'online'
              ? "No opportunities right now — we'll notify you the moment one nearby matches your skills."
              : 'Go online to start seeing nearby opportunities.'}
          </div>
        )}
      </div>
    </main>
  );
}
