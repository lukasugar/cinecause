'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const MIN_PASSWORD_LENGTH = 8;

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || 'Unable to update password.');
        return;
      }

      router.push('/profile/advanced');
      router.refresh();
    } catch {
      setError('Unable to update password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <div className="section-block mx-auto max-w-md p-6 fade-up">
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Set new password</h1>
        <p className="mt-2 text-[var(--text-muted)]">Enter a new password to finish account recovery.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-[var(--text-muted)]" htmlFor="new-password">
            New password
          </label>
          <input
            id="new-password"
            name="new-password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input-modern w-full px-3 py-2"
          />

          <label className="block text-sm text-[var(--text-muted)]" htmlFor="confirm-password">
            Confirm password
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="input-modern w-full px-3 py-2"
          />

          {error && (
            <p className="rounded border border-[var(--danger)]/60 bg-[rgba(67,12,24,0.65)] px-3 py-2 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary px-4 py-2 disabled:opacity-60"
          >
            {isSubmitting ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <div className="mt-6">
          <Link href="/auth/sign-in" className="text-sm text-[var(--accent-2)] hover:text-[var(--text-strong)]">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
