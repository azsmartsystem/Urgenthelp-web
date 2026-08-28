-- Adds the missing wallets INSERT policy. Scoped so a user can only
-- create their own wallet row, and only at a zero starting balance.

create policy wallets_self_insert on wallets for insert
  with check (user_id = app_user_id() and balance = 0);
