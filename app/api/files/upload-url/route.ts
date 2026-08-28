// POST /api/files/upload-url.
// Step 1 of the upload flow: validate the caller can actually attach a
// file to the target booking/conversation, create a `files` row
// (status=pending until /confirm), and return a signed upload URL scoped
// to exactly one path in the correct private bucket.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { UPLOAD_PURPOSES, ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES, buildStoragePath, createSignedUpload } from '@/lib/storage/upload';

const BodySchema = z.object({
  purpose: z.enum(UPLOAD_PURPOSES),
  file_name: z.string().min(1),
  mime_type: z.string(),
  size_bytes: z.number().positive(),
  booking_id: z.string().uuid().optional(),
  conversation_id: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } }, { status: 400 });
  }
  const body = parsed.data;

  if (!ALLOWED_MIME_TYPES.includes(body.mime_type)) {
    return NextResponse.json({ error: { code: 'UNSUPPORTED_FILE_TYPE', message: 'Only JPEG, PNG, WEBP or HEIC images are supported.' } }, { status: 415 });
  }
  if (body.size_bytes > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: { code: 'FILE_TOO_LARGE', message: 'Images must be 10MB or smaller.' } }, { status: 413 });
  }

  // Authorize: caller must be a participant of the booking/conversation
  // they're attaching this file to — otherwise anyone could generate an
  // upload URL claiming to belong to someone else's job or chat.
  if (body.purpose === 'job_photo') {
    if (!body.booking_id) return NextResponse.json({ error: { code: 'BOOKING_ID_REQUIRED' } }, { status: 400 });
    const { data: booking } = await supabase
      .from('bookings')
      .select('customer_profiles(user_id), helper_profiles(user_id)')
      .eq('id', body.booking_id)
      .single();
    const isParticipant =
      (booking as any)?.customer_profiles?.user_id === appUser.id || (booking as any)?.helper_profiles?.user_id === appUser.id;
    if (!isParticipant) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Not a participant on this booking.' } }, { status: 403 });
  }

  if (body.purpose === 'message_media') {
    if (!body.conversation_id) return NextResponse.json({ error: { code: 'CONVERSATION_ID_REQUIRED' } }, { status: 400 });
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', body.conversation_id)
      .eq('user_id', appUser.id)
      .maybeSingle();
    if (!participant) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Not a participant in this conversation.' } }, { status: 403 });
  }

  const path = buildStoragePath(body.purpose, appUser.id, body.file_name);

  let signed;
  try {
    signed = await createSignedUpload(supabase, body.purpose, path);
  } catch (err: any) {
    return NextResponse.json({ error: { code: 'SIGNED_URL_FAILED', message: err.message } }, { status: 500 });
  }

  const { data: file, error } = await supabase
    .from('files')
    .insert({
      owner_user_id: appUser.id,
      s3_key: `${signed.bucket}/${signed.path}`,
      mime_type: body.mime_type,
      size_bytes: body.size_bytes,
      purpose: body.purpose,
      scan_status: 'pending',
    })
    .select()
    .single();

  if (error || !file) return NextResponse.json({ error: { code: 'FILE_RECORD_FAILED' } }, { status: 500 });

  return NextResponse.json({
    file_id: file.id,
    bucket: signed.bucket,
    path: signed.path,
    token: signed.token,
    signed_url: signed.signedUrl,
  });
}
