import { createServiceRoleClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { VerificationDecision } from '@/components/admin/VerificationDecision';

export default async function VerificationDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServiceRoleClient();
  const { data: helper } = await supabase.from('helper_profiles').select('*').eq('id', params.id).single();
  if (!helper) notFound();

  const { data: docs } = await supabase
    .from('verification_records')
    .select('*')
    .eq('user_id', helper.user_id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-2xl">
      <a href="/admin/verification" className="text-xs text-ink-faint font-bold">
        ← Back to queue
      </a>
      <h1 className="text-2xl font-extrabold text-ink mt-2">{helper.display_name}</h1>
      <span
        className={`badge mt-2 ${
          helper.verification_status === 'verified' ? 'badge-verified' : helper.verification_status === 'rejected' ? 'badge-danger' : 'badge-amber'
        }`}
      >
        {helper.verification_status}
      </span>

      <div className="card p-5 mt-6">
        <h2 className="font-extrabold text-ink text-sm mb-3">Submitted documents</h2>
        {docs && docs.length > 0 ? (
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="flex justify-between items-center py-2 border-t border-line first:border-t-0 text-sm">
                <span className="font-semibold text-ink capitalize">{d.type.replace('_', ' ')}</span>
                <span
                  className={`badge ${d.status === 'approved' ? 'badge-verified' : d.status === 'rejected' ? 'badge-danger' : 'badge-amber'}`}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-faint">No documents submitted yet.</p>
        )}
      </div>

      {helper.verification_status === 'pending' && <VerificationDecision helperId={helper.id} />}
    </div>
  );
}
