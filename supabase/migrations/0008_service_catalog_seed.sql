-- 0008_service_catalog_seed.sql
-- Seeds service_categories (with subcategories via parent_category_id)
-- and services with realistic NGN price ranges. Safe to re-run: uses
-- ON CONFLICT (slug) DO NOTHING for categories, and skips services whose
-- (category_id, name) pair already exists.

begin;

-- Make the seed idempotent: allow re-running this migration safely by
-- giving (category_id, name) a real uniqueness guarantee instead of
-- relying on an unconstrained ON CONFLICT DO NOTHING.
alter table services
  add constraint services_category_name_unique unique (category_id, name);

-- ===== Home Services =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Home Services', 'home-services', 'cleaning', 10, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'House Cleaning', 'home-services-house-cleaning', 'cleaning', id, 20, true
from service_categories where slug = 'home-services'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Standard House Cleaning', 'Standard House Cleaning — professional, verified helpers near you.', 5000, 9000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Deep Cleaning', 'Deep Cleaning — professional, verified helpers near you.', 8000, 15000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Move-in Cleaning', 'Move-in Cleaning — professional, verified helpers near you.', 10000, 20000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Move-out Cleaning', 'Move-out Cleaning — professional, verified helpers near you.', 10000, 20000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Bathroom Cleaning', 'Bathroom Cleaning — professional, verified helpers near you.', 3500, 6000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Kitchen Cleaning', 'Kitchen Cleaning — professional, verified helpers near you.', 4000, 7500, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Window Cleaning', 'Window Cleaning — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Sofa Cleaning', 'Sofa Cleaning — professional, verified helpers near you.', 4000, 10000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Carpet Cleaning', 'Carpet Cleaning — professional, verified helpers near you.', 4500, 12000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Mattress Cleaning', 'Mattress Cleaning — professional, verified helpers near you.', 4000, 9000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Post-Construction Cleaning', 'Post-Construction Cleaning — professional, verified helpers near you.', 15000, 40000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Office Cleaning', 'Office Cleaning — professional, verified helpers near you.', 8000, 25000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Fumigation & Pest Spray Cleanup', 'Fumigation & Pest Spray Cleanup — professional, verified helpers near you.', 6000, 15000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Refrigerator Deep Clean', 'Refrigerator Deep Clean — professional, verified helpers near you.', 3000, 6000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Oven Cleaning', 'Oven Cleaning — professional, verified helpers near you.', 3500, 7000, true
from service_categories where slug = 'home-services-house-cleaning'
on conflict (category_id, name) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Laundry & Ironing', 'home-services-laundry', 'cleaning', id, 30, true
from service_categories where slug = 'home-services'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Laundry (Wash & Fold)', 'Laundry (Wash & Fold) — professional, verified helpers near you.', 2500, 6000, true
from service_categories where slug = 'home-services-laundry'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Laundry (Wash & Iron)', 'Laundry (Wash & Iron) — professional, verified helpers near you.', 3500, 8000, true
from service_categories where slug = 'home-services-laundry'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Ironing Only', 'Ironing Only — professional, verified helpers near you.', 2000, 5000, true
from service_categories where slug = 'home-services-laundry'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Dry Cleaning Pickup & Drop-off', 'Dry Cleaning Pickup & Drop-off — professional, verified helpers near you.', 3000, 9000, true
from service_categories where slug = 'home-services-laundry'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Curtain Laundry', 'Curtain Laundry — professional, verified helpers near you.', 4000, 10000, true
from service_categories where slug = 'home-services-laundry'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Duvet & Bedding Wash', 'Duvet & Bedding Wash — professional, verified helpers near you.', 3500, 8000, true
from service_categories where slug = 'home-services-laundry'
on conflict (category_id, name) do nothing;

