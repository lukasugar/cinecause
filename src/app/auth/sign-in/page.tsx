'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function getReadableAuthError(message: string, mode: 'sign-in' | 'sign-up') {
  if (mode === 'sign-up' && /email rate limit exceeded/i.test(message)) {
    return 'Too many signup attempts right now. Please wait a moment and try again.';
  }
  return message;
}

export default function SignInPage() {
  const router = useRouter();
  const [authType, setAuthType] = useState<'sign-in' | 'sign-up'>('sign-up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSignUp = authType === 'sign-up';

  const callbackUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;

  async function handleEmailSignIn() {
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(getReadableAuthError(signInError.message, 'sign-in'));
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setError('Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEmailSignUp() {
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: callbackUrl ? { emailRedirectTo: callbackUrl } : undefined,
      });
      if (signUpError) {
        setError(getReadableAuthError(signUpError.message, 'sign-up'));
        return;
      }
      router.push('/auth/check-email');
      router.refresh();
    } catch {
      setError('Unable to create account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSignUp) {
      await handleEmailSignUp();
      return;
    }
    await handleEmailSignIn();
  }

  return (
    <div className="page-container">
      <div className="section-block mx-auto max-w-md p-6 fade-up">
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">{isSignUp ? 'Sign up' : 'Sign in'}</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          {isSignUp
            ? 'Create your account to track your giving history and manage privacy settings.'
            : 'Sign in to track your giving history and manage privacy settings.'}
        </p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {isSignUp ? (
            <>
              Already have an account? {' '}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setAuthType('sign-in')}
                aria-label="Switch to sign in"
                className="font-semibold text-[var(--text-strong)] underline underline-offset-4 disabled:opacity-60"
              >
                Sign in
              </button>
              .
            </>
          ) : (
            <>
              Don&apos;t have an account yet? {' '}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setAuthType('sign-up')}
                aria-label="Switch to sign up"
                className="font-semibold text-[var(--text-strong)] underline underline-offset-4 disabled:opacity-60"
              >
                Sign up
              </button>
              .
            </>
          )}
        </p>

        <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-[var(--text-muted)]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="username"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-modern w-full px-3 py-2"
          />

          <label className="block text-sm text-[var(--text-muted)]" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-modern w-full px-3 py-2"
          />

          {!isSignUp && (
            <div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[var(--accent-2)] hover:text-[var(--text-strong)]"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {error && (
            <p className="rounded border border-[var(--danger)]/60 bg-[rgba(67,12,24,0.65)] px-3 py-2 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-4 py-2 disabled:opacity-60"
            >
              {isSignUp ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
