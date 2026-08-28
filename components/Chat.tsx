'use client';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadFile } from '@/lib/storage/client-upload';
import { SignedImage } from './SignedImage';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  media_file_id?: string | null;
  sent_at: string;
}

// Real-time chat. Loads history via
// REST (/api/conversations/{id}/messages), then subscribes to Supabase
// Realtime on the `messages` table filtered to this conversation for live
// delivery — no separate WebSocket/Pusher infrastructure needed since
// Supabase already provides this on top of Postgres logical replication.
export function Chat({ conversationId, currentUserId }: { conversationId: string; currentUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    fetch(`/api/conversations/${conversationId}/messages`)
      .then((r) => r.json())
      .then((json) => {
        if (active) setMessages(json.data ?? []);
      });

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function send() {
    if (!draft.trim()) return;
    setSending(true);
    const body = draft;
    setDraft('');
    await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    // No optimistic append needed — the Realtime INSERT subscription above
    // delivers it back to us (and to the other participant) immediately.
    setSending(false);
  }

  async function sendImage(file: File) {
    setSending(true);
    try {
      const { fileId } = await uploadFile(file, 'message_media', { conversationId });
      await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: '📷 Photo', media_file_id: fileId }),
      });
    } catch {
      // Attachment failed to send — the input is cleared regardless so the
      // user can retry; a toast/error state is a natural next addition.
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col h-[500px] card overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                m.sender_id === currentUserId ? 'bg-brand text-white' : 'bg-panel-2 text-ink'
              }`}
            >
              {m.media_file_id ? (
                <SignedImage fileId={m.media_file_id} className="w-40 h-40 rounded-xl object-cover" />
              ) : (
                m.body
              )}
            </div>
          </div>
        ))}
        {messages.length === 0 && <div className="text-center text-ink-faint text-sm py-10">No messages yet — say hello.</div>}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-line p-3 flex gap-2 items-center">
        <label
          className="w-9 h-9 rounded-full flex items-center justify-center text-ink-faint border border-line cursor-pointer flex-shrink-0 text-lg"
          aria-label="Attach a photo"
        >
          📎
          <input
            type="file"
            accept="image/*"
            hidden
            aria-label="Attach a photo"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) sendImage(file);
              e.target.value = '';
            }}
          />
        </label>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message…"
          className="flex-1 bg-panel-2 text-ink placeholder:text-ink-faint border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        <button onClick={send} disabled={sending || !draft.trim()} className="btn btn-primary btn-sm">
          Send
        </button>
      </div>
    </div>
  );
}
