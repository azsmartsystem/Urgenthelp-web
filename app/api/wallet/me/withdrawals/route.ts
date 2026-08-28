// POST /v1/wallet/me/withdrawals.
// Helper requests a payout to a saved bank account. Creates a `requested`
// row; actual bank transfer requires a payout provider integration
// (Paystack Transfers / Flutterwave Transfers) which is isolated behind
// PAYSTACK_SECRET_KEY / FLUTTERWAVE_SECRET_KEY the same way payment
// initialization is — if not configured, the request is recorded and
// clearly marked as pending manual processing instead of silently failing.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';

const BodySchema = z.object({ amount: z.number().positive(), bank_account_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  const { data: helper } = await supabase.from('helper_profiles').select('id').eq('user_id', appUser.id).single();
  if (!helper) return NextResponse.json({ error: { code: 'NOT_A_HELPER' } }, { status: 403 });

  const { data: wallet } = await supabase.from('wallets').select('id').eq('user_id', appUser.id).single();
  if (!wallet) return NextResponse.json({ error: { code: 'WALLET_NOT_FOUND' } }, { status: 404 });

  // 12% platform fee on withdrawal — configurable via platform_settings
  // (admin Settings page), same pattern as the customer-side service fee.
  const { data: feeSetting } = await supabase.from('platform_settings').select('value_json').eq('key', 'commission_rate_percent').maybeSingle();
  const feeRate = Number(feeSetting?.value_json ?? 12);

  // Atomic check-and-debit via a Postgres function (supabase/migrations/
  // 0006_atomic_wallet_debit.sql, extended in 0016_withdrawal_fee.sql) — a
  // plain select-then-update here would let two concurrent withdrawal
  // requests both pass the balance check and over-withdraw. See migration
  // comments for the full rationale.
  const { data: result, error } = await supabase.rpc('request_withdrawal', {
    p_wallet_id: wallet.id,
    p_helper_id: helper.id,
    p_amount: parsed.data.amount,
    p_bank_account_id: parsed.data.bank_account_id,
    p_fee_rate_percent: feeRate,
  });

  if (error) {
    if (error.message?.includes('INSUFFICIENT_BALANCE')) {
      return NextResponse.json({ error: { code: 'INSUFFICIENT_BALANCE' } }, { status: 422 });
    }
    return NextResponse.json({ error: { code: 'WITHDRAWAL_FAILED', message: error.message } }, { status: 500 });
  }

  const row = Array.isArray(result) ? result[0] : result;
  const payoutProviderConfigured = Boolean(process.env.PAYSTACK_SECRET_KEY || process.env.FLUTTERWAVE_SECRET_KEY);

  return NextResponse.json(
    {
      id: row.withdrawal_id,
      balance_after: row.balance_after,
      requested_amount: parsed.data.amount,
      fee_amount: row.fee_amount,
      net_amount: row.net_amount,
      fee_rate_percent: feeRate,
      payout_provider_configured: payoutProviderConfigured,
      message: payoutProviderConfigured
        ? `Withdrawal requested — ₦${Number(row.net_amount).toLocaleString()} net (after ${feeRate}% fee) will be sent to your bank.`
        : 'Withdrawal recorded. Automatic bank transfer requires PAYSTACK_SECRET_KEY or FLUTTERWAVE_SECRET_KEY to be configured; until then, withdrawals are processed manually by finance.',
    },
    { status: 201 }
  );
}
