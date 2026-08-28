import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';

async function getOwnHelperId(supabase: any, userId: string) {
  const { data: helper } = await supabase.from('helper_profiles').select('id').eq('user_id', userId).maybeSingle();
  return helper?.id ?? null;
}

// POST — add a service the helper now offers.
export async function POST(req: NextRequest) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const helperId = await getOwnHelperId(supabase, appUser.id);
  if (!helperId) return NextResponse.json({ error: { code: 'NOT_A_HELPER' } }, { status: 403 });

  const parsed = z.object({ service_id: z.string().uuid(), helper_price: z.number().positive().optional() }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  // RLS (helper_skills_owner_write, migration 0012) independently enforces
  // that helperId actually belongs to this caller — this isn't the only
  // thing standing between a helper and adding skills to someone else's
  // profile.
  const { error } = await supabase
    .from('helper_skills')
    .upsert(
      { helper_id: helperId, service_id: parsed.data.service_id, helper_price: parsed.data.helper_price ?? null, is_active: true },
      { onConflict: 'helper_id,service_id' }
    );

  if (error) return NextResponse.json({ error: { code: 'ADD_SERVICE_FAILED', message: error.message } }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PATCH — toggle active/inactive, or update the helper's own price, for a
// service they already offer.
export async function PATCH(req: NextRequest) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const helperId = await getOwnHelperId(supabase, appUser.id);
  if (!helperId) return NextResponse.json({ error: { code: 'NOT_A_HELPER' } }, { status: 403 });

  const parsed = z
    .object({ service_id: z.string().uuid(), is_active: z.boolean().optional(), helper_price: z.number().positive().optional() })
    .safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (parsed.data.is_active !== undefined) updates.is_active = parsed.data.is_active;
  if (parsed.data.helper_price !== undefined) updates.helper_price = parsed.data.helper_price;

  const { error } = await supabase.from('helper_skills').update(updates).eq('helper_id', helperId).eq('service_id', parsed.data.service_id);
  if (error) return NextResponse.json({ error: { code: 'UPDATE_FAILED', message: error.message } }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE — remove a service entirely (?service_id=...).
export async function DELETE(req: NextRequest) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const helperId = await getOwnHelperId(supabase, appUser.id);
  if (!helperId) return NextResponse.json({ error: { code: 'NOT_A_HELPER' } }, { status: 403 });

  const serviceId = req.nextUrl.searchParams.get('service_id');
  if (!serviceId) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'service_id is required' } }, { status: 400 });

  const { error } = await supabase.from('helper_skills').delete().eq('helper_id', helperId).eq('service_id', serviceId);
  if (error) return NextResponse.json({ error: { code: 'DELETE_FAILED', message: error.message } }, { status: 500 });
  return NextResponse.json({ ok: true });
}