-- ===== Beauty & Personal Care =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Beauty & Personal Care', 'beauty-personal-care', 'beauty', 40, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Hair', 'beauty-personal-care-hair', 'beauty', id, 50, true
from service_categories where slug = 'beauty-personal-care'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Hair Dressing', 'Hair Dressing — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'beauty-personal-care-hair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Hair Braiding', 'Hair Braiding — professional, verified helpers near you.', 4000, 15000, true
from service_categories where slug = 'beauty-personal-care-hair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Wig Installation', 'Wig Installation — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'beauty-personal-care-hair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Wig Styling & Revamp', 'Wig Styling & Revamp — professional, verified helpers near you.', 4000, 12000, true
from service_categories where slug = 'beauty-personal-care-hair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Hair Coloring', 'Hair Coloring — professional, verified helpers near you.', 6000, 20000, true
from service_categories where slug = 'beauty-personal-care-hair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Hair Treatment & Relaxing', 'Hair Treatment & Relaxing — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'beauty-personal-care-hair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Barbering (Home Service)', 'Barbering (Home Service) — professional, verified helpers near you.', 2000, 5000, true
from service_categories where slug = 'beauty-personal-care-hair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Kids Hair Styling', 'Kids Hair Styling — professional, verified helpers near you.', 2500, 6000, true
from service_categories where slug = 'beauty-personal-care-hair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Weave-on Installation', 'Weave-on Installation — professional, verified helpers near you.', 5000, 12000, true
from service_categories where slug = 'beauty-personal-care-hair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Locs & Twists Maintenance', 'Locs & Twists Maintenance — professional, verified helpers near you.', 6000, 18000, true
from service_categories where slug = 'beauty-personal-care-hair'
on conflict (category_id, name) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Makeup & Nails', 'beauty-personal-care-makeup-nails', 'beauty', id, 60, true
from service_categories where slug = 'beauty-personal-care'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Everyday Makeup', 'Everyday Makeup — professional, verified helpers near you.', 5000, 12000, true
from service_categories where slug = 'beauty-personal-care-makeup-nails'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Bridal Makeup', 'Bridal Makeup — professional, verified helpers near you.', 25000, 80000, true
from service_categories where slug = 'beauty-personal-care-makeup-nails'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Party/Event Makeup', 'Party/Event Makeup — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'beauty-personal-care-makeup-nails'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Nail Fixing (Acrylic)', 'Nail Fixing (Acrylic) — professional, verified helpers near you.', 5000, 12000, true
from service_categories where slug = 'beauty-personal-care-makeup-nails'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Manicure', 'Manicure — professional, verified helpers near you.', 3000, 7000, true
from service_categories where slug = 'beauty-personal-care-makeup-nails'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Pedicure', 'Pedicure — professional, verified helpers near you.', 3500, 8000, true
from service_categories where slug = 'beauty-personal-care-makeup-nails'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Gel Polish', 'Gel Polish — professional, verified helpers near you.', 3000, 6000, true
from service_categories where slug = 'beauty-personal-care-makeup-nails'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Eyelash Installation', 'Eyelash Installation — professional, verified helpers near you.', 4000, 10000, true
from service_categories where slug = 'beauty-personal-care-makeup-nails'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Eyebrow Shaping & Tinting', 'Eyebrow Shaping & Tinting — professional, verified helpers near you.', 2500, 6000, true
from service_categories where slug = 'beauty-personal-care-makeup-nails'
on conflict (category_id, name) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Skincare & Wellness', 'beauty-personal-care-skincare-wellness', 'beauty', id, 70, true
from service_categories where slug = 'beauty-personal-care'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Facial Treatment', 'Facial Treatment — professional, verified helpers near you.', 6000, 18000, true
from service_categories where slug = 'beauty-personal-care-skincare-wellness'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Full Body Massage', 'Full Body Massage — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'beauty-personal-care-skincare-wellness'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Head & Neck Massage', 'Head & Neck Massage — professional, verified helpers near you.', 4000, 9000, true
from service_categories where slug = 'beauty-personal-care-skincare-wellness'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Waxing (Full Body)', 'Waxing (Full Body) — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'beauty-personal-care-skincare-wellness'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Waxing (Partial)', 'Waxing (Partial) — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'beauty-personal-care-skincare-wellness'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Spa Treatment at Home', 'Spa Treatment at Home — professional, verified helpers near you.', 10000, 30000, true
from service_categories where slug = 'beauty-personal-care-skincare-wellness'
on conflict (category_id, name) do nothing;

-- ===== Plumbing =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Plumbing', 'plumbing', 'plumbing', 80, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Plumbing Repairs', 'plumbing-plumbing-repairs', 'plumbing', id, 90, true
from service_categories where slug = 'plumbing'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Pipe Repair', 'Pipe Repair — professional, verified helpers near you.', 4000, 12000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Leak Repair', 'Leak Repair — professional, verified helpers near you.', 3500, 10000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Faucet Installation', 'Faucet Installation — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Sink Repair', 'Sink Repair — professional, verified helpers near you.', 3500, 9000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Toilet Repair', 'Toilet Repair — professional, verified helpers near you.', 4000, 12000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Toilet Installation', 'Toilet Installation — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Water Heater Installation', 'Water Heater Installation — professional, verified helpers near you.', 10000, 30000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Water Heater Repair', 'Water Heater Repair — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Drain Cleaning / Unclogging', 'Drain Cleaning / Unclogging — professional, verified helpers near you.', 4000, 12000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Water Tank Installation', 'Water Tank Installation — professional, verified helpers near you.', 15000, 45000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Borehole Pump Repair', 'Borehole Pump Repair — professional, verified helpers near you.', 10000, 35000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Plumbing Inspection', 'Plumbing Inspection — professional, verified helpers near you.', 5000, 12000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Pipe Fitting (New Installation)', 'Pipe Fitting (New Installation) — professional, verified helpers near you.', 8000, 25000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Bathroom Fitting Installation', 'Bathroom Fitting Installation — professional, verified helpers near you.', 15000, 45000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Kitchen Sink Installation', 'Kitchen Sink Installation — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Water Filter/Purifier Installation', 'Water Filter/Purifier Installation — professional, verified helpers near you.', 6000, 18000, true
from service_categories where slug = 'plumbing-plumbing-repairs'
on conflict (category_id, name) do nothing;

