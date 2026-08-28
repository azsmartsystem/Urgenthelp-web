import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { verifyPassword, createAdminSessionToken } from '@/lib/auth/admin';

const BodySchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  const supabase = createServiceRoleClient();
  const { data: admin } = await supabase.from('admin_users').select('*, roles(name)').eq('email', parsed.data.email).eq('status', 'active').maybeSingle();

  if (!admin || !verifyPassword(parsed.data.password, admin.password_hash)) {
    return NextResponse.json({ error: { code: 'INVALID_CREDENTIALS' } }, { status: 401 });
  }

  await supabase.from('admin_users').update({ last_login_at: new Date().toISOString() }).eq('id', admin.id);
  await supabase.from('audit_logs').insert({ actor_type: 'admin', actor_id: admin.id, action: 'admin_login', entity_type: 'admin_users', entity_id: admin.id });

  const token = createAdminSessionToken(admin.id, (admin as any).roles?.name ?? 'admin');
  const res = NextResponse.json({ ok: true });
  res.cookies.set('uh_admin_session', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
  return res;
}
