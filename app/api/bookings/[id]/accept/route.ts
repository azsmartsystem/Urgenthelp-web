// POST /v1/jobs/{offer_id}/accept equivalent — Technical Implementation
// Spec §7.9 / §8 state machine: MATCHED -> ACCEPTED. Helper accepts one of
// their notified offers; all other offers on this booking are expired
// (first-writer-wins), and the customer is notified so they can confirm.

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { canTransition } from '@/lib/booking/state-machine';
import { notify } from '@/lib/notifications/notify';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const { data: helper } = await supabase.from('helper_profiles').select('*').eq('user_id', appUser.id).single();
  if (!helper || helper.verification_status !== 'verified') {
    return NextResponse.json({ error: { code: 'NOT_A_VERIFIED_HELPER' } }, { status: 403 });
  }

  const { data: booking } = await supabase.from('bookings').select('*, customer_profiles(user_id)').eq('id', params.id).single();
  if (!booking) return NextResponse.json({ error: { code: 'BOOKING_NOT_FOUND' } }, { status: 404 });
  if (!canTransition(booking.status, 'accepted')) {
    return NextResponse.json({ error: { code: 'INVALID_STATE', message: `Booking is ${booking.status}, cannot accept.` } }, { status: 409 });
  }

  const { data: matchingResult } = await supabase.from('matching_results').select('id').eq('booking_id', booking.id).order('generated_at', { ascending: false }).limit(1).single();
  const { data: offer } = await supabase
    .from('helper_offers')
    .select('*')
    .eq('matching_result_id', matchingResult?.id)
    .eq('helper_id', helper.id)
    .single();
  if (!offer || offer.status !== 'notified') {
    return NextResponse.json({ error: { code: 'OFFER_NOT_AVAILABLE', message: 'This offer has expired or was already taken.' } }, { status: 409 });
  }

  // First-writer-wins: this update only succeeds if still `matched`.
  const { data: updated } = await supabase
    .from('bookings')
    .update({ status: 'accepted', helper_id: helper.id })
    .eq('id', booking.id)
    .eq('status', 'matched')
    .select()
    .single();

  if (!updated) {
    return NextResponse.json({ error: { code: 'ALREADY_ACCEPTED', message: 'Another helper already accepted this job.' } }, { status: 409 });
  }

  await supabase.from('helper_offers').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('id', offer.id);
  await supabase
    .from('helper_offers')
    .update({ status: 'expired' })
    .eq('matching_result_id', matchingResult?.id)
    .neq('id', offer.id);

  await supabase.from('booking_status_history').insert({
    booking_id: booking.id,
    from_status: 'matched',
    to_status: 'accepted',
    changed_by_user_id: appUser.id,
  });

  // Booking-linked conversation is created now so messaging is
  // available as soon as a helper and customer are paired.
  const { data: existingConvo } = await supabase.from('conversations').select('id').eq('booking_id', booking.id).maybeSingle();
  if (!existingConvo) {
    const { data: convo } = await supabase.from('conversations').insert({ booking_id: booking.id, type: 'booking' }).select().single();
    if (convo) {
      await supabase.from('conversation_participants').insert([
        { conversation_id: convo.id, user_id: appUser.id },
        { conversation_id: convo.id, user_id: (booking as any).customer_profiles.user_id },
      ]);
    }
  }

  await notify(supabase, {
    userId: (booking as any).customer_profiles.user_id,
    modeContext: 'customer',
    type: 'helper_accepted',
    title: 'Helper found!',
    body: `${helper.display_name} accepted your request. Confirm to proceed.`,
    dataJson: { bookingId: booking.id, helperId: helper.id },
  });

  return NextResponse.json({ id: booking.id, status: 'accepted', helper_id: helper.id });
}
