'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';

function passwordIssues(pw: string) {
  const issues: string[] = [];
  if (pw.length < 8) issues.push('At least 8 characters');
  if (!/[A-Z]/.test(pw)) issues.push('One uppercase letter');
  if (!/[0-9]/.test(pw)) issues.push('One number');
  return issues;
}

export default function AdminSetupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const issues = passwordIssues(password);
    if (issues.length) return setError(`Password needs: ${issues.join(', ')}.`);
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    const res = await fetch('/api/admin/bootstrap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return setError(body?.error?.message ?? 'Setup failed.');
    }
    setDone(true);
    setTimeout(() => router.push('/admin/login'), 1800);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-navy px-6">
      <div className="w-full max-w-sm bg-panel rounded-2xl shadow-lg2 p-8">
        <Logo className="mb-8 justify-center" />
        {done ? (
          <div className="text-center space-y-2">
            <div className="text-2xl">✅</div>
            <h1 className="text-lg font-extrabold text-ink">Admin account created</h1>
            <p className="text-ink-soft text-sm">Taking you to sign in…</p>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-extrabold text-ink text-center">Create the first admin account</h1>
            <p className="text-ink-soft text-xs text-center mt-1">
              This only works once — before any admin account exists. After this, use the normal sign-in page.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-3">
              <input
                type="email"
                placeholder="you@urgenthelp.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
              />
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
              />
              <p className="text-[11px] text-ink-faint">At least 8 characters, one uppercase letter, one number.</p>
              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? 'Creating…' : 'Create admin account'}
              </button>
            </form>
            {error && <p className="text-danger text-xs mt-4 text-center">{error}</p>}
          </>
        )}
      </div>
    </main>
  );
}
