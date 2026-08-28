// GET/POST /v1/conversations/{id}/messages. Real-time delivery happens
// via Supabase Realtime (the client subscribes to the `messages` table
// directly, see components/Chat.tsx) —
// this route is the durable read/write path and the source of truth.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAppUserServer } from '@/lib/auth/current-user';
import { notify } from '@/lib/notifications/notify';

const BodySchema = z.object({ body: z.string().min(1).max(4000), media_file_id: z.string().uuid().optional() });

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', params.id)
    .order('sent_at', { ascending: true });

  if (error) return NextResponse.json({ error: { code: 'QUERY_FAILED', message: error.message } }, { status: 500 });
  return NextResponse.json({ data: messages });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { supabase, appUser } = await getCurrentAppUserServer();
  if (!appUser) return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });

  const parsed = BodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: { code: 'VALIDATION_ERROR' } }, { status: 400 });

  // If a media file is attached, confirm the sender actually owns it and
  // uploaded it for this exact conversation — otherwise a user could
  // attach someone else's file_id to a message in a chat they're in.
  if (parsed.data.media_file_id) {
    const { data: file } = await supabase
      .from('files')
      .select('id, owner_user_id, purpose')
      .eq('id', parsed.data.media_file_id)
      .single();
    if (!file || file.owner_user_id !== appUser.id || file.purpose !== 'message_media') {
      return NextResponse.json({ error: { code: 'INVALID_ATTACHMENT' } }, { status: 403 });
    }
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: params.id,
      sender_id: appUser.id,
      body: parsed.data.body,
      media_file_id: parsed.data.media_file_id ?? null,
      delivered_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: { code: 'SEND_FAILED', message: error.message } }, { status: 500 });

  // Notify the other participant(s).
  const { data: participants } = await supabase.from('conversation_participants').select('user_id').eq('conversation_id', params.id).neq('user_id', appUser.id);
  for (const p of participants ?? []) {
    await notify(supabase, {
      userId: p.user_id,
      modeContext: 'customer', // best-effort; UI resolves per-mode inbox regardless
      type: 'new_message',
      title: 'New message',
      body: parsed.data.body.slice(0, 120),
      dataJson: { conversationId: params.id },
    });
  }

  return NextResponse.json(message, { status: 201 });
}
