import { createServiceRoleClient } from '@/lib/supabase/server';

const ACTION_LABELS: Record<string, string> = {
  user_status_change: 'User status changed',
  verification_decision: 'Verification decision',
  dispute_resolved: 'Dispute resolved',
  fraud_event_reviewed: 'Fraud event reviewed',
  platform_setting_change: 'Platform setting changed',
  admin_login: 'Admin logged in',
};

export default async function AdminAuditLogsPage() {
  const supabase = createServiceRoleClient();
  const { data: logs } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);

  // audit_logs.actor_id is polymorphic (user/admin/system all share the
  // one column, per the check constraint above) — there's no foreign key
  // for PostgREST to embed through, so admin emails are resolved with a
  // second query instead.
  const adminActorIds = Array.from(new Set((logs ?? []).filter((l) => l.actor_type === 'admin' && l.actor_id).map((l) => l.actor_id)));
  const { data: admins } = adminActorIds.length
    ? await supabase.from('admin_users').select('id, email').in('id', adminActorIds)
    : { data: [] };
  const adminEmailById = new Map((admins ?? []).map((a) => [a.id, a.email]));

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink mb-1">Audit logs</h1>
      <p className="text-sm text-ink-faint mb-6">Every admin action that changes data, most recent first. Read-only — this is the trail, not an editor.</p>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-ink-faint text-[11px] font-bold uppercase">
            <tr>
              <th className="text-left px-4 py-3">When</th>
              <th className="text-left px-4 py-3">Actor</th>
              <th className="text-left px-4 py-3">Action</th>
              <th className="text-left px-4 py-3">Entity</th>
              <th className="text-left px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((l: any) => (
              <tr key={l.id} className="border-t border-line align-top">
                <td className="px-4 py-3 text-ink-faint whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                  {l.actor_type === 'admin' ? (adminEmailById.get(l.actor_id) ?? 'Admin') : l.actor_type === 'system' ? 'System' : 'User'}
                </td>
                <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">{ACTION_LABELS[l.action] ?? l.action}</td>
                <td className="px-4 py-3 text-ink-faint whitespace-nowrap">
                  {l.entity_type}
                  {l.entity_id ? ` · ${String(l.entity_id).slice(0, 8)}` : ''}
                </td>
                <td className="px-4 py-3 text-ink-faint max-w-xs">
                  {l.after_json ? (
                    <pre className="text-[10.5px] whitespace-pre-wrap break-words">{JSON.stringify(l.after_json)}</pre>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!logs || logs.length === 0) && <div className="p-10 text-center text-ink-faint text-sm">No audit entries yet.</div>}
      </div>
    </div>
  );
}
