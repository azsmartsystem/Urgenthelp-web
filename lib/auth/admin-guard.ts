// Server-side admin session resolver — used by every /admin/* server
// component (defense in depth alongside middleware.ts, which only checks
// cookie *presence*; this verifies the signature/expiry and returns the
// actual admin record for permission checks and audit logging).

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminSessionToken } from './admin';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const token = cookies().get('uh_admin_session')?.value;
  const session = verifyAdminSessionToken(token);
  if (!session) redirect('/admin/login');

  const supabase = createServiceRoleClient();
  const { data: admin } = await supabase
    .from('admin_users')
    .select('*, roles(name)')
    .eq('id', session!.adminId)
    .eq('status', 'active')
    .maybeSingle();

  if (!admin) redirect('/admin/login');
  return { admin, supabase, role: (admin as any).roles?.name ?? session!.role };
}

// Route-handler variant — API routes can't call redirect(), so this
// returns null (unauthorized) instead of redirecting; the caller returns
// a 401 JSON response.
import { cookies as cookiesFn } from 'next/headers';
export async function getAdminOrNull() {
  const token = cookiesFn().get('uh_admin_session')?.value;
  const session = verifyAdminSessionToken(token);
  if (!session) return null;

  const supabase = createServiceRoleClient();
  const { data: admin } = await supabase
    .from('admin_users')
    .select('*, roles(name)')
    .eq('id', session.adminId)
    .eq('status', 'active')
    .maybeSingle();

  if (!admin) return null;
  return { admin, supabase, role: (admin as any).roles?.name ?? session.role };
}
