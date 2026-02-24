export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url && !publishableKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
  }

  if (!url) {
    throw new Error('Missing Supabase environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!publishableKey) {
    throw new Error('Missing Supabase environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  return { url, publishableKey };
}
