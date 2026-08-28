import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminOrNull } from '@/lib/auth/admin-guard';

const BodySchema = z.object({ status: z.enum(['active', 'suspended', 'banned']) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminOrNull();
  if (!session) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  const { data: before } = await session.supabase.from('users').select('status').eq('id', params.id).single();
  const { error } = await session.supabase.from('users').update({ status: parsed.data.status }).eq('id', params.id);
  if (error) return NextResponse.json({ error: { code: 'UPDATE_FAILED', message: error.message } }, { status: 500 });

  await session.supabase.from('audit_logs').insert({
    actor_type: 'admin',
    actor_id: session.admin.id,
    action: 'user_status_change',
    entity_type: 'users',
    entity_id: params.id,
    before_json: before,
    after_json: { status: parsed.data.status },
  });

  return NextResponse.json({ ok: true });
}
