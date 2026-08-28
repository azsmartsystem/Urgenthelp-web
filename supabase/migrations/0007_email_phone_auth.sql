-- Urgent Help — support email OR phone as the login identifier.
-- Previously `phone_number` was NOT NULL, which made phone the only
-- possible signup method. Both phone_number and email are already
-- individually unique-constrained (allowing multiple NULLs is standard
-- Postgres UNIQUE behavior, so relaxing NOT NULL doesn't need an index
-- change) — we only need to relax NOT NULL and add a check that at
-- least one identifier is present.

alter table users alter column phone_number drop not null;

alter table users
  add constraint users_has_identifier
  check (phone_number is not null or email is not null);
