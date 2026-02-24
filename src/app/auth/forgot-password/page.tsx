'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { buildPasswordResetRedirectTo } from '@/lib/auth/password-reset';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setRequestSubmitted(false);

    try {
      const supabase = createClient();
      const redirectTo = buildPasswordResetRedirectTo(window.location.origin);
      await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    } catch {
      // Preserve generic response behavior to avoid account enumeration.
    } finally {
      setRequestSubmitted(true);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <div className="section-block mx-auto max-w-md p-6 fade-up">
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Forgot password</h1>
        <p className="mt-2 text-[var(--text-muted)]">Enter your email and we will send a password reset link.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            onChange={(event) => setEmail(event.target.value)}
            className="input-modern w-full px-3 py-2"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary px-4 py-2 disabled:opacity-60"
          >
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        {requestSubmitted && (
          <p className="mt-4 rounded border border-[var(--accent-2)]/40 bg-[rgba(25,36,46,0.45)] px-3 py-2 text-sm text-[var(--text-muted)]">
            If an account exists for this email, we sent a password reset link.
          </p>
        )}

        <div className="mt-6">
          <Link href="/auth/sign-in" className="text-sm text-[var(--accent-2)] hover:text-[var(--text-strong)]">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
