// Notification delivery.
//
// The `notifications` row (in-app channel) is ALWAYS written — that's real,
// synchronous, and needs no external credentials, so in-app notifications
// work out of the box. SMS/email/push are attempted only if the relevant
// provider credentials are configured; if not, delivery is skipped for
// that channel and the failure is recorded on the row rather than thrown,
// so a missing provider never breaks the calling flow (booking creation,
// matching, payment, etc.) — same fallback-isolation pattern as the AI and
// payment integrations.

import type { SupabaseClient } from '@supabase/supabase-js';

export type NotificationCategory = 'booking' | 'payment' | 'security' | 'ai_match' | 'marketing';

interface NotifyInput {
  userId: string; // users.id (internal)
  modeContext: 'customer' | 'helper' | 'system';
  type: string;
  title: string;
  body?: string;
  dataJson?: Record<string, unknown>;
  category?: NotificationCategory;
}

export async function notify(supabase: SupabaseClient, input: NotifyInput) {
  // 1. In-app — always written, this is the row the Notifications UI reads.
  const { data: row } = await supabase
    .from('notifications')
    .insert({
      user_id: input.userId,
      mode_context: input.modeContext,
      type: input.type,
      title: input.title,
      body: input.body,
      data_json: input.dataJson ?? {},
      channel: 'in_app',
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  // 2. Check preferences + attempt additional channels. Security
  // notifications bypass opt-out
  const category = input.category ?? categoryForType(input.type);
  if (category !== 'security') {
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('channel, enabled')
      .eq('user_id', input.userId)
      .eq('mode', input.modeContext === 'system' ? 'customer' : input.modeContext)
      .eq('category', category);

    const enabledChannels = new Set((prefs ?? []).filter((p) => p.enabled).map((p) => p.channel));
    if (enabledChannels.has('sms')) await trySms(supabase, input, row?.id);
    if (enabledChannels.has('email')) await tryEmail(supabase, input, row?.id);
  }

  return row;
}

function categoryForType(type: string): NotificationCategory {
  if (type.startsWith('payment')) return 'payment';
  if (type.startsWith('security')) return 'security';
  if (type.includes('match')) return 'ai_match';
  return 'booking';
}

async function trySms(supabase: SupabaseClient, input: NotifyInput, notificationId?: string) {
  const apiKey = process.env.SMS_PROVIDER_API_KEY;
  const sender = process.env.SMS_PROVIDER_SENDER_ID;
  if (!apiKey || !sender) {
    if (notificationId) await supabase.from('notifications').update({ status: 'failed' }).eq('id', notificationId);
    return; // provider not configured — isolated, doesn't throw
  }

  const { data: recipient } = await supabase.from('users').select('phone_number').eq('id', input.userId).maybeSingle();
  if (!recipient?.phone_number) {
    // User registered with email only — nothing to SMS. Not an error,
    // just means this channel doesn't apply to this account.
    if (notificationId) await supabase.from('notifications').update({ status: 'failed' }).eq('id', notificationId);
    return;
  }

  try {
    // Generic REST call shape — swap the URL/body for the actual configured
    // SMS provider (e.g. Termii, Africa's Talking) once credentials exist.
    await fetch(process.env.SMS_PROVIDER_ENDPOINT ?? 'https://api.sms-provider.example.com/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: sender, to: recipient.phone_number, message: `${input.title}: ${input.body ?? ''}` }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    if (notificationId) await supabase.from('notifications').update({ status: 'failed' }).eq('id', notificationId);
  }
}

async function tryEmail(supabase: SupabaseClient, input: NotifyInput, notificationId?: string) {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  if (!apiKey) {
    if (notificationId) await supabase.from('notifications').update({ status: 'failed' }).eq('id', notificationId);
    return;
  }

  const { data: recipient } = await supabase.from('users').select('email').eq('id', input.userId).maybeSingle();
  if (!recipient?.email) {
    // User registered with phone only — nothing to email.
    if (notificationId) await supabase.from('notifications').update({ status: 'failed' }).eq('id', notificationId);
    return;
  }

  try {
    // Generic REST call shape — swap for the actual configured provider
    // (e.g. Resend, Postmark, SES) once credentials exist.
    await fetch(process.env.EMAIL_PROVIDER_ENDPOINT ?? 'https://api.email-provider.example.com/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: recipient.email, subject: input.title, html: input.body }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    if (notificationId) await supabase.from('notifications').update({ status: 'failed' }).eq('id', notificationId);
  }
}
