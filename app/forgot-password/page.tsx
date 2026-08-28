'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';
import { AppSidebar } from '@/components/AppSidebar';
import { useResendCooldown } from '@/lib/hooks/useResendCooldown';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const resendCooldown = useResendCooldown(30);

  async function requestReset() {
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    // Always show the same success state regardless of whether the email
    // exists — this is deliberate: confirming account existence via this
    // form would let anyone enumerate registered emails.
    if (resetError) return setError(resetError.message);
    setSent(true);
    resendCooldown.start();
  }

  async function resendReset() {
    if (!resendCooldown.canSend) return;
    setLoading(true);
    const { error: resendError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setError(resendError ? resendError.message : null);
    if (!resendError) resendCooldown.start();
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Logo />
        <AppSidebar />
      </header>
      <div className="flex-1 flex items-center justify-center px-4 pb-10">
      <div className="w-full max-w-sm card p-6 sm:p-8">
        {!sent ? (
          <>
            <h1 className="text-xl font-extrabold text-ink text-center">Reset your password</h1>
            <p className="text-ink-soft text-sm text-center mt-1">
              Enter the email on your account and we&apos;ll send you a reset link.
            </p>
            <div className="mt-6 space-y-3">
              <input
                type="email"
                placeholder="you@example.com"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && requestReset()}
                className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
              />
              <button onClick={requestReset} disabled={loading} className="btn btn-primary w-full">
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </div>
            {error && <p className="text-danger text-xs mt-4 text-center">{error}</p>}
          </>
        ) : (
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-cyan-400/10 flex items-center justify-center text-2xl">✉️</div>
            <h1 className="text-lg font-extrabold text-ink">Check your email</h1>
            <p className="text-sm text-ink-soft">
              If an account exists for <span className="font-semibold text-ink">{email}</span>, a reset link is on its way.
            </p>
            <button
              onClick={resendReset}
              disabled={loading || !resendCooldown.canSend}
              className="text-xs text-brand font-bold disabled:text-ink-faint"
            >
              {loading
                ? 'Resending…'
                : resendCooldown.canSend
                  ? "Didn't receive it? Resend reset link"
                  : `Resend reset link (${resendCooldown.remaining}s)`}
            </button>
            {error && <p className="text-danger text-xs">{error}</p>}
          </div>
        )}
        <p className="text-center text-xs text-ink-faint mt-6">
          <a href="/login" className="text-brand font-bold">
            Back to log in
          </a>
        </p>
      </div>
      </div>
    </main>
  );
}
