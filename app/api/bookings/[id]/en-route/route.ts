// POST /v1/bookings/{id}/en-route — ACCEPTED -> EN_ROUTE, when the
// helper sets off for the job. `en_route` is a defined booking status
// used by the tracking UI and the location-ping route, so this route
// set a booking to this status, so bookings jumped straight from
// `accepted` to `in_progress` and the tracking screen never triggered.
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { canTransition } from '@/lib/booking/state-machine';
import { notify } from '@/lib/notifications/notify';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const { data: helper } = await supabase.from('helper_profiles').select('id').eq('user_id', appUser.id).single();
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, customer_profiles(user_id)')
    .eq('id', params.id)
    .single();
  if (!booking || !helper || booking.helper_id !== helper.id) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  }
  if (!canTransition(booking.status, 'en_route')) {
    return NextResponse.json({ error: { code: 'INVALID_STATE', message: `Booking is ${booking.status}, cannot start en route.` } }, { status: 409 });
  }

  const { data: updated } = await supabase
    .from('bookings')
    .update({ status: 'en_route' })
    .eq('id', booking.id)
    .eq('status', booking.status)
    .select()
    .single();
  if (!updated) return NextResponse.json({ error: { code: 'INVALID_STATE' } }, { status: 409 });

  await supabase.from('booking_status_history').insert({
    booking_id: booking.id,
    from_status: booking.status,
    to_status: 'en_route',
    changed_by_user_id: appUser.id,
  });

  await notify(supabase, {
    userId: (booking as any).customer_profiles.user_id,
    modeContext: 'customer',
    type: 'helper_en_route',
    title: 'Your helper is on the way',
    body: 'Track their live location and ETA.',
    dataJson: { bookingId: booking.id },
  });

  return NextResponse.json({ id: booking.id, status: 'en_route' });
}
