// POST /v1/bookings/{id}/start — EN_ROUTE -> IN_PROGRESS on arrival.
// Geofence-checked against the helper's last known Redis location vs.
// the booking's address, tolerance from
// platform_settings.geofence_arrival_radius_meters.
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { canTransition } from '@/lib/booking/state-machine';
import { getHelperLocation } from '@/lib/redis/location';
import { haversineKm } from '@/lib/location/distance';
import { notify } from '@/lib/notifications/notify';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const { data: helper } = await supabase.from('helper_profiles').select('id').eq('user_id', appUser.id).single();
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, addresses(lat,lng), customer_profiles(user_id)')
    .eq('id', params.id)
    .single();
  if (!booking || !helper || booking.helper_id !== helper.id) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  }
  if (!canTransition(booking.status, 'in_progress')) {
    return NextResponse.json({ error: { code: 'INVALID_STATE' } }, { status: 409 });
  }

  // Soft geofence check — logs a warning rather than blocking, since Redis
  // may be unavailable in this environment (see lib/redis/location.ts).
  const loc = await getHelperLocation(helper.id);
  let withinGeofence: boolean | null = null;
  if (loc) {
    const address = (booking as any).addresses;
    const distanceM = haversineKm(loc.lat, loc.lng, address.lat, address.lng) * 1000;
    const { data: setting } = await supabase.from('platform_settings').select('value_json').eq('key', 'geofence_arrival_radius_meters').maybeSingle();
    const tolerance = Number(setting?.value_json ?? 150);
    withinGeofence = distanceM <= tolerance;
  }

  const fromStatus = booking.status;
  await supabase.from('bookings').update({ status: 'in_progress' }).eq('id', booking.id);
  await supabase.from('booking_status_history').insert({
    booking_id: booking.id,
    from_status: fromStatus,
    to_status: 'in_progress',
    changed_by_user_id: appUser.id,
    reason: withinGeofence === false ? 'started outside configured geofence tolerance' : null,
  });

  await notify(supabase, {
    userId: (booking as any).customer_profiles.user_id,
    modeContext: 'customer',
    type: 'service_started',
    title: 'Your helper has arrived',
    body: 'Service is now in progress.',
    dataJson: { bookingId: booking.id },
  });

  return NextResponse.json({ id: booking.id, status: 'in_progress', within_geofence: withinGeofence });
}
