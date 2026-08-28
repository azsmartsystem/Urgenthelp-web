// Payment webhook handler.
// Signature-verified, idempotent (unique provider_reference constraint
// makes a replayed webhook a safe no-op), triggers commission + wallet
// posting on success.

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { verifyPaystackSignature, verifyFlutterwaveSignature } from '@/lib/payments/provider';

export async function POST(req: NextRequest, { params }: { params: { provider: string } }) {
  const rawBody = await req.text();

  if (params.provider === 'paystack') {
    const sig = req.headers.get('x-paystack-signature');
    if (!verifyPaystackSignature(rawBody, sig)) {
      return NextResponse.json({ error: { code: 'INVALID_SIGNATURE' } }, { status: 401 });
    }
  } else if (params.provider === 'flutterwave') {
    const sig = req.headers.get('verif-hash');
    if (!verifyFlutterwaveSignature(sig)) {
      return NextResponse.json({ error: { code: 'INVALID_SIGNATURE' } }, { status: 401 });
    }
  } else {
    return NextResponse.json({ error: { code: 'UNKNOWN_PROVIDER' } }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    // Signature already verified above, so this is a genuine provider bug
    // or a truncated delivery rather than an attack — ack with 200 so the
    // provider doesn't retry-storm us, but don't process anything.
    return NextResponse.json({ received: true });
  }
  const reference = params.provider === 'paystack' ? event.data?.reference : event.data?.tx_ref;
  const isSuccess =
    params.provider === 'paystack' ? event.event === 'charge.success' : event.data?.status === 'successful';

  if (!reference) return NextResponse.json({ received: true });

  const supabase = createServiceRoleClient();
  const { data: payment } = await supabase.from('payments').select('*').eq('provider_reference', reference).single();
  if (!payment) return NextResponse.json({ received: true }); // unknown ref — ack and ignore

  if (payment.status === 'successful') {
    return NextResponse.json({ received: true }); // idempotent — already processed
  }

  if (isSuccess) {
    await supabase.from('payments').update({ status: 'successful', verified_at: new Date().toISOString() }).eq('id', payment.id);
    await supabase.from('payment_transactions').insert({ payment_id: payment.id, type: 'charge', amount: payment.amount, direction: 'credit' });

    // The 3% customer service fee was already computed and locked in at
    // /api/payments/initialize time (stored on the payment row) — reusing
    // it here rather than recomputing from the current rate setting,
    // since that's the actual amount the customer was charged, and the
    // rate could theoretically change between initialize and webhook.
    const commissionAmount = Number(payment.platform_fee_amount ?? 0);
    const basePriceForRate = Number(payment.amount) - commissionAmount;
    const effectiveRate = basePriceForRate > 0 ? Number(((commissionAmount / basePriceForRate) * 100).toFixed(2)) : 0;
    if (commissionAmount > 0) {
      await supabase.from('commissions').insert({ booking_id: payment.booking_id, rate_percent: effectiveRate, amount: commissionAmount });
    }

    // Informational wallet ledger entry for the customer — doesn't touch
    // `balance`, since the charge went through Paystack/Flutterwave
    // directly rather than an actual wallet balance.
    const { data: booking } = await supabase.from('bookings').select('customer_id, customer_profiles(user_id)').eq('id', payment.booking_id).maybeSingle();
    const customerUserId = (booking as any)?.customer_profiles?.user_id;
    if (customerUserId) {
      const { data: customerWallet } = await supabase.from('wallets').select('id, balance').eq('user_id', customerUserId).maybeSingle();
      if (customerWallet) {
        await supabase.from('wallet_transactions').insert({
          wallet_id: customerWallet.id,
          type: 'booking_charge',
          amount: -payment.amount,
          balance_after: customerWallet.balance,
          reference_type: 'payment',
          reference_id: payment.id,
          idempotency_key: `charge_${payment.id}`,
        });
      }
    }

    // NOTE: helper payout wallet credit is posted on SERVICE_COMPLETED, not
    // on payment success, per the escrow behavior in the Technical
    // Implementation Spec §15.1 — funds are held until job completion.
  } else {
    await supabase.from('payments').update({ status: 'failed' }).eq('id', payment.id);
  }

  return NextResponse.json({ received: true });
}
