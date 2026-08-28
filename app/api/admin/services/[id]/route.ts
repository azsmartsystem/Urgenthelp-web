import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminOrNull } from '@/lib/auth/admin-guard';

const BodySchema = z.object({ is_active: z.boolean() });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminOrNull();
  if (!session) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  const { error } = await session.supabase.from('services').update({ is_active: parsed.data.is_active }).eq('id', params.id);
  if (error) return NextResponse.json({ error: { code: 'UPDATE_FAILED' } }, { status: 500 });

  await session.supabase.from('audit_logs').insert({
    actor_type: 'admin',
    actor_id: session.admin.id,
    action: 'service_status_change',
    entity_type: 'services',
    entity_id: params.id,
    after_json: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
