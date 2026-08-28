'use client';
// Browser-side upload helper — pairs with /api/files/upload-url +
// /api/files/{id}/confirm. Used by both the job-photo picker (booking
// request flow) and the chat image attachment button.

import { createClient } from '@/lib/supabase/client';
import type { UploadPurpose } from './upload';

export async function uploadFile(
  file: File,
  purpose: UploadPurpose,
  context: { bookingId?: string; conversationId?: string }
): Promise<{ fileId: string }> {
  const initRes = await fetch('/api/files/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      purpose,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      booking_id: context.bookingId,
      conversation_id: context.conversationId,
    }),
  });
  const init = await initRes.json();
  if (!initRes.ok) throw new Error(init.error?.message ?? 'Could not start upload.');

  const supabase = createClient();
  const { error: uploadError } = await supabase.storage.from(init.bucket).uploadToSignedUrl(init.path, init.token, file);
  if (uploadError) throw new Error(uploadError.message);

  const confirmRes = await fetch(`/api/files/${init.file_id}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: context.bookingId, stage: 'request' }),
  });
  if (!confirmRes.ok) {
    const data = await confirmRes.json().catch(() => ({}));
    throw new Error(data.error?.message ?? 'Could not confirm upload.');
  }

  return { fileId: init.file_id };
}
