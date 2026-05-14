import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedAdmin: SupabaseClient | undefined;

/**
 * Admin client for API routes. Lazily created so `next build` can run without
 * Supabase env vars present (e.g. Vercel preview until secrets are set).
 */
export const supabaseAdmin = (): SupabaseClient => {
  if (cachedAdmin) return cachedAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY missing — set in .env.local');
  }
  cachedAdmin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
  return cachedAdmin;
};
