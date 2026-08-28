import { createServiceRoleClient } from '@/lib/supabase/server';

export default async function AdminVerificationQueue() {
  const supabase = createServiceRoleClient();
  const { data: pending } = await supabase
    .from('helper_profiles')
    .select('id, display_name, created_at, verification_records(type, status, created_at)')
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink mb-6">Verification queue</h1>
      {pending && pending.length > 0 ? (
        <div className="space-y-3">
          {pending.map((h: any) => (
            <a key={h.id} href={`/admin/verification/${h.id}`} className="card p-5 flex justify-between items-center block">
              <div>
                <div className="font-bold text-ink text-sm">{h.display_name}</div>
                <div className="text-xs text-ink-faint mt-1">
                  {h.verification_records?.length ?? 0} document(s) submitted · waiting since{' '}
                  {new Date(h.created_at).toLocaleDateString()}
                </div>
              </div>
              <span className="badge badge-amber">Pending review</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center text-ink-faint text-sm">Nothing pending review right now.</div>
      )}
    </div>
  );
}
