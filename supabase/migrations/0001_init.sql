-- =====================================================================
-- Urgent Help — Initial Production Schema
-- Derived from: Technical Implementation Specification §4/§5 (ERD)
-- Engine: PostgreSQL (Supabase)
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "postgis";

-- ---------------------------------------------------------------------
-- 1. IDENTITY & ROLES
-- ---------------------------------------------------------------------

create table users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  phone_number text unique not null,
  email text unique,
  phone_verified_at timestamptz,
  email_verified_at timestamptz,
  active_mode text not null default 'customer' check (active_mode in ('customer','helper')),
  status text not null default 'active' check (status in ('active','suspended','banned','pending_deletion')),
  locale text default 'en',
  country_code text default 'NG',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_users_status on users(status);

create table customer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references users(id) on delete cascade,
  display_name text,
  avatar_url text,
  default_address_id uuid,
  settings_json jsonb default '{}'::jsonb,
  trust_score_cached numeric default 70,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table helper_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','pending','verified','rejected')),
  availability_status text not null default 'offline'
    check (availability_status in ('online','offline')),
  service_radius_km numeric default 5,
  years_experience numeric default 0,
  trust_score_cached numeric default 70,
  completion_rate_cached numeric default 0,
  avg_response_seconds_cached integer,
  settings_json jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_helper_verification on helper_profiles(verification_status);
create index idx_helper_availability on helper_profiles(availability_status);

create table roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  description text
);

create table role_permissions (
  role_id uuid references roles(id) on delete cascade,
  permission_id uuid references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email text unique not null,
  role_id uuid references roles(id),
  status text default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. SKILLS, SERVICES & CATEGORIES
-- ---------------------------------------------------------------------

create table service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon_key text,
  parent_category_id uuid references service_categories(id),
  is_active boolean default true,
  sort_order integer default 0
);

create table services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references service_categories(id),
  name text not null,
  description text,
  base_price_min numeric not null,
  base_price_max numeric not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);
create index idx_services_category on services(category_id);

create table helper_skills (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid not null references helper_profiles(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  helper_price numeric,
  is_active boolean default true,
  unique(helper_id, service_id)
);

create table certifications (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid not null references helper_profiles(id) on delete cascade,
  title text not null,
  issuing_body text,
  document_file_id uuid,
  status text default 'pending' check (status in ('pending','verified','rejected')),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table portfolio_items (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid not null references helper_profiles(id) on delete cascade,
  file_id uuid,
  caption text,
  sort_order integer default 0
);

-- ---------------------------------------------------------------------
-- 3. VERIFICATION & TRUST
-- ---------------------------------------------------------------------

create table verification_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null check (type in ('government_id','selfie','address','business_doc')),
  file_id uuid,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references admin_users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create table trust_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  role_context text not null check (role_context in ('customer','helper')),
  score numeric not null,
  model_version text,
  computed_at timestamptz not null default now()
);
create index idx_trust_scores_user on trust_scores(user_id, computed_at desc);

create table trust_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  event_type text not null,
  payload_json jsonb,
  weight numeric default 1,
  occurred_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. LOCATION
-- ---------------------------------------------------------------------

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  label text,
  line1 text not null,
  line2 text,
  city text,
  state text,
  country text default 'NG',
  lat double precision not null,
  lng double precision not null,
  is_default boolean default false,
  created_at timestamptz not null default now()
);
create index idx_addresses_user on addresses(user_id);

alter table customer_profiles
  add constraint fk_default_address foreign key (default_address_id) references addresses(id);

create table service_areas (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid not null references helper_profiles(id) on delete cascade,
  center_lat double precision not null,
  center_lng double precision not null,
  radius_km numeric not null default 5
);

-- ---------------------------------------------------------------------
-- 5. AVAILABILITY
-- ---------------------------------------------------------------------

