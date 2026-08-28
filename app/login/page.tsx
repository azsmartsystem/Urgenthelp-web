'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';
import { AppSidebar } from '@/components/AppSidebar';
import { PasswordInput } from '@/components/PasswordInput';

type Method = 'password' | 'phone' | 'email-otp';

export default function LoginPage() {
  const [method, setMethod] = useState<Method>('password');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [identifier, setIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function switchMethod(next: Method) {
    setMethod(next);
    setError(null);
    setOtpSent(false);
    setCode('');
    setIdentifier('');
  }

  function afterLogin() {
    // Read the redirect target from the URL directly rather than
    // useSearchParams() — that hook forces this whole page into a
    // Suspense boundary at build time for no real benefit here.
    const next = new URLSearchParams(window.location.search).get('next');
    router.push(next || '/dashboard');
    router.refresh();
  }

  async function loginWithPassword() {
    setError(null);
    if (!email || !password) return setError('Enter your email and password.');
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      if (signInError.message.toLowerCase().includes('email not confirmed')) {
        return setError('Please confirm your email first — check your inbox for the link.');
      }
      return setError('Incorrect email or password.');
    }
    afterLogin();
  }

  async function requestOtp() {
    setLoading(true);
    setError(null);
    const { error: otpError } =
      method === 'phone' ? await supabase.auth.signInWithOtp({ phone: identifier }) : await supabase.auth.signInWithOtp({ email: identifier });
    setLoading(false);
    if (otpError) return setError(otpError.message);
    setOtpSent(true);
  }

  async function verifyOtp() {
    setLoading(true);
    setError(null);
    const { error: verifyError } =
      method === 'phone'
        ? await supabase.auth.verifyOtp({ phone: identifier, token: code, type: 'sms' })
        : await supabase.auth.verifyOtp({ email: identifier, token: code, type: 'email' });
    setLoading(false);
    if (verifyError) return setError(verifyError.message);
    afterLogin();
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Logo />
        <AppSidebar />
      </header>
      <div className="flex-1 flex items-center justify-center px-4 pb-10">
      <div className="w-full max-w-sm card p-6 sm:p-8">
        <h1 className="text-xl font-extrabold text-ink text-center">Welcome back</h1>
        <p className="text-ink-soft text-sm text-center mt-1">Log in to continue</p>

        {!otpSent && (
          <div className="flex gap-1.5 mt-6 bg-surface rounded-xl p-1 text-[13px]">
            {([
              ['password', 'Password'],
              ['email-otp', 'Email code'],
              ['phone', 'Phone code'],
            ] as const).map(([m, label]) => (
              <button
                key={m}
                onClick={() => switchMethod(m)}
                className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                  method === m ? 'bg-panel shadow-card text-ink' : 'text-ink-faint'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {method === 'password' && (
          <div className="mt-4 space-y-3">
            <input
              type="email"
              placeholder="you@example.com"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
            />
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Password"
              autoComplete="current-password"
              onKeyDown={(e) => e.key === 'Enter' && loginWithPassword()}
            />
            <div className="text-right -mt-1">
              <a href="/forgot-password" className="text-xs text-brand font-bold">
                Forgot password?
              </a>
            </div>
            <button onClick={loginWithPassword} disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </div>
        )}

        {method !== 'password' && !otpSent && (
          <div className="mt-4 space-y-4">
            <input
              type={method === 'phone' ? 'tel' : 'email'}
              placeholder={method === 'phone' ? '+234 801 234 5678' : 'you@example.com'}
              aria-label={method === 'phone' ? 'Phone number' : 'Email address'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
            />
            <button onClick={requestOtp} disabled={loading || !identifier} className="btn btn-primary w-full">
              {loading ? 'Sending…' : 'Send code'}
            </button>
          </div>
        )}

        {method !== 'password' && otpSent && (
          <div className="mt-6 space-y-4">
            <p className="text-xs text-ink-faint text-center">
              Code sent to <span className="font-semibold text-ink">{identifier}</span>
            </p>
            <input
              type="text"
              placeholder="6-digit code"
              aria-label="6-digit verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand text-center tracking-widest"
            />
            <button onClick={verifyOtp} disabled={loading || code.length < 4} className="btn btn-primary w-full">
              {loading ? 'Verifying…' : 'Verify & continue'}
            </button>
          </div>
        )}

        {error && <p className="text-danger text-xs mt-4 text-center">{error}</p>}
        <p className="text-center text-xs text-ink-faint mt-6">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-brand font-bold">
            Sign up
          </a>
        </p>
      </div>
      </div>
    </main>
  );
}
