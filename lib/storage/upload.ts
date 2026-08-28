// File upload infrastructure.
//
// job-photos and message-media are private buckets with NO client-facing
// storage policy (see supabase/migrations/0004_storage_buckets.sql) —
// "which booking/conversation this belongs to" isn't cleanly encodable in
// a folder-prefix RLS policy the way owner-only buckets are. Instead, the
// server (service-role client) verifies the caller is actually a
// participant of the target booking/conversation, then issues a
// short-lived SIGNED UPLOAD URL scoped to one exact path. The browser
// uploads directly to Storage with that token — bytes never pass through
// our Next.js server — and the signed token itself is the authorization,
// so it works correctly even though the bucket has no RLS policy granting
// the browser's anon/authenticated role any access.

import type { SupabaseClient } from '@supabase/supabase-js';

export const UPLOAD_PURPOSES = ['job_photo', 'message_media'] as const;
export type UploadPurpose = (typeof UPLOAD_PURPOSES)[number];

const BUCKET_FOR_PURPOSE: Record<UploadPurpose, string> = {
  job_photo: 'job-photos',
  message_media: 'message-media',
};

// Spec §17: "Images ≤ 10MB, documents ≤ 15MB (configurable)". Both of
// these buckets are image-only in the current UI (job photos, chat
// image attachments), so both use the image limit.
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export function bucketFor(purpose: UploadPurpose): string {
  return BUCKET_FOR_PURPOSE[purpose];
}

export function buildStoragePath(purpose: UploadPurpose, ownerUserId: string, fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return `${ownerUserId}/${unique}.${ext}`;
}

export async function createSignedUpload(supabase: SupabaseClient, purpose: UploadPurpose, path: string) {
  const bucket = bucketFor(purpose);
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? 'Could not create signed upload URL.');
  return { bucket, path, token: data.token, signedUrl: data.signedUrl };
}
