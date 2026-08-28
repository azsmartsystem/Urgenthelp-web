'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button onClick={logout} className={className ?? 'btn btn-ghost text-danger w-full'}>
      Log out
    </button>
  );
}
