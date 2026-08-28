import { createServiceRoleClient } from '@/lib/supabase/server';
import { DisputeResolveForm } from '@/components/admin/DisputeResolveForm';

export default async function AdminDisputesPage() {
  const supabase = createServiceRoleClient();
  const { data: disputes } = await supabase
    .from('disputes')
    .select('*, bookings(services(name), customer_profiles(display_name), helper_profiles(display_name))')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink mb-6">Disputes</h1>
      <div className="space-y-4">
        {(disputes ?? []).map((d: any) => (
          <div key={d.id} className="card p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-ink text-sm">{d.bookings?.services?.name}</div>
                <div className="text-xs text-ink-faint mt-1">
                  {d.bookings?.customer_profiles?.display_name} vs {d.bookings?.helper_profiles?.display_name} · {d.type}
                </div>
              </div>
              <span
                className={`badge ${
                  d.status === 'resolved' ? 'badge-verified' : d.status === 'rejected' ? 'badge-danger' : 'badge-amber'
                }`}
              >
                {d.status.replace('_', ' ')}
              </span>
            </div>
            {d.description && <p className="text-xs text-ink-soft mt-3">{d.description}</p>}
            {d.resolution && <p className="text-xs text-ink-faint mt-2 border-t border-line pt-2">Resolution: {d.resolution}</p>}
            {d.status === 'open' && <DisputeResolveForm disputeId={d.id} />}
          </div>
        ))}
        {(!disputes || disputes.length === 0) && <div className="card p-10 text-center text-ink-faint text-sm">No disputes filed.</div>}
      </div>
    </div>
  );
}
