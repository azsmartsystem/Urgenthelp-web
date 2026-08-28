'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SeedCatalogButton({ currentServiceCount }: { currentServiceCount: number }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function seed() {
    setLoading(true);
    setError(null);
    setResult(null);
    const res = await fetch('/api/admin/services/seed', { method: 'POST' });
    const body = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(body?.error?.message ?? 'Seeding failed.');
      return;
    }
    setResult(`Added ${body.servicesCreated} new services (${body.alreadyExisted} already existed) — ${body.totalInCatalog} total in the catalog.`);
    router.refresh();
  }

  // Only surface this once — once the catalog is clearly populated there's
  // nothing useful for an admin to click here day to day.
  if (currentServiceCount >= 200 && !result) return null;

  return (
    <div className="card p-5 mb-6 border-cyan-400/20">
      <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint mb-1">Nigerian market catalog</h2>
      <p className="text-sm text-ink-soft mb-3">
        {currentServiceCount} of 258 services currently active. Seed the full catalog (18 categories, real NGN
        pricing) in one click — safe to run more than once, it only adds what&apos;s missing.
      </p>
      <button onClick={seed} disabled={loading} className="btn btn-primary btn-sm">
        {loading ? 'Seeding…' : 'Seed 258-service catalog'}
      </button>
      {result && <p className="text-success text-xs font-semibold mt-2">{result}</p>}
      {error && <p className="text-danger text-xs font-semibold mt-2">{error}</p>}
    </div>
  );
}
