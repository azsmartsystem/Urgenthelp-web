import { NextResponse } from 'next/server';
import { getAdminOrNull } from '@/lib/auth/admin-guard';
import { SERVICE_CATALOG } from '@/lib/services/catalog-data';

// Seeds the full Nigerian-market service catalog (18 categories, 258
// services) via the service-role client. Batched into ~6 queries total
// (top-level categories, then subcategories, then services in chunks)
// rather than one row at a time, to stay well under a serverless
// function's execution limit. Idempotent — safe to re-run; skips
// anything already seeded via unique constraints on slug and
// (category_id, name).
export async function POST() {
  const session = await getAdminOrNull();
  if (!session) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });
  if (!['super_admin', 'ops'].includes(session.role)) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Only ops or super admin can seed the catalog.' } }, { status: 403 });
  }

  const db = session.supabase;

  // 1) Top-level categories: upsert all 18 in one call.
  const topLevelRows = SERVICE_CATALOG.map((c, i) => ({
    name: c.name,
    slug: c.slug,
    icon_key: c.iconKey,
    sort_order: (i + 1) * 10,
    is_active: true,
  }));
  const { error: topErr } = await db.from('service_categories').upsert(topLevelRows, { onConflict: 'slug', ignoreDuplicates: false });
  if (topErr) return NextResponse.json({ error: { code: 'SEED_FAILED', step: 'top-level categories', message: topErr.message } }, { status: 500 });

  const { data: topCats, error: topFetchErr } = await db
    .from('service_categories')
    .select('id, slug')
    .in(
      'slug',
      SERVICE_CATALOG.map((c) => c.slug)
    );
  if (topFetchErr || !topCats) {
    return NextResponse.json({ error: { code: 'SEED_FAILED', step: 'fetch top-level ids', message: topFetchErr?.message } }, { status: 500 });
  }
  const topIdBySlug = new Map(topCats.map((c) => [c.slug, c.id]));

  // 2) Subcategories: upsert all ~40 in one call, now that we know parent ids.
  const subRows = SERVICE_CATALOG.flatMap((c) =>
    c.subcategories.map((sub, si) => ({
      name: sub.name,
      slug: sub.slug,
      icon_key: c.iconKey,
      parent_category_id: topIdBySlug.get(c.slug),
      sort_order: (si + 1) * 10,
      is_active: true,
    }))
  );
  const { error: subErr } = await db.from('service_categories').upsert(subRows, { onConflict: 'slug', ignoreDuplicates: false });
  if (subErr) return NextResponse.json({ error: { code: 'SEED_FAILED', step: 'subcategories', message: subErr.message } }, { status: 500 });

  const { data: subCats, error: subFetchErr } = await db
    .from('service_categories')
    .select('id, slug')
    .in(
      'slug',
      subRows.map((s) => s.slug)
    );
  if (subFetchErr || !subCats) {
    return NextResponse.json({ error: { code: 'SEED_FAILED', step: 'fetch subcategory ids', message: subFetchErr?.message } }, { status: 500 });
  }
  const subIdBySlug = new Map(subCats.map((c) => [c.slug, c.id]));

  // 3) Services: find what's already there (one query for the whole
  // catalog's worth of category ids), then insert only what's missing, in
  // chunks (Postgres has no problem with 250-row inserts, but chunking
  // keeps any single request comfortably small).
  const allSubIds = Array.from(subIdBySlug.values());
  const { data: existingServices, error: existingErr } = await db.from('services').select('category_id, name').in('category_id', allSubIds);
  if (existingErr) return NextResponse.json({ error: { code: 'SEED_FAILED', step: 'fetch existing services', message: existingErr.message } }, { status: 500 });

  const existingKey = new Set((existingServices ?? []).map((s) => `${s.category_id}::${s.name}`));

  const serviceRows: { category_id: string; name: string; description: string; base_price_min: number; base_price_max: number; is_active: boolean }[] = [];
  for (const c of SERVICE_CATALOG) {
    for (const sub of c.subcategories) {
      const subId = subIdBySlug.get(sub.slug);
      if (!subId) continue;
      for (const svc of sub.services) {
        if (existingKey.has(`${subId}::${svc.name}`)) continue;
        serviceRows.push({
          category_id: subId,
          name: svc.name,
          description: `${svc.name} — professional, verified helpers near you.`,
          base_price_min: svc.min,
          base_price_max: svc.max,
          is_active: true,
        });
      }
    }
  }

  let servicesCreated = 0;
  const errors: string[] = [];
  const CHUNK = 100;
  for (let i = 0; i < serviceRows.length; i += CHUNK) {
    const chunk = serviceRows.slice(i, i + CHUNK);
    const { error: insertErr, count } = await db.from('services').insert(chunk, { count: 'exact' });
    if (insertErr) {
      errors.push(`rows ${i}-${i + chunk.length}: ${insertErr.message}`);
    } else {
      servicesCreated += count ?? chunk.length;
    }
  }

  await db.from('audit_logs').insert({
    actor_type: 'admin',
    actor_id: session.admin.id,
    action: 'service_catalog_seeded',
    entity_type: 'services',
    after_json: { categoriesUpserted: topLevelRows.length + subRows.length, servicesCreated, alreadyExisted: existingKey.size, errorCount: errors.length },
  });

  return NextResponse.json({
    categoriesUpserted: topLevelRows.length + subRows.length,
    servicesCreated,
    alreadyExisted: existingKey.size,
    totalInCatalog: SERVICE_CATALOG.reduce((s, c) => s + c.subcategories.reduce((s2, sc) => s2 + sc.services.length, 0), 0),
    errors: errors.slice(0, 20),
  });
}
