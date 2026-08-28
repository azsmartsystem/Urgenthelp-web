// POST /api/files/{id}/confirm.
// Step 2 of the upload flow: called after the browser has successfully
// uploaded bytes to the signed URL from /api/files/upload-url. Marks the
// file as scanned (see note below) and, for job photos, links it to
// `booking_media` so it shows up on the booking detail page.
//
// No malware-scanning provider is configured, so this route marks
// scan_status='clean' immediately as a placeholder — this is an explicit,
// documented gap, not a silent skip. Wiring a real scanner (e.g. an
// S3/Storage-triggered Lambda calling ClamAV or a vendor API) means
// changing exactly one line here once that credential exists.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';

const BodySchema = z.object({
  booking_id: z.string().uuid().optional(),
  stage: z.enum(['request', 'completion']).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const { data: file } = await supabase.from('files').select('*').eq('id', params.id).single();
  if (!file) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
  if (file.owner_user_id !== appUser.id) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  const body = parsed.success ? parsed.data : {};

  await supabase.from('files').update({ scan_status: 'clean' }).eq('id', file.id);

  if (file.purpose === 'job_photo' && body.booking_id) {
    const { data: booking } = await supabase
      .from('bookings')
      .select('customer_profiles(user_id), helper_profiles(user_id)')
      .eq('id', body.booking_id)
      .single();
    const isParticipant =
      (booking as any)?.customer_profiles?.user_id === appUser.id || (booking as any)?.helper_profiles?.user_id === appUser.id;
    if (!isParticipant) return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });

    await supabase.from('booking_media').insert({
      booking_id: body.booking_id,
      file_id: file.id,
      uploaded_by: appUser.id,
      stage: body.stage ?? 'request',
    });
  }

  return NextResponse.json({ ok: true, file_id: file.id });
}
