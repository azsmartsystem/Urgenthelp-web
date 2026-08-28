import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminOrNull } from '@/lib/auth/admin-guard';

const BodySchema = z.object({ key: z.string().min(1), value_json: z.any() });

// Commission rate, matching weights, geofence radius etc. control real
// money and matching outcomes — restrict writes to the roles that should
// actually be touching platform economics, not every admin operator.
const ALLOWED_ROLES = ['super_admin', 'finance'];

export async function POST(req: NextRequest) {
  const session = await getAdminOrNull();
  if (!session) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });
  if (!ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Only finance or super admin can change platform settings.' } }, { status: 403 });
  }

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  const { data: before } = await session.supabase.from('platform_settings').select('value_json').eq('key', parsed.data.key).maybeSingle();

  const { error } = await session.supabase
    .from('platform_settings')
    .upsert({ key: parsed.data.key, value_json: parsed.data.value_json, updated_by: session.admin.id, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) return NextResponse.json({ error: { code: 'UPDATE_FAILED', message: error.message } }, { status: 500 });

  await session.supabase.from('audit_logs').insert({
    actor_type: 'admin',
    actor_id: session.admin.id,
    action: 'platform_setting_change',
    entity_type: 'platform_settings',
    before_json: before ? { key: parsed.data.key, value_json: before.value_json } : null,
    after_json: { key: parsed.data.key, value_json: parsed.data.value_json },
  });

  return NextResponse.json({ ok: true });
}
