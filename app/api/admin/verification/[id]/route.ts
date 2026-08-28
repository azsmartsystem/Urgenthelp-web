// POST /api/admin/verification/{helper_profile_id} — approve/reject.
// On approve: verification_status -> verified, unlocks the availability
// toggle (gated on this status in app/helper/page.tsx and
// AvailabilityToggle's `disabled` prop). On reject: status -> rejected
// with a required reason. Helper is notified either way.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminOrNull } from '@/lib/auth/admin-guard';
import { notify } from '@/lib/notifications/notify';

const BodySchema = z.object({
  decision: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminOrNull();
  if (!session) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });
  if (parsed.data.decision === 'reject' && !parsed.data.reason) {
    return NextResponse.json({ error: { code: 'REASON_REQUIRED' } }, { status: 400 });
  }

  const supabase = session.supabase;
  const { data: helper } = await supabase.from('helper_profiles').select('*').eq('id', params.id).single();
  if (!helper) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });

  const newStatus = parsed.data.decision === 'approve' ? 'verified' : 'rejected';

  await supabase.from('helper_profiles').update({ verification_status: newStatus }).eq('id', helper.id);

  await supabase
    .from('verification_records')
    .update({
      status: parsed.data.decision === 'approve' ? 'approved' : 'rejected',
      reviewed_by: session.admin.id,
      reviewed_at: new Date().toISOString(),
      rejection_reason: parsed.data.reason ?? null,
    })
    .eq('user_id', helper.user_id)
    .eq('status', 'pending');

  await supabase.from('trust_events').insert({
    user_id: helper.user_id,
    event_type: 'verification_change',
    payload_json: { decision: parsed.data.decision },
    weight: parsed.data.decision === 'approve' ? 5 : -2,
  });

  await supabase.from('audit_logs').insert({
    actor_type: 'admin',
    actor_id: session.admin.id,
    action: 'helper_verification_decision',
    entity_type: 'helper_profiles',
    entity_id: helper.id,
    before_json: { verification_status: helper.verification_status },
    after_json: { verification_status: newStatus, reason: parsed.data.reason },
  });

  await notify(supabase, {
    userId: helper.user_id,
    modeContext: 'helper',
    type: parsed.data.decision === 'approve' ? 'helper_verified' : 'helper_verification_rejected',
    title: parsed.data.decision === 'approve' ? "You're verified! 🎉" : 'Verification update needed',
    body:
      parsed.data.decision === 'approve'
        ? 'You can now go online and start accepting jobs on Urgent Help.'
        : `Your verification was not approved: ${parsed.data.reason}`,
    category: 'security',
  });

  return NextResponse.json({ ok: true, status: newStatus });
}
