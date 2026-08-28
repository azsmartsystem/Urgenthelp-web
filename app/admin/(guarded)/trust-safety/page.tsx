import { createServiceRoleClient } from '@/lib/supabase/server';
import { FraudEventAction } from '@/components/admin/FraudEventAction';

export default async function AdminTrustSafetyPage() {
  const supabase = createServiceRoleClient();
  const { data: fraudEvents } = await supabase
    .from('fraud_events')
    .select('*, users(phone_number, email)')
    .order('detected_at', { ascending: false })
    .limit(50);

  const { data: lowTrust } = await supabase
    .from('helper_profiles')
    .select('id, display_name, trust_score_cached')
    .lt('trust_score_cached', 50)
    .order('trust_score_cached', { ascending: true })
    .limit(10);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink mb-6">Trust & Safety</h1>

      <h2 className="font-extrabold text-ink text-sm mb-3">Fraud events</h2>
      <div className="space-y-3 mb-8">
        {(fraudEvents ?? []).map((f: any) => (
          <div key={f.id} className="card p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold text-ink text-sm capitalize">{f.type.replace('_', ' ')}</div>
              <div className="text-xs text-ink-faint mt-0.5">{f.users?.phone_number ?? f.users?.email} · severity: {f.severity}</div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`badge ${
                  f.status === 'confirmed' ? 'badge-danger' : f.status === 'dismissed' ? 'badge-navy' : 'badge-amber'
                }`}
              >
                {f.status}
              </span>
              {f.status === 'open' && <FraudEventAction eventId={f.id} />}
            </div>
          </div>
        ))}
        {(!fraudEvents || fraudEvents.length === 0) && <div className="card p-8 text-center text-ink-faint text-sm">No fraud events detected.</div>}
      </div>

      <h2 className="font-extrabold text-ink text-sm mb-3">Lowest trust scores</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {(lowTrust ?? []).map((h) => (
              <tr key={h.id} className="border-t border-line first:border-t-0">
                <td className="px-4 py-3 font-semibold text-ink">{h.display_name}</td>
                <td className="px-4 py-3 text-right text-danger font-bold">{h.trust_score_cached}</td>
              </tr>
            ))}
            {(!lowTrust || lowTrust.length === 0) && (
              <tr>
                <td className="px-4 py-6 text-center text-ink-faint">No helpers below threshold.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
