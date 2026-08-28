import { createServiceRoleClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin-guard';
import { SettingForm } from '@/components/admin/SettingForm';

const LABELS: Record<string, string> = {
  commission_rate_percent: 'Helper withdrawal fee (%)',
  customer_service_fee_percent: 'Customer service fee (%)',
  matching_weights: 'AI matching weights',
  cancellation_free_window_minutes: 'Free cancellation window (minutes)',
  geofence_arrival_radius_meters: 'Arrival geofence radius (meters)',
};

const DESCRIPTIONS: Record<string, string> = {
  commission_rate_percent:
    'Deducted when a helper withdraws from their wallet to their bank — e.g. a ₦10,000 withdrawal at 12% sends ₦8,800 net. The helper still receives 100% of the job price into their wallet at completion; this only applies at cash-out.',
  customer_service_fee_percent:
    'Added on top of the job price when a customer pays — e.g. a ₦10,000 job charges the customer ₦10,300 at 3%. Shown to the customer as "Service fee" before they confirm.',
  matching_weights: 'How lib/ai/matching.ts weighs distance, rating, trust score, availability and experience when the AI matching endpoint is not configured and the fallback ranking runs instead.',
  cancellation_free_window_minutes: 'How long after booking a customer can cancel without a fee.',
  geofence_arrival_radius_meters: "How close a helper's live location must be to the job address before they can mark themselves as arrived.",
};

export default async function AdminSettingsPage() {
  const { role } = await requireAdmin();
  const canEdit = role === 'super_admin' || role === 'finance';
  const supabase = createServiceRoleClient();
  const { data: settings } = await supabase.from('platform_settings').select('*').order('key');

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink mb-1">Platform settings</h1>
      <p className="text-sm text-ink-faint mb-6">
        Controls the pricing, matching and commission logic used across the app. Changes take effect immediately.
        {!canEdit && ' You have read-only access — only Finance and Super Admin can edit these.'}
      </p>
      <div className="space-y-4">
        {(settings ?? []).map((s) => (
          <div key={s.key} className="card p-5">
            <div className="font-bold text-ink text-sm">{LABELS[s.key] ?? s.key}</div>
            <div className="text-xs text-ink-faint mt-1 mb-3">{DESCRIPTIONS[s.key] ?? s.key}</div>
            <SettingForm settingKey={s.key} initialValue={s.value_json} canEdit={canEdit} />
            {s.updated_at && (
              <div className="text-[10.5px] text-ink-faint mt-2">Last updated {new Date(s.updated_at).toLocaleString()}</div>
            )}
          </div>
        ))}
        {(!settings || settings.length === 0) && <div className="card p-10 text-center text-ink-faint text-sm">No settings configured yet.</div>}
      </div>
    </div>
  );
}
