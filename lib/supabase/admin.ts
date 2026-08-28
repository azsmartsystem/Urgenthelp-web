import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. BYPASSES ROW LEVEL SECURITY.
 *
 * Server-only. Never import this file from a Client Component or
 * expose SUPABASE_SERVICE_ROLE_KEY to the browser bundle. Used by:
 *  - Admin Dashboard API routes (Technical Spec §16)
 *  - Payment webhooks (Technical Spec §15)
 *  - Background workers / AI decision writers (Technical Spec §9)
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() must never be called from the browser.");
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
