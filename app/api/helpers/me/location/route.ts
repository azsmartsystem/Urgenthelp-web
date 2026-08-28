// POST /v1/helpers/me/location.
// High-frequency GPS ping from the helper's client during en_route/
// in_progress. Writes to Redis only (see lib/redis/location.ts).
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { pingHelperLocation } from '@/lib/redis/location';

const BodySchema = z.object({ lat: z.number(), lng: z.number() });

export async function POST(req: NextRequest) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  const { data: helper } = await supabase.from('helper_profiles').select('id').eq('user_id', appUser.id).single();
  if (!helper) return NextResponse.json({ error: { code: 'NOT_A_HELPER' } }, { status: 403 });

  const result = await pingHelperLocation(helper.id, parsed.data.lat, parsed.data.lng);
  return NextResponse.json(result);
}