-- ===== Electrical =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Electrical', 'electrical', 'electrical', 100, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Electrical Work', 'electrical-electrical-work', 'electrical', id, 110, true
from service_categories where slug = 'electrical'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'General Electrical Repairs', 'General Electrical Repairs — professional, verified helpers near you.', 4000, 15000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Socket Installation', 'Socket Installation — professional, verified helpers near you.', 2500, 6000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Light Fixture Installation', 'Light Fixture Installation — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Ceiling Fan Installation', 'Ceiling Fan Installation — professional, verified helpers near you.', 4000, 10000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Standing/Wall Fan Repair', 'Standing/Wall Fan Repair — professional, verified helpers near you.', 3000, 7000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Generator Servicing', 'Generator Servicing — professional, verified helpers near you.', 6000, 18000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Generator Installation', 'Generator Installation — professional, verified helpers near you.', 10000, 30000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Inverter Installation', 'Inverter Installation — professional, verified helpers near you.', 20000, 60000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Inverter Repair', 'Inverter Repair — professional, verified helpers near you.', 8000, 25000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Solar Panel Installation', 'Solar Panel Installation — professional, verified helpers near you.', 50000, 250000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'House Wiring (Per Room)', 'House Wiring (Per Room) — professional, verified helpers near you.', 15000, 40000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Electrical Inspection & Safety Check', 'Electrical Inspection & Safety Check — professional, verified helpers near you.', 6000, 15000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Circuit Breaker Replacement', 'Circuit Breaker Replacement — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Changeover Switch Installation', 'Changeover Switch Installation — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Security Light Installation', 'Security Light Installation — professional, verified helpers near you.', 4000, 12000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Extension Board Wiring', 'Extension Board Wiring — professional, verified helpers near you.', 2000, 5000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Doorbell / Intercom Installation', 'Doorbell / Intercom Installation — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'electrical-electrical-work'
on conflict (category_id, name) do nothing;

-- ===== Technology =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Technology', 'technology', 'technology', 120, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Device Repair', 'technology-device-repair', 'technology', id, 130, true
from service_categories where slug = 'technology'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Laptop Repair', 'Laptop Repair — professional, verified helpers near you.', 5000, 25000, true
from service_categories where slug = 'technology-device-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Phone Screen Repair', 'Phone Screen Repair — professional, verified helpers near you.', 8000, 30000, true
from service_categories where slug = 'technology-device-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Phone Battery Replacement', 'Phone Battery Replacement — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'technology-device-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Printer Repair', 'Printer Repair — professional, verified helpers near you.', 5000, 20000, true
from service_categories where slug = 'technology-device-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Desktop Computer Repair', 'Desktop Computer Repair — professional, verified helpers near you.', 6000, 25000, true
from service_categories where slug = 'technology-device-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Data Recovery', 'Data Recovery — professional, verified helpers near you.', 10000, 40000, true
from service_categories where slug = 'technology-device-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Software Installation & Setup', 'Software Installation & Setup — professional, verified helpers near you.', 3000, 10000, true
from service_categories where slug = 'technology-device-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Virus Removal & System Cleanup', 'Virus Removal & System Cleanup — professional, verified helpers near you.', 4000, 12000, true
from service_categories where slug = 'technology-device-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Tablet Repair', 'Tablet Repair — professional, verified helpers near you.', 6000, 20000, true
from service_categories where slug = 'technology-device-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Gaming Console Repair', 'Gaming Console Repair — professional, verified helpers near you.', 8000, 25000, true
from service_categories where slug = 'technology-device-repair'
on conflict (category_id, name) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Digital & Network Services', 'technology-digital-services', 'technology', id, 140, true
from service_categories where slug = 'technology'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Computer Setup (New PC)', 'Computer Setup (New PC) — professional, verified helpers near you.', 5000, 12000, true
from service_categories where slug = 'technology-digital-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Home Network / WiFi Installation', 'Home Network / WiFi Installation — professional, verified helpers near you.', 6000, 20000, true
from service_categories where slug = 'technology-digital-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'CCTV Installation (Per Camera)', 'CCTV Installation (Per Camera) — professional, verified helpers near you.', 15000, 35000, true
from service_categories where slug = 'technology-digital-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Website Development', 'Website Development — professional, verified helpers near you.', 80000, 500000, true
from service_categories where slug = 'technology-digital-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Website Maintenance (Monthly)', 'Website Maintenance (Monthly) — professional, verified helpers near you.', 15000, 60000, true
from service_categories where slug = 'technology-digital-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Basic Graphic Design Job', 'Basic Graphic Design Job — professional, verified helpers near you.', 5000, 25000, true
from service_categories where slug = 'technology-digital-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Router / WiFi Configuration', 'Router / WiFi Configuration — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'technology-digital-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Email & Cloud Backup Setup', 'Email & Cloud Backup Setup — professional, verified helpers near you.', 4000, 12000, true
from service_categories where slug = 'technology-digital-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Smart Home Device Setup', 'Smart Home Device Setup — professional, verified helpers near you.', 6000, 20000, true
from service_categories where slug = 'technology-digital-services'
on conflict (category_id, name) do nothing;

