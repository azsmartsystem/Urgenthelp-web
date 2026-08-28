-- 0016_withdrawal_fee.sql
--
-- Implements the platform's actual fee structure as specified: a 3%
-- service fee charged to customers at payment (already implemented —
-- see app/api/payments/initialize/route.ts, reads
-- customer_service_fee_percent) and, new in this migration, a 12%
-- service fee charged to helpers at withdrawal time. The helper still
-- receives 100% of the job price into their wallet at booking
-- completion (unchanged) — the fee is deducted only when they actually
-- cash out to their bank, not from the job payout itself.
--
-- Repurposes the existing (already seeded, already defaulted to 12)
-- `commission_rate_percent` setting for this, since nothing in the
-- codebase actually used it for a real deduction anymore — it was
-- vestigial. Renamed in the admin Settings page UI, not in the
-- database key, to avoid a migration that touches every existing
-- reference to that key.

alter table withdrawals add column if not exists fee_amount numeric;
alter table withdrawals add column if not exists net_amount numeric;

create or replace function request_withdrawal(
  p_wallet_id uuid,
  p_helper_id uuid,
  p_amount numeric,
  p_bank_account_id uuid,
  p_fee_rate_percent numeric default 12
) returns table (withdrawal_id uuid, balance_after numeric, fee_amount numeric, net_amount numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
  v_withdrawal_id uuid;
  v_fee_amount numeric;
  v_net_amount numeric;
begin
  -- Row-level lock prevents a second concurrent call from reading the
  -- balance until this transaction commits or rolls back.
  select balance into v_balance from wallets where id = p_wallet_id for update;

  if v_balance is null then
    raise exception 'WALLET_NOT_FOUND';
  end if;

  if v_balance < p_amount then
    raise exception 'INSUFFICIENT_BALANCE';
  end if;

  -- The helper's wallet is debited the full requested amount; the fee is
  -- how that amount gets split when it's actually disbursed to their
  -- bank — it is not an additional charge on top of what they asked to
  -- withdraw.
  v_fee_amount := round(p_amount * p_fee_rate_percent / 100, 2);
  v_net_amount := p_amount - v_fee_amount;

  insert into withdrawals (helper_id, amount, bank_account_id, status, fee_amount, net_amount)
  values (p_helper_id, p_amount, p_bank_account_id, 'requested', v_fee_amount, v_net_amount)
  returning id into v_withdrawal_id;

  update wallets set balance = balance - p_amount where id = p_wallet_id;

  insert into wallet_transactions (wallet_id, type, amount, balance_after, reference_type, reference_id, idempotency_key)
  values (p_wallet_id, 'withdrawal', -p_amount, v_balance - p_amount, 'withdrawal', v_withdrawal_id, 'withdrawal_' || v_withdrawal_id);

  return query select v_withdrawal_id, (v_balance - p_amount), v_fee_amount, v_net_amount;
end;
$$;

-- Make sure the customer-side fee setting exists as an editable row too
-- (the code already has a working default of 3 if this row is missing,
-- but without the row an admin can't see or change it from Settings).
insert into platform_settings (key, value_json)
values ('customer_service_fee_percent', '3')
on conflict (key) do nothing;
