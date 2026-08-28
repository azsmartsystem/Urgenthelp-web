'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Marks all of the current user's unread notifications as read once this
// page has been viewed — simple, real behavior (no polling/batching
// needed since this list is small and read on-demand).
export function MarkReadOnView() {
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: appUser } = await supabase.from('users').select('id').eq('auth_user_id', user.id).single();
      if (!appUser) return;
      await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', appUser.id).is('read_at', null);
    })();
  }, []);
  return null;
}
