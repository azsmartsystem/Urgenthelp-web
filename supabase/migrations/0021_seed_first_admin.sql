-- 0021_seed_first_admin.sql
--
-- 0020 fixed the missing password_hash column, but nothing has ever
-- actually created an admin_users row — meaning there was still no way
-- to log in even after that fix. This creates one super_admin account.
--
-- Email: admin@urgenthelp.ng
-- Password: UrgentHelp2026!Admin
--
-- CHANGE THIS PASSWORD after your first login (see instructions below —
-- there's no in-app "change admin password" screen yet, so it's another
-- SQL statement for now). Safe to run more than once — updates the
-- existing row instead of erroring if it's already there.

insert into admin_users (email, role_id, status, password_hash)
select
  'admin@urgenthelp.ng',
  (select id from roles where name = 'super_admin'),
  'active',
  '3b5158d1327bc640427a3e4ebdda81d3:349ab3466fdab3fb35b704ad3273ade5277954e6bc6fcbdc4f4d2d4777d2da6fc0d02a9ed74d5e8bfa1077df962c8d1acd07006c6856774822584af3f0684349'
on conflict (email) do update set
  password_hash = excluded.password_hash,
  status = 'active';
