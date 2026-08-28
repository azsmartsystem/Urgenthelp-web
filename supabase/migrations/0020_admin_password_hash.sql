-- 0020_admin_password_hash.sql
--
-- app/api/admin/login/route.ts has always checked admin.password_hash,
-- but admin_users (migration 0001) never had that column — meaning admin
-- login could never have worked at all, for anyone, regardless of
-- whether an account existed. This was the actual root blocker behind
-- "how do I access the admin dashboard."

alter table admin_users add column if not exists password_hash text;
