-- =====================================================================
-- Urgent Help — Auth ID mapping fix
--
-- Bug: users.id is an internal identity distinct from auth.users.id
-- (linked via users.auth_user_id). The original 0002 RLS policies
-- compared auth.uid() directly against users.id / *.user_id, which
-- never matches auth_user_id, so every authenticated read/write from
-- the browser client would silently fail RLS. This migration adds a
-- stable SQL function to resolve auth.uid() -> users.id, and rewrites
-- every policy that made this mistake to use it.
-- =====================================================================

create or replace function app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from users where auth_user_id = auth.uid()
$$;

-- ---- users ----
drop policy if exists users_self_select on users;
drop policy if exists users_self_update on users;
create policy users_self_select on users for select using (auth_user_id = auth.uid());
create policy users_self_update on users for update using (auth_user_id = auth.uid());
-- Allow a freshly-signed-up auth user to create their own `users` row.
drop policy if exists users_self_insert on users;
create policy users_self_insert on users for insert with check (auth_user_id = auth.uid());

-- ---- customer_profiles ----
drop policy if exists customer_profile_owner on customer_profiles;
create policy customer_profile_owner on customer_profiles for all
  using (user_id = app_user_id()) with check (user_id = app_user_id());

-- ---- helper_profiles ----
drop policy if exists helper_profile_owner_write on helper_profiles;
drop policy if exists helper_profile_owner_update on helper_profiles;
drop policy if exists helper_profile_public_read on helper_profiles;
create policy helper_profile_owner_write on helper_profiles for insert
  with check (user_id = app_user_id());
create policy helper_profile_owner_update on helper_profiles for update
  using (user_id = app_user_id());
create policy helper_profile_public_read on helper_profiles for select using (true);

-- ---- addresses ----
drop policy if exists addresses_owner on addresses;
create policy addresses_owner on addresses for all
  using (user_id = app_user_id()) with check (user_id = app_user_id());

-- ---- bookings ----
drop policy if exists bookings_participant_select on bookings;
drop policy if exists bookings_customer_insert on bookings;
drop policy if exists bookings_participant_update on bookings;
create policy bookings_participant_select on bookings for select using (
  app_user_id() in (
    select user_id from customer_profiles where id = bookings.customer_id
    union
    select user_id from helper_profiles where id = bookings.helper_id
  )
);
create policy bookings_customer_insert on bookings for insert with check (
  app_user_id() in (select user_id from customer_profiles where id = bookings.customer_id)
);
create policy bookings_participant_update on bookings for update using (
  app_user_id() in (
    select user_id from customer_profiles where id = bookings.customer_id
    union
    select user_id from helper_profiles where id = bookings.helper_id
  )
);

-- ---- booking_status_history ----
drop policy if exists booking_history_participant_select on booking_status_history;
create policy booking_history_participant_select on booking_status_history for select using (
  exists (
    select 1 from bookings b
    join customer_profiles cp on cp.id = b.customer_id
    left join helper_profiles hp on hp.id = b.helper_id
    where b.id = booking_status_history.booking_id
      and (cp.user_id = app_user_id() or hp.user_id = app_user_id())
  )
);

-- ---- payments ----
drop policy if exists payments_participant_select on payments;
create policy payments_participant_select on payments for select using (
  exists (
    select 1 from bookings b
    join customer_profiles cp on cp.id = b.customer_id
    left join helper_profiles hp on hp.id = b.helper_id
    where b.id = payments.booking_id
      and (cp.user_id = app_user_id() or hp.user_id = app_user_id())
  )
);

-- ---- wallets / wallet_transactions ----
drop policy if exists wallets_owner on wallets;
drop policy if exists wallet_tx_owner on wallet_transactions;
create policy wallets_owner on wallets for select using (user_id = app_user_id());
create policy wallet_tx_owner on wallet_transactions for select using (
  exists (select 1 from wallets w where w.id = wallet_transactions.wallet_id and w.user_id = app_user_id())
);

-- ---- reviews ----
drop policy if exists reviews_participant_insert on reviews;
create policy reviews_participant_insert on reviews for insert with check (reviewer_id = app_user_id());

