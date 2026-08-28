// POST /v1/payments/initialize equivalent.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { initializePayment, PaymentProviderUnavailableError } from '@/lib/payments/provider';

const BodySchema = z.object({
  booking_id: z.string().uuid(),
  provider: z.enum(['paystack', 'flutterwave']),
});

export async function POST(req: NextRequest) {
  const { supabase, authUser, appUser } = await getCurrentAppUserServer();
  if (!authUser || !appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } }, { status: 400 });
  }

  const { data: booking } = await supabase.from('bookings').select('*, customer_profiles(user_id)').eq('id', parsed.data.booking_id).single();
  if (!booking) return NextResponse.json({ error: { code: 'BOOKING_NOT_FOUND' } }, { status: 404 });

  // Ownership check — a booking can only be paid for by the customer who
  // created it. Without this, any authenticated user could pass any
  // booking_id and initialize a payment against it.
  if ((booking as any).customer_profiles?.user_id !== appUser.id) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Not your booking.' } }, { status: 403 });
  }
  if (!booking.final_price && !booking.price_recommended) {
    return NextResponse.json({ error: { code: 'NO_PRICE_SET' } }, { status: 422 });
  }

  // Idempotency: if a pending/successful payment already exists for this
  // booking, reuse it instead of creating a duplicate charge.
  const { data: existing } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', booking.id)
    .in('status', ['pending', 'successful'])
    .maybeSingle();
  if (existing?.status === 'successful') {
    return NextResponse.json({ error: { code: 'ALREADY_PAID' } }, { status: 409 });
  }

  const reference = `uh_${booking.id}_${randomUUID().slice(0, 8)}`;
  const basePrice = booking.final_price ?? booking.price_recommended;

  // 3% customer service fee, charged on top of the job price — configurable
  // via platform_settings.customer_service_fee_percent (admin Settings page).
  const { data: feeSetting } = await supabase.from('platform_settings').select('value_json').eq('key', 'customer_service_fee_percent').maybeSingle();
  const feeRate = Number(feeSetting?.value_json ?? 3);
  const platformFeeAmount = Math.round((basePrice * feeRate) / 100);
  const amount = basePrice + platformFeeAmount;

  try {
    const result = await initializePayment(parsed.data.provider, {
      bookingId: booking.id,
      amount,
      currency: 'NGN',
      customerEmail: authUser.email ?? `${appUser.id}@urgenthelp.app`,
      reference,
    });

    await supabase.from('payments').insert({
      booking_id: booking.id,
      provider: parsed.data.provider,
      provider_reference: result.providerReference,
      amount,
      platform_fee_amount: platformFeeAmount,
      currency: 'NGN',
      status: 'pending',
    });

    return NextResponse.json({
      checkout_url: result.checkoutUrl,
      reference: result.providerReference,
      base_price: basePrice,
      service_fee: platformFeeAmount,
      total_amount: amount,
    });
  } catch (err) {
    if (err instanceof PaymentProviderUnavailableError) {
      // Documented pattern: isolate the blocked integration, don't break the
      // rest of the flow. Return a clear, typed error the UI can show as a
      // "payments coming online shortly" state rather than a crash.
      return NextResponse.json(
        { error: { code: 'PAYMENT_PROVIDER_UNAVAILABLE', message: err.message } },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: { code: 'PAYMENT_INIT_FAILED' } }, { status: 500 });
  }
}
