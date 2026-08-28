import { redirect } from 'next/navigation';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { Logo } from '@/components/Logo';
import { NavBar } from '@/components/NavBar';
import { MarkReadOnView } from '@/components/MarkReadOnView';

export default async function NotificationsPage() {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) redirect('/login');

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', appUser.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel">
        <Logo />
        <NavBar />
      </header>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-extrabold text-ink mb-5">Notifications</h1>
        <MarkReadOnView />
        {notifications && notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className={`card p-4 ${!n.read_at ? 'border-l-4 border-l-brand' : ''}`}>
                <div className="font-bold text-ink text-sm">{n.title}</div>
                {n.body && <div className="text-xs text-ink-soft mt-1">{n.body}</div>}
                <div className="text-[10.5px] text-ink-faint mt-2">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-ink-faint text-sm">No notifications yet.</div>
        )}
      </div>
    </main>
  );
}
