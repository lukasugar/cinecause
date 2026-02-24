import { describe, expect, it } from 'vitest';
import { PASSWORD_RESET_NEXT_PATH, buildPasswordResetRedirectTo } from '../auth/password-reset';

describe('password reset helpers', () => {
  it('uses the update-password next path', () => {
    expect(PASSWORD_RESET_NEXT_PATH).toBe('/auth/update-password');
  });

  it('builds callback redirect with encoded next path', () => {
    expect(buildPasswordResetRedirectTo('https://cinecause.example')).toBe(
      'https://cinecause.example/auth/callback?next=%2Fauth%2Fupdate-password'
    );
  });
});
