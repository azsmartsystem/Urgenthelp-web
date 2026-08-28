'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function NewServiceForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category_id: categoryId, base_price_min: Number(min), base_price_max: Number(max) }),
    });
    setLoading(false);
    setName('');
    setMin('');
    setMax('');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        placeholder="Service name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <input
          placeholder="Min ₦"
          type="number"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          required
          className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <input
          placeholder="Max ₦"
          type="number"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          required
          className="w-full bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>
      <button disabled={loading || !categoryId} className="btn btn-primary w-full btn-sm">
        {loading ? 'Adding…' : 'Add service'}
      </button>
    </form>
  );
}
