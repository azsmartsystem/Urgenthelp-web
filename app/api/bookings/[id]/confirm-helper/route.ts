// POST /v1/bookings/{id}/confirm-helper — customer confirms the accepted
// helper. Booking stays `accepted`; this is the explicit "AI assists, user
// decides" checkpoint before payment is requested.
//
// Unlike accept/cancel/match/start, this route doesn't move the booking to
// a new status — it's a precondition check ("must currently be accepted"),
// not a state transition. lib/booking/state-machine.ts models transitions
// (X -> Y), not "stay in X"; canTransition('accepted', 'accepted') would
// return false, since self-transitions aren't (and shouldn't be) modeled
// there. The inline check below is the correct tool for this, not a gap.
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { notify } from '@/lib/notifications/notify';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, customer_profiles(user_id), helper_profiles(user_id, display_name)')
    .eq('id', params.id)
    .single();
  if (!booking) return NextResponse.json({ error: { code: 'BOOKING_NOT_FOUND' } }, { status: 404 });
  if ((booking as any).customer_profiles.user_id !== appUser.id) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  }
  if (booking.status !== 'accepted') {
    return NextResponse.json({ error: { code: 'INVALID_STATE' } }, { status: 409 });
  }

  await notify(supabase, {
    userId: (booking as any).helper_profiles.user_id,
    modeContext: 'helper',
    type: 'booking_confirmed',
    title: 'Booking confirmed',
    body: 'The customer confirmed you for this job. Proceed to payment.',
    dataJson: { bookingId: booking.id },
  });

  return NextResponse.json({ id: booking.id, status: booking.status, confirmed: true });
}