-- ===== Automotive =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Automotive', 'automotive', 'automotive', 150, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Car Care', 'automotive-car-care', 'automotive', id, 160, true
from service_categories where slug = 'automotive'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Mobile Car Wash', 'Mobile Car Wash — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'automotive-car-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Car Detailing (Interior & Exterior)', 'Car Detailing (Interior & Exterior) — professional, verified helpers near you.', 12000, 35000, true
from service_categories where slug = 'automotive-car-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Engine Bay Cleaning', 'Engine Bay Cleaning — professional, verified helpers near you.', 5000, 12000, true
from service_categories where slug = 'automotive-car-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Car Vacuum & Interior Clean', 'Car Vacuum & Interior Clean — professional, verified helpers near you.', 3500, 8000, true
from service_categories where slug = 'automotive-car-care'
on conflict (category_id, name) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Car Repair & Maintenance', 'automotive-car-repair', 'automotive', id, 170, true
from service_categories where slug = 'automotive'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Mobile Mechanic Visit', 'Mobile Mechanic Visit — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Battery Replacement', 'Battery Replacement — professional, verified helpers near you.', 15000, 45000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Tire Repair (Puncture)', 'Tire Repair (Puncture) — professional, verified helpers near you.', 1500, 4000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Tire Replacement (Per Tire)', 'Tire Replacement (Per Tire) — professional, verified helpers near you.', 20000, 60000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'AC Repair (Car)', 'AC Repair (Car) — professional, verified helpers near you.', 8000, 30000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Car Diagnostics Scan', 'Car Diagnostics Scan — professional, verified helpers near you.', 5000, 12000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Oil Change', 'Oil Change — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Brake Pad Replacement', 'Brake Pad Replacement — professional, verified helpers near you.', 10000, 25000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Towing Service', 'Towing Service — professional, verified helpers near you.', 10000, 40000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Jump Start Service', 'Jump Start Service — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Wheel Alignment', 'Wheel Alignment — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Wheel Balancing', 'Wheel Balancing — professional, verified helpers near you.', 5000, 12000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Car Key Programming', 'Car Key Programming — professional, verified helpers near you.', 15000, 45000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Car AC Gas Refill', 'Car AC Gas Refill — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Windscreen Replacement', 'Windscreen Replacement — professional, verified helpers near you.', 20000, 60000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Car Interior Fumigation', 'Car Interior Fumigation — professional, verified helpers near you.', 5000, 12000, true
from service_categories where slug = 'automotive-car-repair'
on conflict (category_id, name) do nothing;

-- ===== Home Improvement =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Home Improvement', 'home-improvement', 'home-improvement', 180, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Renovation & Repairs', 'home-improvement-renovation', 'home-improvement', id, 190, true
from service_categories where slug = 'home-improvement'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Interior Painting (Per Room)', 'Interior Painting (Per Room) — professional, verified helpers near you.', 12000, 35000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Exterior Painting (Per Wall)', 'Exterior Painting (Per Wall) — professional, verified helpers near you.', 15000, 45000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'POP Ceiling Installation', 'POP Ceiling Installation — professional, verified helpers near you.', 25000, 80000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Tiling (Per Sq. M)', 'Tiling (Per Sq. M) — professional, verified helpers near you.', 3500, 8000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Carpentry — Furniture Repair', 'Carpentry — Furniture Repair — professional, verified helpers near you.', 5000, 20000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Furniture Assembly', 'Furniture Assembly — professional, verified helpers near you.', 4000, 12000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Roofing Repair', 'Roofing Repair — professional, verified helpers near you.', 15000, 60000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Welding & Metal Work', 'Welding & Metal Work — professional, verified helpers near you.', 8000, 30000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Interior Decoration Consultation', 'Interior Decoration Consultation — professional, verified helpers near you.', 15000, 50000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Curtain Installation', 'Curtain Installation — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Wallpaper Installation', 'Wallpaper Installation — professional, verified helpers near you.', 15000, 40000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Door/Window Installation', 'Door/Window Installation — professional, verified helpers near you.', 10000, 30000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Handyman — General Repairs', 'Handyman — General Repairs — professional, verified helpers near you.', 4000, 15000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Locksmith Services', 'Locksmith Services — professional, verified helpers near you.', 4000, 15000, true
from service_categories where slug = 'home-improvement-renovation'
on conflict (category_id, name) do nothing;

