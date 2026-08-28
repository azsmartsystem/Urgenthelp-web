// GET /v1/conversations.
import { NextResponse } from 'next/server';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';

export async function GET() {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const { data: participantRows } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', appUser.id);

  const ids = (participantRows ?? []).map((r) => r.conversation_id);
  if (ids.length === 0) return NextResponse.json({ data: [] });

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, bookings(services(name), status), conversation_participants(user_id, users(id, customer_profiles(display_name), helper_profiles(display_name)))')
    .in('id', ids)
    .order('created_at', { ascending: false });

  return NextResponse.json({ data: conversations });
}
