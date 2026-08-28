'use client';
import { useEffect, useState } from 'react';

// Renders a private file (job photo, message media) by fetching a
// short-lived signed URL from /api/files/{id}/url — never renders a raw
// storage path, since job-photos/message-media have no public read
// access (see lib/storage/upload.ts).
export function SignedImage({ fileId, className }: { fileId: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/files/${fileId}/url`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => active && setUrl(data.url))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [fileId]);

  if (failed) return <div className={`bg-line ${className}`} />;
  if (!url) return <div className={`bg-line animate-pulse ${className}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className={className} />;
}