-- ===== Education & Tutoring =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Education & Tutoring', 'education', 'education', 200, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Academic Tutoring', 'education-academic-tutoring', 'education', id, 210, true
from service_categories where slug = 'education'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Mathematics Tutoring (Per Session)', 'Mathematics Tutoring (Per Session) — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'education-academic-tutoring'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'English Tutoring (Per Session)', 'English Tutoring (Per Session) — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'education-academic-tutoring'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Physics Tutoring (Per Session)', 'Physics Tutoring (Per Session) — professional, verified helpers near you.', 3500, 9000, true
from service_categories where slug = 'education-academic-tutoring'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Chemistry Tutoring (Per Session)', 'Chemistry Tutoring (Per Session) — professional, verified helpers near you.', 3500, 9000, true
from service_categories where slug = 'education-academic-tutoring'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Biology Tutoring (Per Session)', 'Biology Tutoring (Per Session) — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'education-academic-tutoring'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'WAEC/JAMB Exam Prep (Per Session)', 'WAEC/JAMB Exam Prep (Per Session) — professional, verified helpers near you.', 4000, 10000, true
from service_categories where slug = 'education-academic-tutoring'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Primary School Homework Help', 'Primary School Homework Help — professional, verified helpers near you.', 2500, 6000, true
from service_categories where slug = 'education-academic-tutoring'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Economics Tutoring (Per Session)', 'Economics Tutoring (Per Session) — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'education-academic-tutoring'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Government Tutoring (Per Session)', 'Government Tutoring (Per Session) — professional, verified helpers near you.', 3000, 7000, true
from service_categories where slug = 'education-academic-tutoring'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Literature Tutoring (Per Session)', 'Literature Tutoring (Per Session) — professional, verified helpers near you.', 3000, 7000, true
from service_categories where slug = 'education-academic-tutoring'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Geography Tutoring (Per Session)', 'Geography Tutoring (Per Session) — professional, verified helpers near you.', 3000, 7000, true
from service_categories where slug = 'education-academic-tutoring'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Further Mathematics Tutoring (Per Session)', 'Further Mathematics Tutoring (Per Session) — professional, verified helpers near you.', 3500, 9000, true
from service_categories where slug = 'education-academic-tutoring'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Special Needs Tutoring (Per Session)', 'Special Needs Tutoring (Per Session) — professional, verified helpers near you.', 4000, 12000, true
from service_categories where slug = 'education-academic-tutoring'
on conflict (category_id, name) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Skills & Lessons', 'education-skills-lessons', 'education', id, 220, true
from service_categories where slug = 'education'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Computer Lessons', 'Computer Lessons — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'education-skills-lessons'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Coding Lessons (Per Session)', 'Coding Lessons (Per Session) — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'education-skills-lessons'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Music Lessons (Per Session)', 'Music Lessons (Per Session) — professional, verified helpers near you.', 4000, 12000, true
from service_categories where slug = 'education-skills-lessons'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Language Lessons (Per Session)', 'Language Lessons (Per Session) — professional, verified helpers near you.', 4000, 10000, true
from service_categories where slug = 'education-skills-lessons'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Driving Lessons (Per Session)', 'Driving Lessons (Per Session) — professional, verified helpers near you.', 4000, 10000, true
from service_categories where slug = 'education-skills-lessons'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'French Lessons (Per Session)', 'French Lessons (Per Session) — professional, verified helpers near you.', 4000, 10000, true
from service_categories where slug = 'education-skills-lessons'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Yoruba Lessons (Per Session)', 'Yoruba Lessons (Per Session) — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'education-skills-lessons'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Igbo Lessons (Per Session)', 'Igbo Lessons (Per Session) — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'education-skills-lessons'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Hausa Lessons (Per Session)', 'Hausa Lessons (Per Session) — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'education-skills-lessons'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Public Speaking Coaching (Per Session)', 'Public Speaking Coaching (Per Session) — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'education-skills-lessons'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Career Coaching (Per Session)', 'Career Coaching (Per Session) — professional, verified helpers near you.', 6000, 18000, true
from service_categories where slug = 'education-skills-lessons'
on conflict (category_id, name) do nothing;

-- ===== Events =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Events', 'events', 'events', 230, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Event Services', 'events-event-services', 'events', id, 240, true
from service_categories where slug = 'events'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Event Decoration', 'Event Decoration — professional, verified helpers near you.', 30000, 150000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Event Photography', 'Event Photography — professional, verified helpers near you.', 25000, 100000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Event Videography', 'Event Videography — professional, verified helpers near you.', 30000, 120000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Catering (Per Head)', 'Catering (Per Head) — professional, verified helpers near you.', 2500, 6000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'DJ Services', 'DJ Services — professional, verified helpers near you.', 20000, 80000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'MC / Event Host', 'MC / Event Host — professional, verified helpers near you.', 20000, 70000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Event Planning & Coordination', 'Event Planning & Coordination — professional, verified helpers near you.', 50000, 300000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Event Security Personnel (Per Guard)', 'Event Security Personnel (Per Guard) — professional, verified helpers near you.', 8000, 15000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Ushering Services (Per Usher)', 'Ushering Services (Per Usher) — professional, verified helpers near you.', 6000, 12000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Cake Making & Design', 'Cake Making & Design — professional, verified helpers near you.', 10000, 50000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Live Band Performance', 'Live Band Performance — professional, verified helpers near you.', 50000, 250000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Canopy & Chair Rental Setup', 'Canopy & Chair Rental Setup — professional, verified helpers near you.', 20000, 60000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Balloon Decoration', 'Balloon Decoration — professional, verified helpers near you.', 10000, 40000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Photo Booth Rental', 'Photo Booth Rental — professional, verified helpers near you.', 25000, 70000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Sound Equipment Rental', 'Sound Equipment Rental — professional, verified helpers near you.', 20000, 60000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Traditional Attire Rental', 'Traditional Attire Rental — professional, verified helpers near you.', 10000, 35000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Generator Rental (Event)', 'Generator Rental (Event) — professional, verified helpers near you.', 25000, 70000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Master of Ceremonies — Traditional', 'Master of Ceremonies — Traditional — professional, verified helpers near you.', 25000, 80000, true
from service_categories where slug = 'events-event-services'
on conflict (category_id, name) do nothing;

-- ===== Delivery & Logistics =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Delivery & Logistics', 'delivery-logistics', 'delivery-logistics', 250, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Delivery & Errands', 'delivery-logistics-delivery', 'delivery-logistics', id, 260, true
from service_categories where slug = 'delivery-logistics'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Food Delivery', 'Food Delivery — professional, verified helpers near you.', 800, 3000, true
from service_categories where slug = 'delivery-logistics-delivery'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Parcel Delivery (Within City)', 'Parcel Delivery (Within City) — professional, verified helpers near you.', 1200, 4000, true
from service_categories where slug = 'delivery-logistics-delivery'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Moving Services (Studio/1-Bed)', 'Moving Services (Studio/1-Bed) — professional, verified helpers near you.', 20000, 50000, true
from service_categories where slug = 'delivery-logistics-delivery'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Moving Services (2-3 Bed)', 'Moving Services (2-3 Bed) — professional, verified helpers near you.', 40000, 120000, true
from service_categories where slug = 'delivery-logistics-delivery'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Errand Running', 'Errand Running — professional, verified helpers near you.', 2000, 6000, true
from service_categories where slug = 'delivery-logistics-delivery'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Shopping Assistance', 'Shopping Assistance — professional, verified helpers near you.', 2500, 7000, true
from service_categories where slug = 'delivery-logistics-delivery'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Pickup & Drop-off Service', 'Pickup & Drop-off Service — professional, verified helpers near you.', 1500, 5000, true
from service_categories where slug = 'delivery-logistics-delivery'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Interstate Parcel Delivery', 'Interstate Parcel Delivery — professional, verified helpers near you.', 5000, 20000, true
from service_categories where slug = 'delivery-logistics-delivery'
on conflict (category_id, name) do nothing;

