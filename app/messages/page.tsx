import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { Logo } from '@/components/Logo';
import { NavBar } from '@/components/NavBar';

export default async function ConversationsListPage() {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) redirect('/login');

  const { data: participantRows } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', appUser.id);
  const ids = (participantRows ?? []).map((r) => r.conversation_id);

  const { data: conversations } = ids.length
    ? await supabase
        .from('conversations')
        .select('*, bookings(services(name), status)')
        .in('id', ids)
        .order('created_at', { ascending: false })
    : { data: [] };

  return (
    <main className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel">
        <Logo />
        <NavBar />
      </header>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-extrabold text-ink mb-5">Messages</h1>
        {conversations && conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((c: any) => (
              <Link key={c.id} href={`/messages/${c.id}`} className="card p-4 flex justify-between items-center block">
                <div>
                  <div className="font-bold text-ink text-sm">{c.bookings?.services?.name ?? 'Support conversation'}</div>
                  <div className="text-xs text-ink-faint mt-0.5 capitalize">{c.bookings?.status?.replace('_', ' ')}</div>
                </div>
                <span className="text-ink-faint">→</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-ink-faint text-sm">
            No conversations yet — they appear automatically once a helper accepts your booking.
          </div>
        )}
      </div>
    </main>
  );
}
