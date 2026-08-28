'use client';
import { useRouter } from 'next/navigation';

export function FraudEventAction({ eventId }: { eventId: string }) {
  const router = useRouter();
  async function act(status: 'confirmed' | 'dismissed') {
    await fetch(`/api/admin/fraud-events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }
  return (
    <div className="flex gap-2">
      <button onClick={() => act('dismissed')} className="text-xs font-bold text-ink-faint">
        Dismiss
      </button>
      <button onClick={() => act('confirmed')} className="text-xs font-bold text-danger">
        Confirm
      </button>
    </div>
  );
}
