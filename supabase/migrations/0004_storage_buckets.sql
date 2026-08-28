-- Urgent Help — Storage buckets & policies (Technical Implementation Spec §17)
-- Private by default; access only via signed URLs generated server-side,
-- or direct owner-scoped policies below for upload/read of one's own files.

insert into storage.buckets (id, name, public)
values
  ('verification-documents', 'verification-documents', false),
  ('job-photos', 'job-photos', false),
  ('profile-images', 'profile-images', true),
  ('message-media', 'message-media', false)
on conflict (id) do nothing;

-- verification-documents: owner can upload/read their own folder (path prefixed by their users.id)
create policy "verification_docs_owner_insert" on storage.objects for insert
  with check (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = app_user_id()::text);
create policy "verification_docs_owner_select" on storage.objects for select
  using (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = app_user_id()::text);

-- profile-images: public read, owner-only write
create policy "profile_images_public_read" on storage.objects for select using (bucket_id = 'profile-images');
create policy "profile_images_owner_write" on storage.objects for insert
  with check (bucket_id = 'profile-images' and (storage.foldername(name))[1] = app_user_id()::text);

-- job-photos / message-media: participant-only, enforced at the API layer
-- via signed URLs (service-role client) rather than a storage policy,
-- since "which booking/conversation this belongs to" isn't encodable in a
-- folder-prefix policy cleanly. No client-facing policy is defined for
-- these two buckets, so RLS's default-deny keeps them inaccessible to the
-- anon/authenticated roles; only the service-role client (used by
-- app/api/files routes) can read/write them.
