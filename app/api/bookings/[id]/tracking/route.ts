// GET /v1/bookings/{id}/tracking.
// Returns the helper's last known live location (from Redis) + ETA for
// the Live Tracking screen. Falls back to a clear "unavailable" flag
// (rather than a fake/stale position) if Redis isn't configured or the
// helper hasn't pinged recently.
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { getHelperLocation } from '@/lib/redis/location';
import { haversineKm } from '@/lib/location/distance';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, addresses(lat,lng), customer_profiles(user_id), helper_profiles(id,user_id,display_name)')
    .eq('id', params.id)
    .single();
  if (!booking) return NextResponse.json({ error: { code: 'BOOKING_NOT_FOUND' } }, { status: 404 });

  const isParticipant =
    (booking as any).customer_profiles.user_id === appUser.id || (booking as any).helper_profiles?.user_id === appUser.id;
  if (!isParticipant) return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });

  if (!(booking as any).helper_profiles) {
    return NextResponse.json({ available: false, reason: 'no_helper_assigned' });
  }

  const loc = await getHelperLocation((booking as any).helper_profiles.id);
  if (!loc) {
    return NextResponse.json({ available: false, reason: 'no_recent_ping' });
  }

  const address = (booking as any).addresses;
  const distanceKm = haversineKm(loc.lat, loc.lng, address.lat, address.lng);
  // Rough ETA at 30km/h average urban speed — replace with a real Maps
  // provider distance-matrix call once MAPS_PROVIDER_API_KEY is set.
  const etaMinutes = Math.max(1, Math.round((distanceKm / 30) * 60));

  return NextResponse.json({
    available: true,
    helper_location: { lat: loc.lat, lng: loc.lng, updated_at: loc.at },
    destination: { lat: address.lat, lng: address.lng },
    distance_km: Number(distanceKm.toFixed(2)),
    eta_minutes: etaMinutes,
    helper_name: (booking as any).helper_profiles.display_name,
    booking_status: booking.status,
  });
}
