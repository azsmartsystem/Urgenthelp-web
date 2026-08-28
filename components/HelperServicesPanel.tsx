'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OfferedService {
  service_id: string;
  service_name: string;
  category_name: string;
  helper_price: number | null;
  is_active: boolean;
}

interface CatalogOption {
  id: string;
  name: string;
  category_name: string;
}

export function HelperServicesPanel({ offered, catalog }: { offered: OfferedService[]; catalog: CatalogOption[] }) {
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const offeredIds = new Set(offered.map((o) => o.service_id));
  const available = catalog.filter((c) => !offeredIds.has(c.id));
  // The catalog can hold 250+ services — a flat <select> with that many
  // options is unusable, so this narrows it down as the person types
  // before they ever open the dropdown.
  const filtered = filter.trim()
    ? available.filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()) || c.category_name.toLowerCase().includes(filter.toLowerCase()))
    : available;

  async function addService() {
    if (!selectedServiceId) return;
    setLoading(true);
    setError(null);
    const res = await fetch('/api/helpers/me/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: selectedServiceId, helper_price: price ? Number(price) : undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return setError(body?.error?.message ?? 'Could not add that service.');
    }
    setAdding(false);
    setSelectedServiceId('');
    setPrice('');
    router.refresh();
  }

  async function toggleActive(serviceId: string, next: boolean) {
    await fetch('/api/helpers/me/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: serviceId, is_active: next }),
    });
    router.refresh();
  }

  async function removeService(serviceId: string) {
    await fetch(`/api/helpers/me/services?service_id=${serviceId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wide text-ink-faint">Services I offer</h2>
        {!adding && (
          <button onClick={() => setAdding(true)} className="text-xs font-bold text-brand">
            + Add service
          </button>
        )}
      </div>

      {offered.length === 0 && !adding && (
        <p className="text-sm text-ink-faint">
          You haven&apos;t added any services yet — customers can&apos;t be matched to you until you do.
        </p>
      )}

      <div className="space-y-2">
        {offered.map((o) => (
          <div key={o.service_id} className="flex items-center justify-between bg-panel-2 rounded-xl px-4 py-3">
            <div>
              <div className="text-sm font-bold text-ink">{o.service_name}</div>
              <div className="text-[11px] text-ink-faint">
                {o.category_name}
                {o.helper_price ? ` · ₦${Number(o.helper_price).toLocaleString()}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleActive(o.service_id, !o.is_active)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-pill ${o.is_active ? 'badge-verified' : 'badge-amber'}`}
              >
                {o.is_active ? 'Active' : 'Paused'}
              </button>
              <button onClick={() => removeService(o.service_id)} className="text-danger text-xs font-bold" aria-label={`Remove ${o.service_name}`}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <div className="mt-3 space-y-2 border-t border-line pt-3">
          <input
            type="text"
            placeholder="Search services (e.g. plumbing, cleaning)…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand"
          />
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            size={filter.trim() ? Math.min(filtered.length + 1, 8) : undefined}
            className="w-full bg-panel-2 text-ink border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="">{filtered.length === 0 ? 'No matches' : 'Choose a service…'}</option>
            {filtered.map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name} — {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Your price for this service (optional, ₦)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand"
          />
          <div className="flex gap-2">
            <button onClick={addService} disabled={loading || !selectedServiceId} className="btn btn-primary btn-sm flex-1">
              {loading ? 'Adding…' : 'Add'}
            </button>
            <button onClick={() => setAdding(false)} className="btn btn-ghost btn-sm">
              Cancel
            </button>
          </div>
          {error && <p className="text-danger text-xs">{error}</p>}
        </div>
      )}
    </section>
  );
}
