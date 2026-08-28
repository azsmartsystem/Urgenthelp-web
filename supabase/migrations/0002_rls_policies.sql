-- Urgent Help — Row Level Security policies (v1)
-- Enforces: users only read/write their own data; booking participants only
-- see their own bookings; admins bypass via service-role key server-side only.

alter table users enable row level security;
alter table customer_profiles enable row level security;
alter table helper_profiles enable row level security;
alter table addresses enable row level security;
alter table bookings enable row level security;
alter table booking_status_history enable row level security;
alter table payments enable row level security;
alter table wallets enable row level security;
alter table wallet_transactions enable row level security;
alter table reviews enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table support_tickets enable row level security;

-- Users: can read/update only their own row
create policy users_self_select on users for select using (auth.uid() = id);
create policy users_self_update on users for update using (auth.uid() = id);

-- Customer/helper profiles: owner-only
create policy customer_profile_owner on customer_profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy helper_profile_owner_write on helper_profiles for insert
  with check (auth.uid() = user_id);
create policy helper_profile_owner_update on helper_profiles for update
  using (auth.uid() = user_id);
-- Helper profiles are publicly readable (helper directory / profile pages)
create policy helper_profile_public_read on helper_profiles for select using (true);

-- Addresses: owner-only
create policy addresses_owner on addresses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bookings: only the customer or the assigned helper can see/modify
create policy bookings_participant_select on bookings for select using (
  auth.uid() in (
    select user_id from customer_profiles where id = bookings.customer_id
    union
    select user_id from helper_profiles where id = bookings.helper_id
  )
);
create policy bookings_customer_insert on bookings for insert with check (
  auth.uid() in (select user_id from customer_profiles where id = bookings.customer_id)
);
create policy bookings_participant_update on bookings for update using (
  auth.uid() in (
    select user_id from customer_profiles where id = bookings.customer_id
    union
    select user_id from helper_profiles where id = bookings.helper_id
  )
);

create policy booking_history_participant_select on booking_status_history for select using (
  exists (
    select 1 from bookings b
    join customer_profiles cp on cp.id = b.customer_id
    left join helper_profiles hp on hp.id = b.helper_id
    where b.id = booking_status_history.booking_id
      and (cp.user_id = auth.uid() or hp.user_id = auth.uid())
  )
);

-- Payments: participant-only read
create policy payments_participant_select on payments for select using (
  exists (
    select 1 from bookings b
    join customer_profiles cp on cp.id = b.customer_id
    left join helper_profiles hp on hp.id = b.helper_id
    where b.id = payments.booking_id
      and (cp.user_id = auth.uid() or hp.user_id = auth.uid())
  )
);

-- Wallet: owner-only
create policy wallets_owner on wallets for select using (auth.uid() = user_id);
create policy wallet_tx_owner on wallet_transactions for select using (
  exists (select 1 from wallets w where w.id = wallet_transactions.wallet_id and w.user_id = auth.uid())
);

-- Reviews: publicly readable (helper profile reviews), only participant can insert
create policy reviews_public_read on reviews for select using (true);
create policy reviews_participant_insert on reviews for insert with check (auth.uid() = reviewer_id);

-- Messaging: only conversation participants
create policy conversations_participant_select on conversations for select using (
  exists (select 1 from conversation_participants cp where cp.conversation_id = conversations.id and cp.user_id = auth.uid())
);
create policy participants_self_select on conversation_participants for select using (
  user_id = auth.uid() or exists (
    select 1 from conversation_participants cp2 where cp2.conversation_id = conversation_participants.conversation_id and cp2.user_id = auth.uid()
  )
);
create policy messages_participant_select on messages for select using (
  exists (select 1 from conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid())
);
create policy messages_participant_insert on messages for insert with check (
  sender_id = auth.uid() and exists (
    select 1 from conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid()
  )
);

-- Notifications: owner-only
create policy notifications_owner on notifications for select using (auth.uid() = user_id);
create policy notifications_owner_update on notifications for update using (auth.uid() = user_id);

-- Support tickets: owner-only (admins use service role, bypassing RLS, from the admin API layer)
create policy support_tickets_owner on support_tickets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
