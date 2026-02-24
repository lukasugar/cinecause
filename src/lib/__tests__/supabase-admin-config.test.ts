import { describe, it, expect, vi } from 'vitest';
import { getSupabaseAdminEnv } from '@/lib/supabase/admin';

describe('supabase admin env', () => {
  it('returns url and secret key when present', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SECRET_KEY', 'secret-key');

    expect(getSupabaseAdminEnv()).toEqual({
      url: 'https://example.supabase.co',
      secretKey: 'secret-key',
    });
  });

  it('requires secret key', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_SECRET_KEY', '');

    expect(() => getSupabaseAdminEnv()).toThrowError(
      'Missing Supabase environment variable: SUPABASE_SECRET_KEY'
    );
  });
});
