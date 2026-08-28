import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { ensureWallet } from '@/lib/wallet/ensure-wallet';

// Resolves the app's users.id from the current Supabase auth session
// (auth.users.id != users.id — see migration 0003). Also provisions the
// users/customer_profiles/wallet rows on first sight of a new identity,
// regardless of which auth method was used.
export async function getCurrentAppUser(supabase: SupabaseClient) {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return { authUser: null, appUser: null };

  const { data: existing } = await supabase.from('users').select('*').eq('auth_user_id', authUser.id).maybeSingle();
  if (existing) {
    // Wallet provisioning failures shouldn't block the rest of the app —
    // swallow it here; the wallet page/payout routes retry on their own.
    await ensureWallet(supabase, existing.id).catch((err) => console.error('ensureWallet failed', err));
    return { authUser, appUser: existing };
  }

  const identifierFields = authUser.email
    ? { email: authUser.email, email_verified_at: authUser.email_confirmed_at ?? new Date().toISOString() }
    : authUser.phone
      ? { phone_number: authUser.phone, phone_verified_at: authUser.phone_confirmed_at ?? new Date().toISOString() }
      : {};

  const { data: provisioned } = await supabase
    .from('users')
    .upsert({ auth_user_id: authUser.id, active_mode: 'customer', ...identifierFields }, { onConflict: 'auth_user_id' })
    .select()
    .maybeSingle();

  if (provisioned) {
    const displayName = (authUser.user_metadata?.display_name as string | undefined) ?? authUser.email?.split('@')[0] ?? 'there';
    await supabase.from('customer_profiles').upsert({ user_id: provisioned.id, display_name: displayName }, { onConflict: 'user_id' });
    await ensureWallet(supabase, provisioned.id).catch((err) => console.error('ensureWallet failed', err));
  }

  return { authUser, appUser: provisioned };
}

// Convenience for Server Components / Route Handlers that already have
// access to `cookies()` — creates the server client and resolves in one call.
export async function getCurrentAppUserServer() {
  const supabase = createClient();
  return { supabase, ...(await getCurrentAppUser(supabase)) };
}
