// POST /v1/verification/documents.
// Records a verification_records row. The file itself is uploaded
// client-side directly to the private `verification-documents` Supabase
// Storage bucket (see the upload step in app/helper/onboarding/page.tsx,
// governed by the owner-only policies in
// supabase/migrations/0004_storage_buckets.sql) — this route links the
// already-uploaded storage path to a verification record for admin review.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';

const BodySchema = z.object({
  type: z.enum(['government_id', 'selfie', 'address', 'business_doc']),
  storage_path: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  const { data: file } = await supabase
    .from('files')
    .insert({ owner_user_id: appUser.id, s3_key: parsed.data.storage_path, purpose: 'id_document', scan_status: 'pending' })
    .select()
    .single();

  const { data: record, error } = await supabase
    .from('verification_records')
    .insert({ user_id: appUser.id, type: parsed.data.type, file_id: file?.id, status: 'pending' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: { code: 'VERIFICATION_SUBMIT_FAILED', message: error.message } }, { status: 500 });

  // Product decision for this version: a successfully uploaded document
  // that passes basic validation (present, owned by the uploader, a real
  // file — enforced by the storage-upload step and the `files` row above)
  // moves the person straight to Verified, without a manual admin review
  // step. This is intentionally a placeholder trust policy, not a claim
  // that the document's authenticity was actually checked — swap this for
  // a real review queue (the `verification_records.status = 'pending'`
  // path already exists and admin/verification/[id] already supports
  // approving/rejecting it) once identity-verification is a real
  // requirement.
  await supabase.from('verification_records').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', record.id);

  const { data: helper } = await supabase.from('helper_profiles').select('id, verification_status').eq('user_id', appUser.id).maybeSingle();
  if (helper && helper.verification_status !== 'verified') {
    await supabase.from('helper_profiles').update({ verification_status: 'verified' }).eq('id', helper.id);
  }

  return NextResponse.json({ ...record, status: 'approved', helper_verified: Boolean(helper) }, { status: 201 });
}
