import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminOrNull } from '@/lib/auth/admin-guard';

const BodySchema = z.object({
  name: z.string().min(1),
  category_id: z.string().uuid(),
  base_price_min: z.number().positive(),
  base_price_max: z.number().positive(),
});

export async function POST(req: NextRequest) {
  const session = await getAdminOrNull();
  if (!session) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } }, { status: 400 });

  const { data, error } = await session.supabase.from('services').insert(parsed.data).select().single();
  if (error) return NextResponse.json({ error: { code: 'CREATE_FAILED', message: error.message } }, { status: 500 });

  await session.supabase.from('audit_logs').insert({
    actor_type: 'admin',
    actor_id: session.admin.id,
    action: 'service_created',
    entity_type: 'services',
    entity_id: data.id,
    after_json: parsed.data,
  });

  return NextResponse.json(data, { status: 201 });
}
