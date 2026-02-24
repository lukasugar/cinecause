import { describe, it, expect, vi } from 'vitest';
import { getSupabaseEnv } from '../supabase/config';

describe('supabase env contract', () => {
  it('returns url and publishable key when present', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'publishable-key');

    expect(getSupabaseEnv()).toEqual({
      url: 'https://example.supabase.co',
      publishableKey: 'publishable-key',
    });
  });

  it('throws when required env vars are missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');

    expect(() => getSupabaseEnv()).toThrowError(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
  });
});
