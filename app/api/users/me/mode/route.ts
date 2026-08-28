// POST /v1/users/me/mode equivalent.
// The signature Customer <-> Helper mode switch. Verifies a helper_profile
// exists before allowing a switch to helper mode; if not, tells the client
// to route into helper onboarding instead of erroring blindly.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';

const BodySchema = z.object({ mode: z.enum(['customer', 'helper']) });

export async function POST(req: NextRequest) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  if (parsed.data.mode === 'helper') {
    const { data: helperProfile } = await supabase
      .from('helper_profiles')
      .select('id, verification_status')
      .eq('user_id', appUser.id)
      .maybeSingle();
    if (!helperProfile) {
      return NextResponse.json(
        { error: { code: 'NO_HELPER_PROFILE', message: 'Start helper onboarding first.' }, next_action: 'start_helper_onboarding' },
        { status: 409 }
      );
    }
  }

  await supabase.from('users').update({ active_mode: parsed.data.mode }).eq('id', appUser.id);

  return NextResponse.json({ active_mode: parsed.data.mode });
}
