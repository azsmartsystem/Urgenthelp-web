'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AppSidebar } from '@/components/AppSidebar';

export function NavBar() {
  const [unread, setUnread] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function loadUnread() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from('notifications')
        .select('*, users!inner(auth_user_id)', { count: 'exact', head: true })
        .is('read_at', null)
        .eq('users.auth_user_id', user.id);
      setUnread(count ?? 0);
    }
    loadUnread();
  }, [supabase]);

  return (
    <div className="flex items-center gap-3">
      <Link href="/messages" className="text-ink-soft hover:text-ink text-lg" title="Messages" aria-label="Messages">
        💬
      </Link>
      <Link href="/wallet" className="text-ink-soft hover:text-ink text-lg" title="Wallet" aria-label="Wallet">
        💳
      </Link>
      <Link href="/notifications" className="relative text-ink-soft hover:text-ink text-lg" title="Notifications" aria-label="Notifications">
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full border-2 border-surface" />
        )}
      </Link>
      <AppSidebar />
    </div>
  );
}