-- ---- messaging ----
drop policy if exists conversations_participant_select on conversations;
drop policy if exists participants_self_select on conversation_participants;
drop policy if exists messages_participant_select on messages;
drop policy if exists messages_participant_insert on messages;
create policy conversations_participant_select on conversations for select using (
  exists (select 1 from conversation_participants cp where cp.conversation_id = conversations.id and cp.user_id = app_user_id())
);
create policy participants_self_select on conversation_participants for select using (
  user_id = app_user_id() or exists (
    select 1 from conversation_participants cp2 where cp2.conversation_id = conversation_participants.conversation_id and cp2.user_id = app_user_id()
  )
);
create policy messages_participant_select on messages for select using (
  exists (select 1 from conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = app_user_id())
);
create policy messages_participant_insert on messages for insert with check (
  sender_id = app_user_id() and exists (
    select 1 from conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = app_user_id()
  )
);
-- Needed for the messaging UI to insert itself as a participant when a
-- booking-linked conversation is first opened.
drop policy if exists participants_self_insert on conversation_participants;
create policy participants_self_insert on conversation_participants for insert with check (user_id = app_user_id());

-- ---- notifications ----
drop policy if exists notifications_owner on notifications;
drop policy if exists notifications_owner_update on notifications;
create policy notifications_owner on notifications for select using (user_id = app_user_id());
create policy notifications_owner_update on notifications for update using (user_id = app_user_id());

-- ---- support_tickets ----
drop policy if exists support_tickets_owner on support_tickets;
create policy support_tickets_owner on support_tickets for all
  using (user_id = app_user_id()) with check (user_id = app_user_id());

-- ---- helper_skills / certifications / service_areas / availability_schedules ----
-- (not covered by 0002 — enabling + adding owner policies now that Helper
-- Onboarding needs to write to them from the client.)
alter table helper_skills enable row level security;
alter table certifications enable row level security;
alter table service_areas enable row level security;
alter table availability_schedules enable row level security;
alter table verification_records enable row level security;
alter table bank_accounts enable row level security;
alter table withdrawals enable row level security;

create policy helper_skills_owner on helper_skills for all using (
  exists (select 1 from helper_profiles hp where hp.id = helper_skills.helper_id and hp.user_id = app_user_id())
) with check (
  exists (select 1 from helper_profiles hp where hp.id = helper_skills.helper_id and hp.user_id = app_user_id())
);

create policy certifications_owner on certifications for all using (
  exists (select 1 from helper_profiles hp where hp.id = certifications.helper_id and hp.user_id = app_user_id())
) with check (
  exists (select 1 from helper_profiles hp where hp.id = certifications.helper_id and hp.user_id = app_user_id())
);

create policy service_areas_owner on service_areas for all using (
  exists (select 1 from helper_profiles hp where hp.id = service_areas.helper_id and hp.user_id = app_user_id())
) with check (
  exists (select 1 from helper_profiles hp where hp.id = service_areas.helper_id and hp.user_id = app_user_id())
);

create policy availability_schedules_owner on availability_schedules for all using (
  exists (select 1 from helper_profiles hp where hp.id = availability_schedules.helper_id and hp.user_id = app_user_id())
) with check (
  exists (select 1 from helper_profiles hp where hp.id = availability_schedules.helper_id and hp.user_id = app_user_id())
);

create policy verification_records_owner on verification_records for all using (
  user_id = app_user_id()
) with check (
  user_id = app_user_id()
);

create policy bank_accounts_owner on bank_accounts for all using (
  user_id = app_user_id()
) with check (
  user_id = app_user_id()
);

create policy withdrawals_owner on withdrawals for select using (
  exists (select 1 from helper_profiles hp where hp.id = withdrawals.helper_id and hp.user_id = app_user_id())
);
create policy withdrawals_owner_insert on withdrawals for insert with check (
  exists (select 1 from helper_profiles hp where hp.id = withdrawals.helper_id and hp.user_id = app_user_id())
);

-- ---- reviews: public read (unchanged from 0002, restated for completeness) ----
drop policy if exists reviews_public_read on reviews;
create policy reviews_public_read on reviews for select using (true);
