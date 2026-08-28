-- Urgent Help — development seed data
insert into service_categories (name, slug, icon_key, sort_order) values
  ('Cleaning', 'cleaning', 'cleaning', 1),
  ('Plumbing', 'plumbing', 'plumbing', 2),
  ('Electrical', 'electrical', 'electrical', 3),
  ('Cooking', 'cooking', 'cooking', 4),
  ('Babysitting', 'babysitting', 'babysitting', 5),
  ('Gardening', 'gardening', 'gardening', 6),
  ('Moving', 'moving', 'moving', 7),
  ('Tutoring', 'tutoring', 'tutoring', 8)
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max)
select id, 'Deep Cleaning', 'Full home deep clean', 6000, 12000 from service_categories where slug = 'cleaning'
union all
select id, 'Standard Cleaning', 'Routine home cleaning', 4000, 8000 from service_categories where slug = 'cleaning'
union all
select id, 'AC Repair', 'Split/window unit repair', 8000, 15000 from service_categories where slug = 'electrical'
union all
select id, 'Pipe Repair', 'Leak and pipe fixes', 5000, 12000 from service_categories where slug = 'plumbing';

insert into platform_settings (key, value_json) values
  ('matching_weights', '{"distance": 0.35, "rating": 0.25, "trust_score": 0.2, "availability": 0.1, "experience": 0.1}'),
  ('commission_rate_percent', '12'),
  ('geofence_arrival_tolerance_m', '150')
on conflict (key) do nothing;

insert into roles (name) values ('super_admin'), ('ops'), ('support'), ('finance'), ('trust_safety')
on conflict (name) do nothing;
