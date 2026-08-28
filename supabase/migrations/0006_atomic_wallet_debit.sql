-- Fixes a real race condition: app/api/wallet/me/withdrawals/route.ts
-- previously read wallets.balance, then wrote balance - amount back in a
-- separate statement. Two concurrent withdrawal requests could both read
-- the same starting balance and both pass the "sufficient funds" check,
-- over-withdrawing the wallet. Financial operations must be atomic and
-- auditable (Technical Implementation Spec §15/§16) — this function makes
-- the check-and-debit a single atomic statement instead.

create or replace function request_withdrawal(
  p_wallet_id uuid,
  p_helper_id uuid,
  p_amount numeric,
  p_bank_account_id uuid
) returns table (withdrawal_id uuid, balance_after numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
  v_withdrawal_id uuid;
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

  insert into withdrawals (helper_id, amount, bank_account_id, status)
  values (p_helper_id, p_amount, p_bank_account_id, 'requested')
  returning id into v_withdrawal_id;

  update wallets set balance = balance - p_amount where id = p_wallet_id;

  insert into wallet_transactions (wallet_id, type, amount, balance_after, reference_type, reference_id, idempotency_key)
  values (p_wallet_id, 'withdrawal', -p_amount, v_balance - p_amount, 'withdrawal', v_withdrawal_id, 'withdrawal_' || v_withdrawal_id);

  return query select v_withdrawal_id, (v_balance - p_amount);
end;
$$;
