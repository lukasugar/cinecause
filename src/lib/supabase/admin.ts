import { createClient } from '@supabase/supabase-js';

type SupabaseAdminEnv = {
  url: string;
  secretKey: string;
};

export function getSupabaseAdminEnv(): SupabaseAdminEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url && !secretKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY'
    );
  }

  if (!url) {
    throw new Error('Missing Supabase environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!secretKey) {
    throw new Error('Missing Supabase environment variable: SUPABASE_SECRET_KEY');
  }

  return { url, secretKey };
}

export function createAdminClient() {
  const { url, secretKey } = getSupabaseAdminEnv();

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
