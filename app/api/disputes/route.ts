import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';

const BodySchema = z.object({
  bookingId: z.string().uuid(),
  type: z.enum(['payment', 'quality', 'safety', 'other']),
  description: z.string().min(10, 'Please give a few more details.').max(2000),
});

export async function POST(req: NextRequest) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0]?.message } }, { status: 400 });
  }

  // RLS (0013_disputes_self_insert.sql) is the real authorization boundary
  // here — it independently confirms this booking belongs to the caller
  // (as customer or helper) before allowing the insert, so there's no
  // separate ownership check needed in application code.
  const { data: dispute, error } = await supabase
    .from('disputes')
    .insert({
      booking_id: parsed.data.bookingId,
      raised_by: appUser.id,
      type: parsed.data.type,
      description: parsed.data.description,
      status: 'open',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: { code: 'DISPUTE_CREATE_FAILED', message: error.message } }, { status: 403 });
  }

  await supabase.from('audit_logs').insert({
    actor_type: 'user',
    actor_id: appUser.id,
    action: 'dispute_raised',
    entity_type: 'disputes',
    entity_id: dispute.id,
    after_json: { booking_id: parsed.data.bookingId, type: parsed.data.type },
  });

  return NextResponse.json(dispute, { status: 201 });
}
