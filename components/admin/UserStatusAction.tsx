'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function UserStatusAction({ userId, currentStatus }: { userId: string; currentStatus: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function setStatus(status: 'active' | 'suspended' | 'banned') {
    await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    startTransition(() => router.refresh());
  }

  if (currentStatus === 'active') {
    return (
      <button disabled={pending} onClick={() => setStatus('suspended')} className="text-warning text-xs font-bold">
        Suspend
      </button>
    );
  }
  return (
    <button disabled={pending} onClick={() => setStatus('active')} className="text-brand text-xs font-bold">
      Reactivate
    </button>
  );
}