-- ===== Garden & Outdoor =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Garden & Outdoor', 'garden-outdoor', 'garden-outdoor', 270, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Garden & Outdoor Care', 'garden-outdoor-garden', 'garden-outdoor', id, 280, true
from service_categories where slug = 'garden-outdoor'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Gardening (General)', 'Gardening (General) — professional, verified helpers near you.', 4000, 10000, true
from service_categories where slug = 'garden-outdoor-garden'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Lawn Mowing', 'Lawn Mowing — professional, verified helpers near you.', 3500, 9000, true
from service_categories where slug = 'garden-outdoor-garden'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Landscaping Design & Setup', 'Landscaping Design & Setup — professional, verified helpers near you.', 25000, 100000, true
from service_categories where slug = 'garden-outdoor-garden'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Tree Trimming', 'Tree Trimming — professional, verified helpers near you.', 6000, 20000, true
from service_categories where slug = 'garden-outdoor-garden'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Tree Removal', 'Tree Removal — professional, verified helpers near you.', 15000, 50000, true
from service_categories where slug = 'garden-outdoor-garden'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Weed Removal', 'Weed Removal — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'garden-outdoor-garden'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Garden Maintenance (Monthly)', 'Garden Maintenance (Monthly) — professional, verified helpers near you.', 10000, 30000, true
from service_categories where slug = 'garden-outdoor-garden'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Compound Clearing', 'Compound Clearing — professional, verified helpers near you.', 8000, 25000, true
from service_categories where slug = 'garden-outdoor-garden'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Irrigation System Installation', 'Irrigation System Installation — professional, verified helpers near you.', 20000, 60000, true
from service_categories where slug = 'garden-outdoor-garden'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Fish Pond Maintenance', 'Fish Pond Maintenance — professional, verified helpers near you.', 8000, 25000, true
from service_categories where slug = 'garden-outdoor-garden'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Flower Bed Design & Planting', 'Flower Bed Design & Planting — professional, verified helpers near you.', 10000, 30000, true
from service_categories where slug = 'garden-outdoor-garden'
on conflict (category_id, name) do nothing;

-- ===== Pets =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Pets', 'pets', 'pets', 290, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Pet Care', 'pets-pet-care', 'pets', id, 300, true
from service_categories where slug = 'pets'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Dog Walking (Per Walk)', 'Dog Walking (Per Walk) — professional, verified helpers near you.', 2000, 5000, true
from service_categories where slug = 'pets-pet-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Pet Grooming', 'Pet Grooming — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'pets-pet-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Pet Sitting (Per Day)', 'Pet Sitting (Per Day) — professional, verified helpers near you.', 4000, 10000, true
from service_categories where slug = 'pets-pet-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Pet Training (Per Session)', 'Pet Training (Per Session) — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'pets-pet-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Veterinary Assistance Visit', 'Veterinary Assistance Visit — professional, verified helpers near you.', 6000, 20000, true
from service_categories where slug = 'pets-pet-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Pet Boarding (Per Day)', 'Pet Boarding (Per Day) — professional, verified helpers near you.', 5000, 12000, true
from service_categories where slug = 'pets-pet-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Aquarium Cleaning', 'Aquarium Cleaning — professional, verified helpers near you.', 3500, 9000, true
from service_categories where slug = 'pets-pet-care'
on conflict (category_id, name) do nothing;

-- ===== Child & Family =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Child & Family', 'child-family', 'babysitting', 310, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Family Care', 'child-family-family-care', 'babysitting', id, 320, true
from service_categories where slug = 'child-family'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Babysitting (Per Hour)', 'Babysitting (Per Hour) — professional, verified helpers near you.', 1500, 3500, true
from service_categories where slug = 'child-family-family-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Full-Day Childcare', 'Full-Day Childcare — professional, verified helpers near you.', 6000, 15000, true
from service_categories where slug = 'child-family-family-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Live-in Nanny (Weekly)', 'Live-in Nanny (Weekly) — professional, verified helpers near you.', 15000, 35000, true
from service_categories where slug = 'child-family-family-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Elderly Companion Care (Per Day)', 'Elderly Companion Care (Per Day) — professional, verified helpers near you.', 6000, 15000, true
from service_categories where slug = 'child-family-family-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'House Sitting (Per Day)', 'House Sitting (Per Day) — professional, verified helpers near you.', 4000, 10000, true
from service_categories where slug = 'child-family-family-care'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Postnatal Support (Per Day)', 'Postnatal Support (Per Day) — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'child-family-family-care'
on conflict (category_id, name) do nothing;

