-- 0009_service_catalog_rls.sql
-- Enable RLS on service_categories/services and restrict writes to the
-- service-role client. Public read access for active rows only.

begin;

alter table service_categories enable row level security;
alter table services enable row level security;

create policy "service_categories_public_read"
  on service_categories for select
  using (is_active = true);

create policy "services_public_read"
  on services for select
  using (is_active = true);

commit;
