'use client';
import { useRouter } from 'next/navigation';

export function ServiceToggle({ serviceId, isActive }: { serviceId: string; isActive: boolean }) {
  const router = useRouter();
  async function toggle() {
    await fetch(`/api/admin/services/${serviceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    });
    router.refresh();
  }
  return (
    <button onClick={toggle} className="text-xs font-bold text-brand">
      {isActive ? 'Deactivate' : 'Activate'}
    </button>
  );
}
