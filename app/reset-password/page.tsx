'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';
import { AppSidebar } from '@/components/AppSidebar';
import { PasswordInput } from '@/components/PasswordInput';

function passwordIssues(pw: string) {
  const issues: string[] = [];
  if (pw.length < 8) issues.push('At least 8 characters');
  if (!/[A-Z]/.test(pw)) issues.push('One uppercase letter');
  if (!/[0-9]/.test(pw)) issues.push('One number');
  return issues;
}

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;

    async function establishSession() {
      // The `@supabase/ssr` browser client auto-exchanges the recovery
      // `?code=` (PKCE) on load and also honors the legacy hash-token
      // format — either way, by the time this runs a valid recovery
      // session should already be set if the link is genuine and unused.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        setReady(true);
      } else {
        setLinkInvalid(true);
      }
    }

    establishSession();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function submit() {
    setError(null);
    const issues = passwordIssues(password);
    if (issues.length) return setError(`Password needs: ${issues.join(', ')}.`);
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) return setError(updateError.message);
    setDone(true);
    setTimeout(() => {
      router.push('/login');
    }, 1800);
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Logo />
        <AppSidebar />
      </header>
      <div className="flex-1 flex items-center justify-center px-4 pb-10">
      <div className="w-full max-w-sm card p-6 sm:p-8">

        {done ? (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-400/10 flex items-center justify-center text-2xl">✓</div>
            <h1 className="text-lg font-extrabold text-ink">Password changed</h1>
            <p className="text-sm text-ink-soft">Taking you to log in…</p>
          </div>
        ) : linkInvalid ? (
          <div className="text-center space-y-3">
            <h1 className="text-lg font-extrabold text-ink">Link expired or invalid</h1>
            <p className="text-sm text-ink-soft">Request a new password reset link and try again.</p>
            <a href="/forgot-password" className="btn btn-primary w-full inline-flex mt-2">
              Request new link
            </a>
          </div>
        ) : !ready ? (
          <p className="text-sm text-ink-faint text-center">Verifying your link…</p>
        ) : (
          <>
            <h1 className="text-xl font-extrabold text-ink text-center">Choose a new password</h1>
            <div className="mt-6 space-y-3">
              <PasswordInput value={password} onChange={setPassword} placeholder="New password" autoComplete="new-password" />
              <PasswordInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm new password"
                autoComplete="new-password"
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
              <p className="text-[11px] text-ink-faint leading-relaxed">
                Use at least 8 characters, with one uppercase letter and one number.
              </p>
              <button onClick={submit} disabled={loading} className="btn btn-primary w-full">
                {loading ? 'Saving…' : 'Change password'}
              </button>
            </div>
            {error && <p className="text-danger text-xs mt-4 text-center">{error}</p>}
          </>
        )}
      </div>
      </div>
    </main>
  );
}