-- ===== Cooking & Catering =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Cooking & Catering', 'cooking-catering', 'cooking', 330, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Home Cooking', 'cooking-catering-home-cooking', 'cooking', id, 340, true
from service_categories where slug = 'cooking-catering'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Personal Chef (Per Visit)', 'Personal Chef (Per Visit) — professional, verified helpers near you.', 6000, 18000, true
from service_categories where slug = 'cooking-catering-home-cooking'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Meal Prep (Weekly)', 'Meal Prep (Weekly) — professional, verified helpers near you.', 10000, 30000, true
from service_categories where slug = 'cooking-catering-home-cooking'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Small Chops Preparation', 'Small Chops Preparation — professional, verified helpers near you.', 8000, 25000, true
from service_categories where slug = 'cooking-catering-home-cooking'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Party Jollof Rice Catering (Per Pot)', 'Party Jollof Rice Catering (Per Pot) — professional, verified helpers near you.', 15000, 35000, true
from service_categories where slug = 'cooking-catering-home-cooking'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Continental Cooking Service', 'Continental Cooking Service — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'cooking-catering-home-cooking'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Baking Classes (Per Session)', 'Baking Classes (Per Session) — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'cooking-catering-home-cooking'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Private Dinner Party Chef', 'Private Dinner Party Chef — professional, verified helpers near you.', 20000, 60000, true
from service_categories where slug = 'cooking-catering-home-cooking'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Meal Delivery Subscription (Weekly)', 'Meal Delivery Subscription (Weekly) — professional, verified helpers near you.', 15000, 40000, true
from service_categories where slug = 'cooking-catering-home-cooking'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Birthday Cake & Pastries', 'Birthday Cake & Pastries — professional, verified helpers near you.', 8000, 30000, true
from service_categories where slug = 'cooking-catering-home-cooking'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Grilling & BBQ Service', 'Grilling & BBQ Service — professional, verified helpers near you.', 10000, 30000, true
from service_categories where slug = 'cooking-catering-home-cooking'
on conflict (category_id, name) do nothing;

-- ===== Appliance Repair =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Appliance Repair', 'appliance-repair', 'wrench', 350, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Home Appliance Repair', 'appliance-repair-appliance', 'wrench', id, 360, true
from service_categories where slug = 'appliance-repair'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Refrigerator Repair', 'Refrigerator Repair — professional, verified helpers near you.', 6000, 18000, true
from service_categories where slug = 'appliance-repair-appliance'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Air Conditioner Servicing', 'Air Conditioner Servicing — professional, verified helpers near you.', 6000, 15000, true
from service_categories where slug = 'appliance-repair-appliance'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Air Conditioner Repair', 'Air Conditioner Repair — professional, verified helpers near you.', 8000, 25000, true
from service_categories where slug = 'appliance-repair-appliance'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Air Conditioner Gas Refill', 'Air Conditioner Gas Refill — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'appliance-repair-appliance'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Washing Machine Repair', 'Washing Machine Repair — professional, verified helpers near you.', 6000, 20000, true
from service_categories where slug = 'appliance-repair-appliance'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Microwave Repair', 'Microwave Repair — professional, verified helpers near you.', 4000, 12000, true
from service_categories where slug = 'appliance-repair-appliance'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Gas Cooker Repair', 'Gas Cooker Repair — professional, verified helpers near you.', 4000, 12000, true
from service_categories where slug = 'appliance-repair-appliance'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Gas Cooker Installation', 'Gas Cooker Installation — professional, verified helpers near you.', 3500, 9000, true
from service_categories where slug = 'appliance-repair-appliance'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Water Dispenser Repair', 'Water Dispenser Repair — professional, verified helpers near you.', 3500, 9000, true
from service_categories where slug = 'appliance-repair-appliance'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Smart TV Repair', 'Smart TV Repair — professional, verified helpers near you.', 6000, 20000, true
from service_categories where slug = 'appliance-repair-appliance'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Blender & Mixer Repair', 'Blender & Mixer Repair — professional, verified helpers near you.', 2500, 6000, true
from service_categories where slug = 'appliance-repair-appliance'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Home Theatre / Sound System Setup', 'Home Theatre / Sound System Setup — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'appliance-repair-appliance'
on conflict (category_id, name) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Pest Control', 'appliance-repair-pest-control', 'wrench', id, 370, true
from service_categories where slug = 'appliance-repair'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'General Fumigation', 'General Fumigation — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'appliance-repair-pest-control'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Termite Treatment', 'Termite Treatment — professional, verified helpers near you.', 15000, 40000, true
from service_categories where slug = 'appliance-repair-pest-control'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Rodent Control', 'Rodent Control — professional, verified helpers near you.', 6000, 15000, true
from service_categories where slug = 'appliance-repair-pest-control'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Bed Bug Treatment', 'Bed Bug Treatment — professional, verified helpers near you.', 10000, 25000, true
from service_categories where slug = 'appliance-repair-pest-control'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Mosquito Fogging', 'Mosquito Fogging — professional, verified helpers near you.', 6000, 15000, true
from service_categories where slug = 'appliance-repair-pest-control'
on conflict (category_id, name) do nothing;