create table availability_schedules (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid not null references helper_profiles(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean default true
);

-- ---------------------------------------------------------------------
-- 6. BOOKINGS
-- ---------------------------------------------------------------------

create table bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customer_profiles(id),
  helper_id uuid references helper_profiles(id),
  service_id uuid not null references services(id),
  address_id uuid not null references addresses(id),
  status text not null default 'requested' check (
    status in ('requested','matched','accepted','en_route','in_progress','completed','cancelled','disputed')
  ),
  scheduled_at timestamptz,
  urgency text default 'standard' check (urgency in ('standard','urgent')),
  notes text,
  duration_estimate_minutes integer,
  price_min numeric,
  price_recommended numeric,
  price_max numeric,
  price_confidence numeric,
  final_price numeric,
  cancelled_by text check (cancelled_by in ('customer','helper','system')),
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_bookings_customer on bookings(customer_id);
create index idx_bookings_helper on bookings(helper_id);
create index idx_bookings_status on bookings(status);

create table booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  service_id uuid not null references services(id),
  quantity integer default 1,
  unit_price numeric
);

create table booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by_user_id uuid references users(id),
  changed_at timestamptz not null default now(),
  reason text
);

create table booking_locations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  type text not null check (type in ('pickup','service_location','helper_start')),
  lat double precision not null,
  lng double precision not null
);

create table booking_media (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  file_id uuid,
  uploaded_by uuid references users(id),
  stage text check (stage in ('request','completion')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. AI DECISIONING
-- ---------------------------------------------------------------------

create table ai_price_recommendations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  price_min numeric not null,
  price_recommended numeric not null,
  price_max numeric not null,
  confidence_score numeric,
  model_version text,
  input_snapshot_json jsonb,
  generated_at timestamptz not null default now()
);

create table matching_results (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  model_version text,
  candidate_count integer,
  generated_at timestamptz not null default now()
);

create table helper_offers (
  id uuid primary key default gen_random_uuid(),
  matching_result_id uuid not null references matching_results(id) on delete cascade,
  helper_id uuid not null references helper_profiles(id),
  rank integer,
  match_score numeric,
  score_breakdown_json jsonb,
  status text default 'notified' check (status in ('notified','accepted','declined','expired')),
  notified_at timestamptz default now(),
  responded_at timestamptz,
  unique(matching_result_id, helper_id)
);

create table ai_decisions (
  id uuid primary key default gen_random_uuid(),
  engine text not null check (engine in ('matching','pricing','trust','dispatch','forecast','fraud','recommendation')),
  subject_type text,
  subject_id uuid,
  input_snapshot_json jsonb,
  output_json jsonb,
  confidence_score numeric,
  model_version text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 8. PAYMENTS & WALLET
-- ---------------------------------------------------------------------

create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id),
  provider text not null check (provider in ('paystack','flutterwave')),
  provider_reference text unique not null,
  amount numeric not null,
  currency text default 'NGN',
  status text default 'initialized' check (status in ('initialized','pending','successful','failed','refunded')),
  initiated_at timestamptz not null default now(),
  verified_at timestamptz
);

create table payment_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id) on delete cascade,
  type text not null check (type in ('charge','commission','payout_to_helper','refund')),
  amount numeric not null,
  direction text not null check (direction in ('debit','credit')),
  created_at timestamptz not null default now()
);

create table wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references users(id) on delete cascade,
  balance numeric not null default 0,
  currency text default 'NGN',
  status text default 'active' check (status in ('active','frozen'))
);

create table wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references wallets(id) on delete cascade,
  type text not null check (type in ('booking_charge','payout','withdrawal','refund','commission','adjustment')),
  amount numeric not null,
  balance_after numeric not null,
  reference_type text,
  reference_id uuid,
  idempotency_key text unique not null,
  created_at timestamptz not null default now()
);

create table bank_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  bank_name text not null,
  account_number_encrypted text not null,
  account_name text not null,
  is_default boolean default false
);

create table withdrawals (
  id uuid primary key default gen_random_uuid(),
  helper_id uuid not null references helper_profiles(id),
  amount numeric not null,
  bank_account_id uuid references bank_accounts(id),
  status text default 'requested' check (status in ('requested','processing','paid','failed')),
  requested_at timestamptz not null default now(),
  processed_at timestamptz
);

create table refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id),
  amount numeric not null,
  reason text,
  status text default 'pending',
  initiated_by uuid references users(id)
);

create table commissions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id),
  rate_percent numeric not null,
  amount numeric not null
);

-- ---------------------------------------------------------------------
-- 9. REVIEWS
-- ---------------------------------------------------------------------

