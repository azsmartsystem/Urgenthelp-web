// POST /v1/bookings/{id}/cancel.
// Customer/helper can cancel before `in_progress`. Refund logic is
// simplified: full refund if a successful payment exists.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { canTransition } from '@/lib/booking/state-machine';
import { notify } from '@/lib/notifications/notify';

const BodySchema = z.object({ reason: z.string().min(1).max(500) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, customer_profiles(user_id), helper_profiles(user_id)')
    .eq('id', params.id)
    .single();
  if (!booking) return NextResponse.json({ error: { code: 'BOOKING_NOT_FOUND' } }, { status: 404 });

  const isCustomer = (booking as any).customer_profiles.user_id === appUser.id;
  const isHelper = (booking as any).helper_profiles?.user_id === appUser.id;
  if (!isCustomer && !isHelper) return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  if (!canTransition(booking.status, 'cancelled')) {
    return NextResponse.json({ error: { code: 'INVALID_STATE', message: `Cannot cancel a ${booking.status} booking.` } }, { status: 409 });
  }

  const cancelledBy = isCustomer ? 'customer' : 'helper';

  await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_by: cancelledBy, cancellation_reason: parsed.data.reason })
    .eq('id', booking.id);
  await supabase.from('booking_status_history').insert({
    booking_id: booking.id,
    from_status: booking.status,
    to_status: 'cancelled',
    changed_by_user_id: appUser.id,
    reason: parsed.data.reason,
  });

  const { data: payment } = await supabase.from('payments').select('*').eq('booking_id', booking.id).eq('status', 'successful').maybeSingle();
  if (payment) {
    await supabase.from('refunds').insert({ payment_id: payment.id, amount: payment.amount, reason: 'booking_cancelled', status: 'pending', initiated_by: appUser.id });
  }

  const otherPartyUserId = isCustomer ? (booking as any).helper_profiles?.user_id : (booking as any).customer_profiles.user_id;
  if (otherPartyUserId) {
    await notify(supabase, {
      userId: otherPartyUserId,
      modeContext: isCustomer ? 'helper' : 'customer',
      type: 'booking_cancelled',
      title: 'Booking cancelled',
      body: parsed.data.reason,
      dataJson: { bookingId: booking.id },
    });
  }

  return NextResponse.json({ id: booking.id, status: 'cancelled' });
}
