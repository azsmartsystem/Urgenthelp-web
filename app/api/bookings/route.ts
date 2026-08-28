// POST /v1/bookings equivalent.
// Creates a booking in `requested`, synchronously calls the AI Pricing
// Engine (with fallback), and returns the price estimate to the client —
// mirrors the "AI Matching" screen's price step in the approved design.
// GET returns the current user's bookings (customer or helper side,
// depending on active_mode) for the dashboard/booking-history views.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { estimatePrice } from '@/lib/ai/pricing';
import { haversineKm } from '@/lib/location/distance';
import { notify } from '@/lib/notifications/notify';

const BodySchema = z.object({
  service_id: z.string().uuid(),
  address_id: z.string().uuid(),
  scheduled_at: z.string().datetime().nullable().optional(),
  urgency: z.enum(['standard', 'urgent']).default('standard'),
  notes: z.string().max(2000).optional(),
  media_file_ids: z.array(z.string().uuid()).max(6).optional(),
});

export async function GET(req: NextRequest) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const status = req.nextUrl.searchParams.get('status');

  const { data: customerProfile } = await supabase.from('customer_profiles').select('id').eq('user_id', appUser.id).maybeSingle();
  const { data: helperProfile } = await supabase.from('helper_profiles').select('id').eq('user_id', appUser.id).maybeSingle();

  let query = supabase
    .from('bookings')
    .select('*, services(name, category_id), addresses(line1, city, lat, lng)')
    .order('created_at', { ascending: false });

  if (appUser.active_mode === 'helper' && helperProfile) {
    query = query.eq('helper_id', helperProfile.id);
  } else if (customerProfile) {
    query = query.eq('customer_id', customerProfile.id);
  } else {
    return NextResponse.json({ data: [] });
  }
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: { code: 'QUERY_FAILED', message: error.message } }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) {
    return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in required.' } }, { status: 401 });
  }

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid request body.', details: parsed.error.flatten() } },
      { status: 400 }
    );
  }
  const body = parsed.data;

  const { data: customerProfile } = await supabase
    .from('customer_profiles')
    .select('id')
    .eq('user_id', appUser.id)
    .single();
  if (!customerProfile) {
    return NextResponse.json({ error: { code: 'NO_CUSTOMER_PROFILE', message: 'Complete customer onboarding first.' } }, { status: 422 });
  }

  const { data: service } = await supabase.from('services').select('*').eq('id', body.service_id).single();
  if (!service) {
    return NextResponse.json({ error: { code: 'SERVICE_NOT_FOUND', message: 'Unknown service.' } }, { status: 404 });
  }

  const { data: address } = await supabase.from('addresses').select('*').eq('id', body.address_id).eq('user_id', appUser.id).single();
  if (!address) {
    return NextResponse.json({ error: { code: 'ADDRESS_NOT_FOUND', message: 'Address not found on your account.' } }, { status: 422 });
  }

  // Rough distance estimate against platform "center" until a helper is matched —
  // real per-candidate distance is computed in the matching step (lib/ai/matching.ts).
  const distanceKm = haversineKm(address.lat, address.lng, address.lat, address.lng) || 3;

  const pricing = await estimatePrice({
    serviceId: service.id,
    basePriceMin: service.base_price_min,
    basePriceMax: service.base_price_max,
    distanceKm,
    durationMinutes: 120,
    urgency: body.urgency,
  });

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      customer_id: customerProfile.id,
      service_id: service.id,
      address_id: address.id,
      scheduled_at: body.scheduled_at ?? null,
      urgency: body.urgency,
      notes: body.notes,
      status: 'requested',
      price_min: pricing.priceMin,
      price_recommended: pricing.priceRecommended,
      price_max: pricing.priceMax,
      price_confidence: pricing.confidenceScore,
    })
    .select()
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: { code: 'BOOKING_CREATE_FAILED', message: error?.message } }, { status: 500 });
  }

  const { error: historyError } = await supabase.from('booking_status_history').insert({
    booking_id: booking.id,
    from_status: null,
    to_status: 'requested',
    changed_by_user_id: appUser.id,
  });
  if (historyError) console.error('booking_status_history insert failed', booking.id, historyError);

  // Link any request-time job photos uploaded via /api/files/upload-url
  // before the booking existed — each file was already ownership- and
  // size/type-checked at upload time, so this is just the attach step.
  if (body.media_file_ids && body.media_file_ids.length > 0) {
    const { data: ownedFiles } = await supabase
      .from('files')
      .select('id')
      .in('id', body.media_file_ids)
      .eq('owner_user_id', appUser.id)
      .eq('purpose', 'job_photo');
    const validIds = (ownedFiles ?? []).map((f) => f.id);
    if (validIds.length > 0) {
      await supabase.from('booking_media').insert(
        validIds.map((fileId) => ({ booking_id: booking.id, file_id: fileId, uploaded_by: appUser.id, stage: 'request' as const }))
      );
    }
  }

  await supabase.from('ai_price_recommendations').insert({
    booking_id: booking.id,
    price_min: pricing.priceMin,
    price_recommended: pricing.priceRecommended,
    price_max: pricing.priceMax,
    confidence_score: pricing.confidenceScore,
    model_version: pricing.modelVersion,
    input_snapshot_json: { serviceId: service.id, distanceKm, urgency: body.urgency },
  }).then(({ error }) => {
    if (error) console.error('ai_price_recommendations insert failed', booking.id, error);
  });

  await notify(supabase, {
    userId: appUser.id,
    modeContext: 'customer',
    type: 'booking_created',
    title: 'Request received',
    body: `We're finding verified helpers for your ${service.name} request.`,
    dataJson: { bookingId: booking.id },
  }).catch((err) => console.error('notify() failed for booking_created', booking.id, err));

  return NextResponse.json(
    {
      id: booking.id,
      status: booking.status,
      price_estimate: {
        min: pricing.priceMin,
        recommended: pricing.priceRecommended,
        max: pricing.priceMax,
        confidence: pricing.confidenceScore,
        explanation: pricing.explanation,
        fallback_used: pricing.fallbackUsed,
      },
    },
    { status: 201 }
  );
}
