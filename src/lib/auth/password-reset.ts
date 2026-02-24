export const PASSWORD_RESET_NEXT_PATH = '/auth/update-password';

export function buildPasswordResetRedirectTo(origin: string) {
  const next = encodeURIComponent(PASSWORD_RESET_NEXT_PATH);
  return `${origin}/auth/callback?next=${next}`;
}
