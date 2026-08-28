// PATCH /v1/helpers/me/availability-status. Updates the durable Postgres
// flag AND mirrors it into Redis ("real-time availability" key) so the
// AI Matching candidate
// filter (lib/ai/matching.ts callers) reads a fast, near-real-time signal
// without hitting Postgres per candidate.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { redis, isRedisConfigured } from '@/lib/redis/client';

const BodySchema = z.object({ status: z.enum(['online', 'offline']) });

export async function PATCH(req: NextRequest) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  const { data: helper, error } = await supabase
    .from('helper_profiles')
    .update({ availability_status: parsed.data.status })
    .eq('user_id', appUser.id)
    .select()
    .single();

  if (error || !helper) return NextResponse.json({ error: { code: 'UPDATE_FAILED', message: error?.message } }, { status: 500 });

  if (isRedisConfigured()) {
    if (parsed.data.status === 'online') {
      await redis.set(`availability:${helper.id}`, 'online', 300);
    } else {
      await redis.del(`availability:${helper.id}`);
    }
  }

  return NextResponse.json({ availability_status: helper.availability_status });
}