-- ===== Business & Professional =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Business & Professional', 'business-professional', 'laptop', 380, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Office & Admin Support', 'business-professional-office-support', 'laptop', id, 390, true
from service_categories where slug = 'business-professional'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Bookkeeping (Monthly)', 'Bookkeeping (Monthly) — professional, verified helpers near you.', 15000, 50000, true
from service_categories where slug = 'business-professional-office-support'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Tax Filing Assistance', 'Tax Filing Assistance — professional, verified helpers near you.', 10000, 40000, true
from service_categories where slug = 'business-professional-office-support'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'CV Writing & Review', 'CV Writing & Review — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'business-professional-office-support'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Virtual Assistant (Per Hour)', 'Virtual Assistant (Per Hour) — professional, verified helpers near you.', 2500, 6000, true
from service_categories where slug = 'business-professional-office-support'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Document Translation (Per Page)', 'Document Translation (Per Page) — professional, verified helpers near you.', 2000, 6000, true
from service_categories where slug = 'business-professional-office-support'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Notary / Document Certification', 'Notary / Document Certification — professional, verified helpers near you.', 3000, 10000, true
from service_categories where slug = 'business-professional-office-support'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Business Plan Writing', 'Business Plan Writing — professional, verified helpers near you.', 20000, 80000, true
from service_categories where slug = 'business-professional-office-support'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Data Entry (Per Project)', 'Data Entry (Per Project) — professional, verified helpers near you.', 5000, 20000, true
from service_categories where slug = 'business-professional-office-support'
on conflict (category_id, name) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Marketing & Content', 'business-professional-marketing-content', 'laptop', id, 400, true
from service_categories where slug = 'business-professional'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Social Media Content Creation', 'Social Media Content Creation — professional, verified helpers near you.', 15000, 50000, true
from service_categories where slug = 'business-professional-marketing-content'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Product Photography', 'Product Photography — professional, verified helpers near you.', 10000, 30000, true
from service_categories where slug = 'business-professional-marketing-content'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Portrait Photography Session', 'Portrait Photography Session — professional, verified helpers near you.', 10000, 30000, true
from service_categories where slug = 'business-professional-marketing-content'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Drone Photography/Videography', 'Drone Photography/Videography — professional, verified helpers near you.', 20000, 60000, true
from service_categories where slug = 'business-professional-marketing-content'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Voiceover Recording', 'Voiceover Recording — professional, verified helpers near you.', 5000, 20000, true
from service_categories where slug = 'business-professional-marketing-content'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Logo Design', 'Logo Design — professional, verified helpers near you.', 8000, 30000, true
from service_categories where slug = 'business-professional-marketing-content'
on conflict (category_id, name) do nothing;

-- ===== Security Services =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Security Services', 'security', 'shield', 410, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Home & Event Security', 'security-home-security', 'shield', id, 420, true
from service_categories where slug = 'security'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Security Guard Hire (Per Shift)', 'Security Guard Hire (Per Shift) — professional, verified helpers near you.', 6000, 15000, true
from service_categories where slug = 'security-home-security'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Event Security Detail (Per Guard)', 'Event Security Detail (Per Guard) — professional, verified helpers near you.', 8000, 15000, true
from service_categories where slug = 'security-home-security'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Home Security Audit', 'Home Security Audit — professional, verified helpers near you.', 10000, 25000, true
from service_categories where slug = 'security-home-security'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Safe Installation', 'Safe Installation — professional, verified helpers near you.', 8000, 25000, true
from service_categories where slug = 'security-home-security'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'CCTV Monitoring Setup (Monthly)', 'CCTV Monitoring Setup (Monthly) — professional, verified helpers near you.', 10000, 30000, true
from service_categories where slug = 'security-home-security'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Access Control Installation', 'Access Control Installation — professional, verified helpers near you.', 20000, 60000, true
from service_categories where slug = 'security-home-security'
on conflict (category_id, name) do nothing;

-- ===== Fitness & Wellness =====
insert into service_categories (name, slug, icon_key, sort_order, is_active)
values ('Fitness & Wellness', 'fitness-wellness', 'sprout', 430, true)
on conflict (slug) do nothing;

insert into service_categories (name, slug, icon_key, parent_category_id, sort_order, is_active)
select 'Personal Training & Coaching', 'fitness-wellness-personal-training', 'sprout', id, 440, true
from service_categories where slug = 'fitness-wellness'
on conflict (slug) do nothing;

insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Personal Trainer (Per Session)', 'Personal Trainer (Per Session) — professional, verified helpers near you.', 5000, 15000, true
from service_categories where slug = 'fitness-wellness-personal-training'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Yoga Instructor (Per Session)', 'Yoga Instructor (Per Session) — professional, verified helpers near you.', 5000, 12000, true
from service_categories where slug = 'fitness-wellness-personal-training'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Nutrition Coaching (Per Session)', 'Nutrition Coaching (Per Session) — professional, verified helpers near you.', 6000, 18000, true
from service_categories where slug = 'fitness-wellness-personal-training'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Home Gym Setup Consultation', 'Home Gym Setup Consultation — professional, verified helpers near you.', 8000, 20000, true
from service_categories where slug = 'fitness-wellness-personal-training'
on conflict (category_id, name) do nothing;
insert into services (category_id, name, description, base_price_min, base_price_max, is_active)
select id, 'Group Fitness Class (Per Person)', 'Group Fitness Class (Per Person) — professional, verified helpers near you.', 3000, 8000, true
from service_categories where slug = 'fitness-wellness-personal-training'
on conflict (category_id, name) do nothing;

commit;

-- Total distinct services seeded: 258