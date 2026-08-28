// Browser-side Supabase client — safe to use in client components.
// Reads only the public anon key; RLS policies (0002_rls_policies.sql)
// are what actually keeps data scoped to the right user.
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
