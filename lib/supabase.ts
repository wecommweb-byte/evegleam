import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-only Supabase client using the service-role key.
// NEVER import this into a client component — the service-role key must stay on the server.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;

/**
 * Returns a singleton server-side Supabase client, or null if env vars are missing.
 * Callers should handle the null case by falling back to a live WooCommerce fetch.
 */
export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  if (client) return client;
  client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
