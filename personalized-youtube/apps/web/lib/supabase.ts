import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const assertSupabaseConfig = (key: string) => {
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL missing; set it in .env.local');
  }
  if (!key) {
    throw new Error('Supabase key missing; set it in .env.local');
  }
};

export const supabase = () => {
  assertSupabaseConfig(anonKey);
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
};

export const supabaseAdmin = () => {
  assertSupabaseConfig(serviceKey);
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
};