create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  reviewer_id uuid not null references users(id),
  reviewee_id uuid not null references users(id),
  rating smallint not null check (rating between 1 and 5),
  comment text,
  tags text[],
  created_at timestamptz not null default now(),
  unique(booking_id, reviewer_id)
);

-- ---------------------------------------------------------------------
-- 10. MESSAGING
-- ---------------------------------------------------------------------

create table conversations (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id),
  type text default 'booking' check (type in ('booking','support')),
  created_at timestamptz not null default now()
);

create table conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references users(id),
  body text,
  media_file_id uuid,
  sent_at timestamptz not null default now(),
  delivered_at timestamptz,
  read_at timestamptz
);

create table message_reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  reported_by uuid references users(id),
  reason text,
  status text default 'open'
);

-- ---------------------------------------------------------------------
-- 11. NOTIFICATIONS
-- ---------------------------------------------------------------------

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  mode_context text check (mode_context in ('customer','helper','system')),
  type text not null,
  title text not null,
  body text,
  data_json jsonb,
  channel text check (channel in ('push','sms','email','in_app')),
  status text default 'queued' check (status in ('queued','sent','delivered','failed')),
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id, created_at desc);

create table notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  mode text check (mode in ('customer','helper')),
  category text check (category in ('booking','payment','security','ai_match','marketing')),
  channel text check (channel in ('push','sms','email','in_app')),
  enabled boolean default true,
  unique(user_id, mode, category, channel)
);

-- ---------------------------------------------------------------------
-- 12. SUPPORT, DISPUTES, FRAUD
-- ---------------------------------------------------------------------

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  booking_id uuid references bookings(id),
  subject text not null,
  status text default 'open' check (status in ('open','in_progress','resolved','closed')),
  assigned_to uuid references admin_users(id),
  priority text default 'normal',
  created_at timestamptz not null default now()
);

create table disputes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id),
  raised_by uuid references users(id),
  type text check (type in ('payment','quality','safety','other')),
  status text default 'open' check (status in ('open','under_review','resolved','rejected')),
  resolution text,
  resolved_by uuid references admin_users(id),
  created_at timestamptz not null default now()
);

create table fraud_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  type text check (type in ('duplicate_identity','gps_anomaly','payment_abuse','review_manipulation','other')),
  severity text default 'low',
  detail_json jsonb,
  status text default 'open' check (status in ('open','reviewing','confirmed','dismissed')),
  detected_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 13. FILES, ANALYTICS, AUDIT, SETTINGS
-- ---------------------------------------------------------------------

create table files (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references users(id),
  s3_key text not null,
  mime_type text,
  size_bytes bigint,
  purpose text check (purpose in ('profile_image','id_document','certificate','job_photo','receipt','message_media')),
  scan_status text default 'pending' check (scan_status in ('pending','clean','flagged')),
  created_at timestamptz not null default now()
);

create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  event_name text not null,
  properties_json jsonb,
  occurred_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_type text check (actor_type in ('user','admin','system')),
  actor_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  before_json jsonb,
  after_json jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create table platform_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value_json jsonb not null,
  updated_by uuid references admin_users(id),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- ROW LEVEL SECURITY  (Technical Spec §23)
-- =====================================================================

alter table users enable row level security;
alter table customer_profiles enable row level security;
alter table helper_profiles enable row level security;
alter table addresses enable row level security;
alter table bookings enable row level security;
alter table booking_status_history enable row level security;
alter table booking_media enable row level security;
alter table payments enable row level security;
alter table wallets enable row level security;
alter table wallet_transactions enable row level security;
alter table reviews enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table support_tickets enable row level security;
alter table disputes enable row level security;

-- Helper: resolve internal users.id from the authenticated Supabase auth uid
create or replace function current_app_user_id() returns uuid as $$
  select id from users where auth_user_id = auth.uid()
$$ language sql stable;

-- users: a person can read/update only their own row
create policy users_self_select on users for select using (auth_user_id = auth.uid());
create policy users_self_update on users for update using (auth_user_id = auth.uid());

-- customer_profiles: owner only
create policy customer_profiles_owner on customer_profiles for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());

-- helper_profiles: owner can manage; anyone (incl. anon) can read (public profile)
create policy helper_profiles_public_read on helper_profiles for select using (true);
create policy helper_profiles_owner_write on helper_profiles for insert with check (user_id = current_app_user_id());
create policy helper_profiles_owner_update on helper_profiles for update using (user_id = current_app_user_id());

