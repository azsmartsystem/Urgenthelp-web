'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Standalone verification-document upload, separate from the multi-step
// helper onboarding wizard (app/helper/onboarding) — that flow forces
// someone back through profile/skills/radius even if they'd already done
// those and just skipped or need to redo the ID step. This is the direct
// path referenced from the onboarding wizard's "no ID uploaded" fallback
// and from the profile page's own verification section.
export function VerificationUpload({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function submit() {
    if (!file) return;
    setError(null);
    setUploading(true);

    const path = `${userId}/${Date.now()}_${file.name}`;
    const { error: uploadErr } = await supabase.storage.from('verification-documents').upload(path, file);
    if (uploadErr) {
      setUploading(false);
      return setError('Upload failed — try again.');
    }

    const res = await fetch('/api/verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'government_id', storage_path: path }),
    });
    setUploading(false);
    if (!res.ok) return setError('Could not complete verification — try again.');

    setDone(true);
    router.refresh();
  }

  if (done) {
    return <p className="text-sm text-success font-semibold">✓ Verified — you can start accepting jobs now.</p>;
  }

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} aria-label="Upload verification document" className="text-sm text-ink-soft" />
      <button onClick={submit} disabled={!file || uploading} className="btn btn-primary btn-sm">
        {uploading ? 'Uploading…' : 'Upload & verify'}
      </button>
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  );
}
