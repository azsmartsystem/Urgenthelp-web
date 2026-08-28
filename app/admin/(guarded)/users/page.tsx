import { createServiceRoleClient } from '@/lib/supabase/server';
import { UserStatusAction } from '@/components/admin/UserStatusAction';

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from('users')
    .select('id, phone_number, email, active_mode, status, created_at, customer_profiles(display_name), helper_profiles(display_name, verification_status)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (searchParams.q) {
    query = query.or(`phone_number.ilike.%${searchParams.q}%,email.ilike.%${searchParams.q}%`);
  }
  const { data: users } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-ink">Users</h1>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={searchParams.q}
            placeholder="Search phone or email…"
            className="bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-2 text-sm w-64 outline-none focus:border-brand"
          />
          <button className="btn btn-ghost btn-sm">Search</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface text-ink-faint text-[11px] font-bold uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Contact</th>
              <th className="text-left px-4 py-3">Roles</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Joined</th>
              <th className="text-right px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u: any) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-4 py-3 font-semibold text-ink">
                  {u.customer_profiles?.[0]?.display_name || u.helper_profiles?.[0]?.display_name || '—'}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {u.phone_number ?? u.email ?? '—'}
                  {u.phone_number && u.email && <div className="text-[11px] text-ink-faint">{u.email}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {u.customer_profiles?.length > 0 && <span className="badge badge-navy">Customer</span>}
                    {u.helper_profiles?.length > 0 && (
                      <span className={`badge ${u.helper_profiles[0].verification_status === 'verified' ? 'badge-verified' : 'badge-amber'}`}>
                        Helper
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`badge ${
                      u.status === 'active' ? 'badge-verified' : u.status === 'suspended' ? 'badge-amber' : 'badge-danger'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-faint text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <UserStatusAction userId={u.id} currentStatus={u.status} />
                </td>
              </tr>
            ))}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-faint">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