-- addresses: owner only
create policy addresses_owner on addresses for all
  using (user_id = current_app_user_id())
  with check (user_id = current_app_user_id());

-- bookings: visible to the customer or helper on that booking
create policy bookings_participant_select on bookings for select using (
  customer_id in (select id from customer_profiles where user_id = current_app_user_id())
  or helper_id in (select id from helper_profiles where user_id = current_app_user_id())
);
create policy bookings_customer_insert on bookings for insert with check (
  customer_id in (select id from customer_profiles where user_id = current_app_user_id())
);
create policy bookings_participant_update on bookings for update using (
  customer_id in (select id from customer_profiles where user_id = current_app_user_id())
  or helper_id in (select id from helper_profiles where user_id = current_app_user_id())
);

-- wallets: owner only
create policy wallets_owner on wallets for select using (user_id = current_app_user_id());
create policy wallet_tx_owner on wallet_transactions for select using (
  wallet_id in (select id from wallets where user_id = current_app_user_id())
);

-- messaging: participants only
create policy conversations_participant on conversations for select using (
  id in (select conversation_id from conversation_participants where user_id = current_app_user_id())
);
create policy messages_participant_select on messages for select using (
  conversation_id in (select conversation_id from conversation_participants where user_id = current_app_user_id())
);
create policy messages_participant_insert on messages for insert with check (
  sender_id = current_app_user_id()
  and conversation_id in (select conversation_id from conversation_participants where user_id = current_app_user_id())
);

-- notifications: owner only
create policy notifications_owner on notifications for select using (user_id = current_app_user_id());
create policy notifications_owner_update on notifications for update using (user_id = current_app_user_id());

-- reviews: readable by anyone (public reputation data), writable by participants post-completion (enforced additionally in API layer)
create policy reviews_public_read on reviews for select using (true);
create policy reviews_participant_insert on reviews for insert with check (reviewer_id = current_app_user_id());

-- support & disputes: owner only for self-service views; admin access is via service-role key (bypasses RLS) in the admin API
create policy support_owner on support_tickets for select using (user_id = current_app_user_id());
create policy disputes_owner on disputes for select using (raised_by = current_app_user_id());

-- NOTE: admin_users, audit_logs, fraud_events, platform_settings, ai_decisions,
-- analytics_events are intentionally NOT exposed to the anon/authenticated Postgres
-- roles at all — the Admin Dashboard talks to Postgres exclusively through the
-- backend's service-role connection (Technical Spec §16, §23), never via a
-- browser-exposed Supabase client with RLS bypass.

-- =====================================================================
-- SEED DATA (development / demo only)
-- =====================================================================

insert into roles (name) values ('super_admin'), ('ops'), ('support'), ('finance'), ('trust_safety');

insert into service_categories (name, slug, icon_key, sort_order) values
  ('Cleaning', 'cleaning', 'sparkles', 1),
  ('Plumbing', 'plumbing', 'wrench', 2),
  ('Electrical', 'electrical', 'bolt', 3),
  ('Cooking', 'cooking', 'pan', 4),
  ('Babysitting', 'babysitting', 'baby', 5),
  ('Gardening', 'gardening', 'leaf', 6),
  ('Home Tutoring', 'tutoring', 'book', 7),
  ('Pet Care', 'pet-care', 'paw', 8);

insert into services (category_id, name, description, base_price_min, base_price_max)
select id, 'Deep Cleaning', 'Full home deep clean', 6000, 12000 from service_categories where slug = 'cleaning'
union all
select id, 'Standard Cleaning', 'Routine home cleaning', 4000, 8000 from service_categories where slug = 'cleaning'
union all
select id, 'Pipe Repair', 'Leak and pipe repair', 5000, 15000 from service_categories where slug = 'plumbing'
union all
select id, 'AC Repair', 'Split/window unit repair', 6000, 18000 from service_categories where slug = 'electrical';

insert into platform_settings (key, value_json) values
  ('matching_weights', '{"distance": 0.35, "rating": 0.25, "trust_score": 0.2, "availability": 0.1, "experience": 0.1}'),
  ('commission_rate_percent', '12'),
  ('cancellation_free_window_minutes', '10'),
  ('geofence_arrival_radius_meters', '150');
