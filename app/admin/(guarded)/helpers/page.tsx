import { createServiceRoleClient } from '@/lib/supabase/server';

export default async function AdminHelpersPage({ searchParams }: { searchParams: { status?: string } }) {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from('helper_profiles')
    .select('id, display_name, verification_status, availability_status, trust_score_cached, completion_rate_cached, years_experience, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (searchParams.status) query = query.eq('verification_status', searchParams.status);
  const { data: helpers } = await query;

  const filters = ['all', 'unverified', 'pending', 'verified', 'rejected'];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink mb-4">Helpers</h1>
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <a
            key={f}
            href={f === 'all' ? '/admin/helpers' : `/admin/helpers?status=${f}`}
            className={`chip px-3.5 py-1.5 rounded-full text-xs font-bold border ${
              (searchParams.status ?? 'all') === f ? 'bg-navy text-white border-navy' : 'border-line text-ink-soft'
            }`}
          >
            {f}
          </a>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-ink-faint text-[11px] font-bold uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Verification</th>
              <th className="text-left px-4 py-3">Availability</th>
              <th className="text-left px-4 py-3">Trust score</th>
              <th className="text-left px-4 py-3">Completion</th>
              <th className="text-right px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {(helpers ?? []).map((h) => (
              <tr key={h.id} className="border-t border-line">
                <td className="px-4 py-3 font-semibold text-ink">{h.display_name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      h.verification_status === 'verified'
                        ? 'badge-verified'
                        : h.verification_status === 'rejected'
                        ? 'badge-danger'
                        : 'badge-amber'
                    }`}
                  >
                    {h.verification_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-soft capitalize">{h.availability_status}</td>
                <td className="px-4 py-3 text-ink font-semibold">{h.trust_score_cached ?? '—'}</td>
                <td className="px-4 py-3 text-ink-soft">{h.completion_rate_cached ?? '—'}%</td>
                <td className="px-4 py-3 text-right">
                  <a href={`/admin/verification/${h.id}`} className="text-brand text-xs font-bold">
                    Review →
                  </a>
                </td>
              </tr>
            ))}
            {(!helpers || helpers.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-faint">
                  No helpers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
