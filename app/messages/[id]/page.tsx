import { redirect } from 'next/navigation';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { Logo } from '@/components/Logo';
import { NavBar } from '@/components/NavBar';
import { Chat } from '@/components/Chat';

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) redirect('/login');

  const { data: conversation } = await supabase.from('conversations').select('*, bookings(services(name))').eq('id', params.id).single();

  return (
    <main className="min-h-screen bg-surface">
      <header className="flex items-center justify-between px-6 py-4 border-b border-line bg-panel">
        <Logo />
        <NavBar />
      </header>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-lg font-extrabold text-ink mb-4">{conversation?.bookings?.services?.name ?? 'Conversation'}</h1>
        <Chat conversationId={params.id} currentUserId={appUser.id} />
      </div>
    </main>
  );
}
