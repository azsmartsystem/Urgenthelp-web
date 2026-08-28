-- Splits helper_skills RLS into public read (needed for customer search
-- and matching) plus owner-only write policies.

drop policy if exists helper_skills_owner on helper_skills;

create policy helper_skills_public_read on helper_skills for select using (is_active = true);

create policy helper_skills_owner_write on helper_skills for insert with check (
  exists (select 1 from helper_profiles hp where hp.id = helper_skills.helper_id and hp.user_id = app_user_id())
);
create policy helper_skills_owner_update on helper_skills for update using (
  exists (select 1 from helper_profiles hp where hp.id = helper_skills.helper_id and hp.user_id = app_user_id())
);
create policy helper_skills_owner_delete on helper_skills for delete using (
  exists (select 1 from helper_profiles hp where hp.id = helper_skills.helper_id and hp.user_id = app_user_id())
);
