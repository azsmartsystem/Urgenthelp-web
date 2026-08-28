// POST /v1/users/me/helper-profile equivalent — Technical Implementation
// Spec §7.2. Creates the helper_profiles row + starting skills + service
// area in one call so the onboarding wizard can submit once at the end.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';

const BodySchema = z.object({
  display_name: z.string().min(1),
  bio: z.string().max(1000).optional(),
  years_experience: z.number().min(0).max(60).default(0),
  service_radius_km: z.number().min(1).max(100).default(10),
  center_lat: z.number(),
  center_lng: z.number(),
  skill_service_ids: z.array(z.string().uuid()).min(1),
});

export async function POST(req: NextRequest) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } }, { status: 400 });
  }
  const body = parsed.data;

  const { data: existing } = await supabase.from('helper_profiles').select('id').eq('user_id', appUser.id).maybeSingle();
  if (existing) {
    return NextResponse.json({ error: { code: 'HELPER_PROFILE_EXISTS' } }, { status: 409 });
  }

  const { data: helper, error } = await supabase
    .from('helper_profiles')
    .insert({
      user_id: appUser.id,
      display_name: body.display_name,
      bio: body.bio,
      years_experience: body.years_experience,
      service_radius_km: body.service_radius_km,
      verification_status: 'unverified',
      availability_status: 'offline',
    })
    .select()
    .single();

  if (error || !helper) {
    return NextResponse.json({ error: { code: 'ONBOARDING_FAILED', message: error?.message } }, { status: 500 });
  }

  await supabase.from('service_areas').insert({
    helper_id: helper.id,
    center_lat: body.center_lat,
    center_lng: body.center_lng,
    radius_km: body.service_radius_km,
  });

  await supabase
    .from('helper_skills')
    .insert(body.skill_service_ids.map((serviceId) => ({ helper_id: helper.id, service_id: serviceId, is_active: true })));

  // Wallet is created lazily here too — every user gets exactly one
  //, and a customer-only user may not have had one yet.
  await supabase.from('wallets').upsert({ user_id: appUser.id, balance: 0 }, { onConflict: 'user_id' });

  return NextResponse.json(helper, { status: 201 });
}
