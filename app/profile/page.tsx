import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { Logo } from '@/components/Logo';
import { NavBar } from '@/components/NavBar';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';
import { LogoutButton } from '@/components/LogoutButton';
import { VerificationUpload } from '@/components/VerificationUpload';

export default async function ProfilePage() {
  const { supabase, authUser, appUser } = await getCurrentAppUserServer();
  if (!appUser || !authUser) redirect('/login');

  const { data: customerProfile } = await supabase.from('customer_profiles').select('*').eq('user_id', appUser.id).maybeSingle();
  const { data: helperProfile } = await supabase.from('helper_profiles').select('*').eq('user_id', appUser.id).maybeSingle();
  const { data: verificationRecords } = await supabase
    .from('verification_records')
    .select('type, status, created_at')
    .eq('user_id', appUser.id)
    .order('created_at', { ascending: false });

  const displayName = customerProfile?.display_name ?? helperProfile?.display_name ?? 'there';

  // Distinct from helper identity verification (helper_profiles.verification_status,
  // shown separately below when relevant) — this reflects whether the login
  // itself (email/phone) has been confirmed, which is true for anyone who
  // reaches this page since every auth path requires it before a session exists.
  const emailVerified = Boolean(appUser.email_verified_at);
  const phoneVerified = Boolean(appUser.phone_verified_at);

  return (
    <main className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel sticky top-0 z-30">
        <Link href={appUser.active_mode === 'helper' ? '/helper' : '/dashboard'}>
          <Logo />
        </Link>
        <NavBar />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-panel-2 border border-line flex items-center justify-center text-2xl font-extrabold text-ink-soft shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-ink">{displayName}</h1>
            <p className="text-xs text-ink-faint mt-0.5 capitalize">{appUser.active_mode} mode</p>
          </div>
        </div>

        <section className="card p-5">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint mb-4">Personal information</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <dt className="text-ink-faint">Email</dt>
              <dd className="text-ink font-semibold flex items-center gap-2">
                {appUser.email ?? '—'}
                {appUser.email && (
                  <span className={`badge ${emailVerified ? 'badge-verified' : 'badge-amber'}`}>
                    {emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                )}
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-ink-faint">Phone</dt>
              <dd className="text-ink font-semibold flex items-center gap-2">
                {appUser.phone_number ?? '—'}
                {appUser.phone_number && (
                  <span className={`badge ${phoneVerified ? 'badge-verified' : 'badge-amber'}`}>
                    {phoneVerified ? 'Verified' : 'Unverified'}
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        {helperProfile && (
          <section className="card p-5">
            <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint mb-4">Helper verification</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-soft">Identity verification</span>
              <span
                className={`badge ${
                  helperProfile.verification_status === 'verified'
                    ? 'badge-verified'
                    : helperProfile.verification_status === 'rejected'
                      ? 'badge-danger'
                      : 'badge-amber'
                } capitalize`}
              >
                {helperProfile.verification_status}
              </span>
            </div>
            {helperProfile.verification_status !== 'verified' && (
              <div className="mt-3">
                <VerificationUpload userId={appUser.id} />
              </div>
            )}
            {verificationRecords && verificationRecords.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-line pt-4">
                {verificationRecords.map((r, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-ink-faint capitalize">{r.type.replace('_', ' ')}</span>
                    <span className="text-ink-soft capitalize">{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="card p-5">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint mb-4">Security</h2>
          <ChangePasswordForm />
          <div className="border-t border-line mt-5 pt-4">
            <Link href="/forgot-password" className="text-xs text-brand font-bold">
              Forgot your password instead?
            </Link>
          </div>
        </section>

        <LogoutButton />
      </div>
    </main>
  );
}
