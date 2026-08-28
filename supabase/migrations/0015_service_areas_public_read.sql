-- Splits service_areas RLS into public read (needed for distance-based
-- search) plus owner-only write policies.

drop policy if exists service_areas_owner on service_areas;

create policy service_areas_public_read on service_areas for select using (true);

create policy service_areas_owner_write on service_areas for insert with check (
  exists (select 1 from helper_profiles hp where hp.id = service_areas.helper_id and hp.user_id = app_user_id())
);
create policy service_areas_owner_update on service_areas for update using (
  exists (select 1 from helper_profiles hp where hp.id = service_areas.helper_id and hp.user_id = app_user_id())
);
create policy service_areas_owner_delete on service_areas for delete using (
  exists (select 1 from helper_profiles hp where hp.id = service_areas.helper_id and hp.user_id = app_user_id())
);
