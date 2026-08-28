'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Platform settings values are stored as JSONB — most of the ones seeded
// today (commission_rate_percent, cancellation window, geofence radius)
// are a single number, and matching_weights is a small flat object. A raw
// JSON textarea handles both without needing a bespoke editor per key.
export function SettingForm({ settingKey, initialValue, canEdit }: { settingKey: string; initialValue: unknown; canEdit: boolean }) {
  const [raw, setRaw] = useState(JSON.stringify(initialValue, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function save() {
    setError(null);
    setSaved(false);
    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(raw);
    } catch {
      return setError('Not valid JSON — check for a stray comma or quote.');
    }

    setLoading(true);
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: settingKey, value_json: parsedValue }),
    });
    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return setError(body?.error?.message ?? 'Could not save this setting.');
    }
    setSaved(true);
    router.refresh();
  }

  if (!canEdit) {
    return <pre className="text-xs text-ink-soft bg-panel-2 rounded-lg p-3 overflow-x-auto">{raw}</pre>;
  }

  return (
    <div>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        spellCheck={false}
        className="w-full bg-panel-2 text-ink border border-line rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-brand h-24"
      />
      <div className="flex items-center gap-3 mt-2">
        <button onClick={save} disabled={loading} className="btn btn-primary btn-sm">
          {loading ? 'Saving…' : 'Save'}
        </button>
        {saved && <span className="text-xs text-success font-semibold">Saved</span>}
        {error && <span className="text-xs text-danger font-semibold">{error}</span>}
      </div>
    </div>
  );
}
