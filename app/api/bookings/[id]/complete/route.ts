// POST /v1/bookings/{id}/complete — IN_PROGRESS -> COMPLETED. Sets
// final_price, settles the payment (commission + helper wallet payout,
// escrow release), and prompts both parties to review.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { canTransition } from '@/lib/booking/state-machine';
import { notify } from '@/lib/notifications/notify';
import { ensureWallet } from '@/lib/wallet/ensure-wallet';

const BodySchema = z.object({ final_price: z.number().positive().optional() });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  const { data: helper } = await supabase.from('helper_profiles').select('id, user_id').eq('user_id', appUser.id).single();

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, customer_profiles(user_id)')
    .eq('id', params.id)
    .single();
  if (!booking || !helper || booking.helper_id !== helper.id) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  }
  if (!canTransition(booking.status, 'completed')) {
    return NextResponse.json({ error: { code: 'INVALID_STATE' } }, { status: 409 });
  }

  const finalPrice = parsed.success && parsed.data.final_price ? parsed.data.final_price : booking.price_recommended;

  await supabase.from('bookings').update({ status: 'completed', final_price: finalPrice }).eq('id', booking.id);
  await supabase.from('booking_status_history').insert({
    booking_id: booking.id,
    from_status: 'in_progress',
    to_status: 'completed',
    changed_by_user_id: appUser.id,
  });

  // Escrow release + helper wallet payout (spec §15.1 — funds held until
  // completion, not on payment success). The platform's cut no longer
  // comes from this step — it was already collected as the 3% customer
  // service fee at payment time (see the webhook handler), and the
  // helper's own cut is taken later, at withdrawal time (12% withdrawal
  // fee — see request_withdrawal). The helper's wallet is credited the
  // full booking price here.
  const { data: payment } = await supabase.from('payments').select('*').eq('booking_id', booking.id).eq('status', 'successful').maybeSingle();
  if (payment) {
    const payoutAmount = finalPrice;

    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', helper.user_id).maybeSingle();
    const helperWallet = wallet ?? (await ensureWallet(supabase, helper.user_id).catch((err) => {
      console.error('Wallet provisioning failed at booking completion for helper', helper.user_id, err);
      return null;
    }));
    if (helperWallet) {
      // Atomic credit avoids a lost-update race when two completions for
      // the same helper land concurrently.
      const { data: creditResult, error: creditError } = await supabase
        .rpc('credit_wallet_payout', {
          p_wallet_id: helperWallet.id,
          p_amount: payoutAmount,
          p_reference_type: 'booking',
          p_reference_id: booking.id,
          p_idempotency_key: `payout_${booking.id}`,
        })
        .single();
      if (creditError) {
        console.error('Wallet payout failed for booking', booking.id, creditError);
      }
      void creditResult;
    }

    await supabase.from('payment_transactions').insert([
      { payment_id: payment.id, type: 'payout_to_helper', amount: payoutAmount, direction: 'debit' },
    ]);
  }

  // Trust event feed — async scoring job would consume this;
  // here we also nudge the cached score directly so the UI reflects it.
  await supabase.from('trust_events').insert([
    { user_id: helper.user_id, event_type: 'booking_completed', payload_json: { bookingId: booking.id }, weight: 1 },
    { user_id: (booking as any).customer_profiles.user_id, event_type: 'booking_completed', payload_json: { bookingId: booking.id }, weight: 1 },
  ]);

  await notify(supabase, {
    userId: (booking as any).customer_profiles.user_id,
    modeContext: 'customer',
    type: 'booking_completed',
    title: 'Service completed',
    body: 'How was your experience? Leave a review.',
    dataJson: { bookingId: booking.id },
  });
  await notify(supabase, {
    userId: helper.user_id,
    modeContext: 'helper',
    type: 'booking_completed',
    title: 'Job completed',
    body: 'Payment has been added to your wallet.',
    dataJson: { bookingId: booking.id },
  });

  return NextResponse.json({ id: booking.id, status: 'completed', final_price: finalPrice });
}
