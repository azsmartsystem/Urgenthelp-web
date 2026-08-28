// GET /api/files/{id}/url.
// job-photos and message-media have no client-facing storage policy (see
// lib/storage/upload.ts), so reading one back also has to go through the
// server: verify the caller is actually entitled to see this file (its
// owner, a participant on the booking it's attached to, or an admin),
// then mint a short-lived signed READ URL via the service-role client.

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { createServiceRoleClient } from '@/lib/supabase/server';

const SIGNED_URL_TTL_SECONDS = 300; // 5 minutes — long enough to render, short enough to limit exposure if a link leaks

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const { data: file } = await supabase.from('files').select('*').eq('id', params.id).single();
  if (!file) return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });

  let authorized = file.owner_user_id === appUser.id;

  if (!authorized && file.purpose === 'job_photo') {
    const { data: media } = await supabase
      .from('booking_media')
      .select('bookings(customer_profiles(user_id), helper_profiles(user_id))')
      .eq('file_id', file.id)
      .maybeSingle();
    const booking = (media as any)?.bookings;
    authorized = booking?.customer_profiles?.user_id === appUser.id || booking?.helper_profiles?.user_id === appUser.id;
  }

  if (!authorized && file.purpose === 'message_media') {
    const { data: message } = await supabase.from('messages').select('conversation_id').eq('media_file_id', file.id).maybeSingle();
    if (message) {
      const { data: participant } = await supabase
        .from('conversation_participants')
        .select('id')
        .eq('conversation_id', message.conversation_id)
        .eq('user_id', appUser.id)
        .maybeSingle();
      authorized = Boolean(participant);
    }
  }

  if (!authorized) return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });

  const [bucket, ...pathParts] = file.s3_key.split('/');
  const path = pathParts.join('/');

  const admin = createServiceRoleClient();
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return NextResponse.json({ error: { code: 'SIGN_FAILED', message: error?.message } }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl, expires_in: SIGNED_URL_TTL_SECONDS });
}
