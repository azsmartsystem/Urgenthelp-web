-- Atomic wallet credit function, mirroring credit_wallet_debit for the
-- credit side. Locks the wallet row for update so concurrent payouts
-- can't race on a stale balance read.

create or replace function credit_wallet_payout(
  p_wallet_id uuid,
  p_amount numeric,
  p_reference_type text,
  p_reference_id uuid,
  p_idempotency_key text
) returns table (balance_after numeric, already_credited boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance numeric;
  v_balance_after numeric;
begin
  -- Row lock ensures concurrent payouts see a consistent balance.
  select balance into v_balance from wallets where id = p_wallet_id for update;

  if v_balance is null then
    raise exception 'WALLET_NOT_FOUND';
  end if;

  v_balance_after := v_balance + p_amount;

  begin
    insert into wallet_transactions (wallet_id, type, amount, balance_after, reference_type, reference_id, idempotency_key)
    values (p_wallet_id, 'payout', p_amount, v_balance_after, p_reference_type, p_reference_id, p_idempotency_key);
  exception when unique_violation then
    -- Already processed this idempotency key — return current state.
    return query select v_balance, true;
    return;
  end;

  update wallets set balance = v_balance_after where id = p_wallet_id;

  return query select v_balance_after, false;
end;
$$;
