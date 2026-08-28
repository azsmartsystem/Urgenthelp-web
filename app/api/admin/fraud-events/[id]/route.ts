// Fraud event confirm/dismiss. No automatic account action is taken by
// the fraud engine itself — a human admin decision is required, and
// logged here.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminOrNull } from '@/lib/auth/admin-guard';

const BodySchema = z.object({ status: z.enum(['confirmed', 'dismissed']) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminOrNull();
  if (!session) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  const { data: event } = await session.supabase.from('fraud_events').select('*').eq('id', params.id).single();
  if (!event) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });

  await session.supabase.from('fraud_events').update({ status: parsed.data.status }).eq('id', params.id);

  if (parsed.data.status === 'confirmed') {
    // Soft restriction pending review, not an automatic ban.
    await session.supabase.from('users').update({ status: 'suspended' }).eq('id', event.user_id);
  }

  await session.supabase.from('audit_logs').insert({
    actor_type: 'admin',
    actor_id: session.admin.id,
    action: 'fraud_event_decision',
    entity_type: 'fraud_events',
    entity_id: params.id,
    after_json: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
