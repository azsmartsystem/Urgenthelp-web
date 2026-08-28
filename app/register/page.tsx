'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';
import { AppSidebar } from '@/components/AppSidebar';
import { useResendCooldown } from '@/lib/hooks/useResendCooldown';
import { PasswordInput } from '@/components/PasswordInput';

type Method = 'password' | 'phone' | 'email-otp';

function passwordIssues(pw: string) {
  const issues: string[] = [];
  if (pw.length < 8) issues.push('At least 8 characters');
  if (!/[A-Z]/.test(pw)) issues.push('One uppercase letter');
  if (!/[0-9]/.test(pw)) issues.push('One number');
  return issues;
}

export default function RegisterPage() {
  const [method, setMethod] = useState<Method>('password');

  // Password flow
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupDone, setSignupDone] = useState(false);

  // OTP flow (phone / email-otp)
  const [identifier, setIdentifier] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const resendCooldown = useResendCooldown(30);
  const supabase = createClient();

  function switchMethod(next: Method) {
    setMethod(next);
    setError(null);
    setOtpSent(false);
    setCode('');
    setIdentifier('');
    setSignupDone(false);
  }

  // If the homepage's "Become a Helper" link brought them here
  // (?intent=helper), honor that after signup instead of always landing
  // as a customer — otherwise that link is a promise the app doesn't keep.
  async function routeAfterSignup() {
    const params = new URLSearchParams(window.location.search);
    const intent = params.get('intent');
    const category = params.get('category');
    if (intent === 'helper') {
      const res = await fetch('/api/users/me/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'helper' }),
      });
      router.push(res.status === 409 || res.ok ? '/helper/onboarding' : '/dashboard');
      return;
    }
    router.push(category ? `/dashboard/request?category=${category}` : '/dashboard');
  }

  async function signUpWithPassword() {
    setError(null);
    if (!name.trim()) return setError('Enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.');
    const issues = passwordIssues(password);
    if (issues.length) return setError(`Password needs: ${issues.join(', ')}.`);
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name, phone_number: phone || null },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setLoading(false);

    if (signUpError) {
      // Supabase's error for a duplicate email is a bit terse — surface a
      // clearer message rather than the raw one.
      if (signUpError.message.toLowerCase().includes('already registered')) {
        return setError('An account with this email already exists. Try logging in instead.');
      }
      return setError(signUpError.message);
    }

    // If email confirmations are off in the Supabase project, signUp()
    // returns an active session immediately — send them straight in. The
    // `users` row is provisioned lazily on first authenticated request
    // (see lib/auth/current-user.ts), so there's nothing left to do here.
    if (data.session) {
      await routeAfterSignup();
      router.refresh();
      return;
    }

    setSignupDone(true);
  }

  async function requestOtp() {
    setLoading(true);
    setError(null);
    const { error: otpError } =
      method === 'phone'
        ? await supabase.auth.signInWithOtp({ phone: identifier, options: { data: { display_name: name } } })
        : await supabase.auth.signInWithOtp({ email: identifier, options: { data: { display_name: name } } });
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
    // `users` row provisioning happens lazily on first authenticated
    // request now — see lib/auth/current-user.ts.
    await routeAfterSignup();
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Logo />
        <AppSidebar />
      </header>
      <div className="flex-1 flex items-center justify-center px-4 pb-10">
      <div className="w-full max-w-sm card p-6 sm:p-8">
        <h1 className="text-xl font-extrabold text-ink text-center">Create your account</h1>
        <p className="text-ink-soft text-sm text-center mt-1">One account, both Customer and Helper mode</p>

        {!signupDone && !otpSent && (
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

        {method === 'password' && !signupDone && (
          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Full name"
              aria-label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
            />
            <input
              type="email"
              placeholder="you@example.com"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
            />
            <input
              type="tel"
              placeholder="+234 801 234 5678 (optional)"
              aria-label="Phone number (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
            />
            <PasswordInput value={password} onChange={setPassword} placeholder="Create password" autoComplete="new-password" />
            <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm password" autoComplete="new-password" />
            <p className="text-[11px] text-ink-faint leading-relaxed">
              Use at least 8 characters, with one uppercase letter and one number.
            </p>
            <button onClick={signUpWithPassword} disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        )}

        {method === 'password' && signupDone && (
          <div className="mt-6 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-cyan-400/10 flex items-center justify-center text-2xl">✉️</div>
            <p className="text-sm text-ink">
              We sent a confirmation link to <span className="font-semibold">{email}</span>.
            </p>
            <p className="text-xs text-ink-faint">Click the link to verify your account, then log in.</p>
            <button
              onClick={async () => {
                if (!resendCooldown.canSend) return;
                setLoading(true);
                const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
                setLoading(false);
                setError(resendError ? resendError.message : null);
                if (!resendError) resendCooldown.start();
              }}
              disabled={loading || !resendCooldown.canSend}
              className="text-xs text-brand font-bold disabled:text-ink-faint"
            >
              {loading ? 'Resending…' : resendCooldown.canSend ? 'Resend email' : `Resend email (${resendCooldown.remaining}s)`}
            </button>
          </div>
        )}

        {method !== 'password' && !otpSent && (
          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Full name"
              aria-label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
            />
            <input
              type={method === 'phone' ? 'tel' : 'email'}
              placeholder={method === 'phone' ? '+234 801 234 5678' : 'you@example.com'}
              aria-label={method === 'phone' ? 'Phone number' : 'Email address'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
            />
            <button onClick={requestOtp} disabled={loading || !identifier || !name} className="btn btn-primary w-full">
              {loading ? 'Sending…' : 'Send verification code'}
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
              {loading ? 'Creating account…' : 'Verify & create account'}
            </button>
            <button onClick={() => setOtpSent(false)} className="text-xs text-ink-faint font-bold w-full text-center">
              Use a different {method === 'phone' ? 'number' : 'email'}
            </button>
          </div>
        )}

        {error && <p className="text-danger text-xs mt-4 text-center">{error}</p>}
        <p className="text-center text-xs text-ink-faint mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-brand font-bold">
            Log in
          </a>
        </p>
      </div>
      </div>
    </main>
  );
}
