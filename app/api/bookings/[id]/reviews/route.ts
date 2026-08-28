// POST /v1/bookings/{id}/reviews.
// Only allowed post-completion; one review per party per booking
// (enforced by the DB unique constraint too).
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { notify } from '@/lib/notifications/notify';

const BodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

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
  if (booking.status !== 'completed') {
    return NextResponse.json({ error: { code: 'INVALID_STATE', message: 'Can only review completed bookings.' } }, { status: 409 });
  }

  const isCustomer = (booking as any).customer_profiles.user_id === appUser.id;
  const isHelper = (booking as any).helper_profiles?.user_id === appUser.id;
  if (!isCustomer && !isHelper) return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });

  const revieweeId = isCustomer ? (booking as any).helper_profiles.user_id : (booking as any).customer_profiles.user_id;

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      booking_id: booking.id,
      reviewer_id: appUser.id,
      reviewee_id: revieweeId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      tags: parsed.data.tags ?? [],
    })
    .select()
    .single();

  if (error) {
    const code = error.code === '23505' ? 'ALREADY_REVIEWED' : 'REVIEW_FAILED';
    return NextResponse.json({ error: { code, message: error.message } }, { status: 409 });
  }

  await supabase.from('trust_events').insert({
    user_id: revieweeId,
    event_type: 'review_received',
    payload_json: { bookingId: booking.id, rating: parsed.data.rating },
    weight: 1,
  });

  await notify(supabase, {
    userId: revieweeId,
    modeContext: isCustomer ? 'helper' : 'customer',
    type: 'review_received',
    title: 'You received a new review',
    body: `${parsed.data.rating}-star review on a recent booking.`,
    dataJson: { bookingId: booking.id },
  });

  return NextResponse.json(review, { status: 201 });
}
