-- Adds the missing disputes INSERT policy. Scoped so a person can only
-- raise a dispute as themselves, on a booking they're actually part of.

create policy disputes_self_insert on disputes for insert with check (
  raised_by = app_user_id()
  and exists (
    select 1 from bookings b
    left join customer_profiles cp on cp.id = b.customer_id
    left join helper_profiles hp on hp.id = b.helper_id
    where b.id = disputes.booking_id
      and (cp.user_id = app_user_id() or hp.user_id = app_user_id())
  )
);
