// GET /v1/bookings/{id} — full booking detail for the booking detail page
// (status, participant info, tracking readiness, payment, review state).
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(
      `*, services(name, category_id), addresses(line1, city, lat, lng),
       customer_profiles(id, user_id, display_name, avatar_url),
       helper_profiles(id, user_id, display_name, avatar_url, trust_score_cached)`
    )
    .eq('id', params.id)
    .single();

  if (error || !booking) return NextResponse.json({ error: { code: 'BOOKING_NOT_FOUND' } }, { status: 404 });

  const { data: payment } = await supabase.from('payments').select('*').eq('booking_id', params.id).maybeSingle();
  const { data: reviews } = await supabase.from('reviews').select('*').eq('booking_id', params.id);

  return NextResponse.json({ ...booking, payment, reviews });
}
