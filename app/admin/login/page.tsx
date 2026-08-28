'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error?.code === 'INVALID_CREDENTIALS' ? 'Incorrect email or password.' : 'Sign-in failed.');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-navy px-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-panel rounded-2xl shadow-lg2 p-8">
        <Logo className="mb-8 justify-center" />
        <h1 className="text-lg font-extrabold text-ink text-center">Operations sign-in</h1>
        <p className="text-ink-soft text-xs text-center mt-1">Restricted to Urgent Help staff</p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="you@urgenthelp.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-brand"
            required
          />
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
        {error && <p className="text-danger text-xs mt-4 text-center">{error}</p>}
      </form>
    </main>
  );
}
