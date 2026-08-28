import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminOrNull } from '@/lib/auth/admin-guard';
import { notify } from '@/lib/notifications/notify';

const BodySchema = z.object({ status: z.enum(['resolved', 'rejected']), resolution: z.string().min(1) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminOrNull();
  if (!session) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  const { data: dispute } = await session.supabase
    .from('disputes')
    .select('*, bookings(customer_profiles(user_id), helper_profiles(user_id))')
    .eq('id', params.id)
    .single();
  if (!dispute) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });

  await session.supabase
    .from('disputes')
    .update({ status: parsed.data.status, resolution: parsed.data.resolution, resolved_by: session.admin.id })
    .eq('id', params.id);

  await session.supabase.from('audit_logs').insert({
    actor_type: 'admin',
    actor_id: session.admin.id,
    action: 'dispute_resolved',
    entity_type: 'disputes',
    entity_id: params.id,
    after_json: parsed.data,
  });

  // Notify both parties.
  const customerUserId = (dispute as any).bookings?.customer_profiles?.user_id;
  const helperUserId = (dispute as any).bookings?.helper_profiles?.user_id;
  for (const uid of [customerUserId, helperUserId].filter(Boolean)) {
    await notify(session.supabase, {
      userId: uid,
      modeContext: 'system',
      type: 'dispute_resolved',
      title: 'Dispute update',
      body: parsed.data.resolution,
      category: 'security',
    });
  }

  return NextResponse.json({ ok: true });
}
