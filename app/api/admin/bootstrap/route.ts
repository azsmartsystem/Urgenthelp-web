import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { hashPassword } from '@/lib/auth/admin';

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Creates the very first admin account. Deliberately has NO auth check of
// its own — bootstrapping the first admin is inherently a "before any
// admin exists" problem, so there's no admin session to require yet.
// Safe anyway: it checks whether ANY admin_users row already exists and
// refuses outright if so, which means this endpoint can only ever
// succeed once, for the very first setup. After that it permanently
// 409s for everyone, forever — there's no ongoing attack surface.
export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Enter a valid email and a password of at least 8 characters.' } }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { count } = await supabase.from('admin_users').select('*', { count: 'exact', head: true });
  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: { code: 'ALREADY_BOOTSTRAPPED', message: 'An admin account already exists. Ask an existing admin to create your account instead.' } },
      { status: 409 }
    );
  }

  const { data: superAdminRole } = await supabase.from('roles').select('id').eq('name', 'super_admin').maybeSingle();
  if (!superAdminRole) {
    return NextResponse.json(
      { error: { code: 'ROLES_NOT_SEEDED', message: 'The "super_admin" role does not exist yet — run the platform-settings/roles migration first.' } },
      { status: 500 }
    );
  }

  const { error } = await supabase.from('admin_users').insert({
    email: parsed.data.email,
    password_hash: hashPassword(parsed.data.password),
    role_id: superAdminRole.id,
    status: 'active',
  });

  if (error) {
    return NextResponse.json({ error: { code: 'BOOTSTRAP_FAILED', message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
