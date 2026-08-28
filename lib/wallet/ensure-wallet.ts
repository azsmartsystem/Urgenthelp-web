import type { SupabaseClient } from '@supabase/supabase-js';

// Lazily creates a wallet row for a user on first use. Wallets aren't
// created at signup, so any code path that needs one should call this
// instead of assuming the row already exists.
export async function ensureWallet(supabase: SupabaseClient, userId: string): Promise<{ id: string; balance: number }> {
  const { data: existing } = await supabase.from('wallets').select('id, balance').eq('user_id', userId).maybeSingle();
  if (existing) return existing;

  const { data: created, error } = await supabase
    .from('wallets')
    .upsert({ user_id: userId, balance: 0, currency: 'NGN', status: 'active' }, { onConflict: 'user_id' })
    .select('id, balance')
    .single();

  if (created) return created;

  // Concurrent request created the wallet first — read it instead of failing.
  if (error) {
    const { data: afterRace } = await supabase.from('wallets').select('id, balance').eq('user_id', userId).single();
    if (afterRace) return afterRace;
  }

  throw new Error(`Could not provision wallet for user ${userId}`);
}
