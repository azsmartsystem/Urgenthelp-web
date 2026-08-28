// Runs the matching engine against verified, available helpers who offer
// this booking's service, persists matching_results + helper_offers,
// notifies matched helpers, and returns the ranked list.

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { canTransition } from '@/lib/booking/state-machine';
import { runMatching } from '@/lib/ai/matching';
import type { MatchCandidateInput } from '@/lib/ai/types';
import { notify } from '@/lib/notifications/notify';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Verify the caller owns this booking and that matching is a legal
  // transition before doing any service-role work below.
  const { supabase: sessionSupabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const { data: ownedBooking } = await sessionSupabase
    .from('bookings')
    .select('id, status, customer_profiles!inner(user_id)')
    .eq('id', params.id)
    .eq('customer_profiles.user_id', appUser.id)
    .maybeSingle();
  if (!ownedBooking) return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  if (!canTransition(ownedBooking.status as any, 'matched')) {
    return NextResponse.json(
      { error: { code: 'INVALID_STATE', message: `Booking is ${ownedBooking.status}, cannot run matching.` } },
      { status: 409 }
    );
  }

  const supabase = createServiceRoleClient();

  const { data: booking } = await supabase.from('bookings').select('*, addresses(*), services(*)').eq('id', params.id).single();
  if (!booking) {
    return NextResponse.json({ error: { code: 'BOOKING_NOT_FOUND' } }, { status: 404 });
  }

  // Candidate retrieval + filtering (§10): verified, online helpers offering this service.
  const { data: candidates } = await supabase
    .from('helper_skills')
    .select('helper_id, helper_profiles!inner(id, user_id, verification_status, availability_status, trust_score_cached, years_experience, service_areas(center_lat, center_lng))')
    .eq('service_id', booking.service_id)
    .eq('is_active', true);

  const address = (booking as any).addresses;
  const eligible = (candidates ?? [])
    .map((row: any) => row.helper_profiles)
    .filter((h: any) => h.verification_status === 'verified' && h.availability_status === 'online');

  const matchInputs: MatchCandidateInput[] = eligible.map((h: any) => {
    const area = h.service_areas?.[0];
    return {
      helperId: h.id,
      lat: area?.center_lat ?? address.lat,
      lng: area?.center_lng ?? address.lng,
      rating: 4.7, // read from a reviews aggregate in production; simplified here
      trustScore: h.trust_score_cached ?? 80,
      yearsExperience: h.years_experience ?? 1,
      isAvailable: true,
    };
  });

  const result = await runMatching(matchInputs, address.lat, address.lng);

  if (result.ranked.length === 0) {
    return NextResponse.json(
      { error: { code: 'NO_AVAILABLE_HELPERS', message: 'No verified helpers are available nearby right now.' } },
      { status: 422 }
    );
  }

  const { data: matchingResult } = await supabase
    .from('matching_results')
    .insert({ booking_id: booking.id, model_version: result.modelVersion, candidate_count: result.ranked.length })
    .select()
    .single();

  const offers = result.ranked.slice(0, 5).map((r, i) => ({
    matching_result_id: matchingResult!.id,
    helper_id: r.helperId,
    rank: i + 1,
    match_score: r.matchScore,
    score_breakdown_json: r.breakdown,
    status: 'notified',
  }));
  await supabase.from('helper_offers').insert(offers);

  await supabase.from('ai_decisions').insert({
    engine: 'matching',
    subject_type: 'booking',
    subject_id: booking.id,
    input_snapshot_json: { candidateCount: matchInputs.length },
    output_json: { ranked: result.ranked },
    confidence_score: result.confidenceScore,
    model_version: result.modelVersion,
  });

  await supabase.from('bookings').update({ status: 'matched' }).eq('id', booking.id);
  await supabase.from('booking_status_history').insert({
    booking_id: booking.id,
    from_status: 'requested',
    to_status: 'matched',
    reason: 'AI matching pipeline completed',
  });

  // Notify each offered helper.
  for (const r of result.ranked.slice(0, 5)) {
    const helper = eligible.find((h: any) => h.id === r.helperId);
    if (helper) {
      await notify(supabase, {
        userId: helper.user_id,
        modeContext: 'helper',
        type: 'job_opportunity',
        title: 'New job opportunity nearby',
        body: `A ${booking.urgency === 'urgent' ? 'urgent' : ''} ${booking.services?.name ?? 'job'} request matches your skills.`,
        dataJson: { bookingId: booking.id, matchScore: r.matchScore },
        category: 'ai_match',
      });
    }
  }

  return NextResponse.json({
    booking_id: booking.id,
    candidates: result.ranked.slice(0, 5),
    model_version: result.modelVersion,
    fallback_used: result.fallbackUsed,
  });
}
