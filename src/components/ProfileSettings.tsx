'use client';

import { FormEvent, useState } from 'react';
import { buildPasswordResetRedirectTo } from '@/lib/auth/password-reset';
import { createClient } from '@/lib/supabase/client';

type ProfileSettingsProps = {
  initialDisplayName: string;
  initialIsPublic: boolean;
  accountEmail: string;
};

export function ProfileSettings({ initialDisplayName, initialIsPublic, accountEmail }: ProfileSettingsProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, isPublic }),
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      setMessage('Profile updated.');
    } catch {
      setMessage('Unable to save profile settings.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendPasswordReset() {
    if (!accountEmail) {
      setMessage('No account email is available for password reset.');
      return;
    }

    setIsSendingPasswordReset(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const redirectTo = buildPasswordResetRedirectTo(window.location.origin);
      await supabase.auth.resetPasswordForEmail(accountEmail, { redirectTo });
    } catch {
      // Preserve generic response behavior to avoid account enumeration.
    } finally {
      setMessage('If your email is eligible, we sent a reset link.');
      setIsSendingPasswordReset(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== 'DELETE') {
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Account deletion failed');
      }

      const supabase = createClient();
      await supabase.auth.signOut();

      try {
        window.location.assign('/');
      } catch {
        // JSDOM may throw on navigation during tests.
      }
    } catch {
      setMessage('Unable to delete account.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="section-block space-y-6 p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--text-strong)]">Profile Settings</h2>

        <label className="block">
          <span className="mb-1 block text-sm text-[var(--text-muted)]">Display name</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={120}
            className="input-modern w-full px-3 py-2"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Show my name publicly on recent donations
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary px-4 py-2 disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </form>

      <section className="space-y-3 rounded-lg border border-[var(--accent-2)]/40 bg-[rgba(25,36,46,0.35)] p-4">
        <h3 className="text-lg font-semibold text-[var(--text-strong)]">Password</h3>
        <p className="text-sm text-[var(--text-muted)]">
          Send a secure password reset link to your account email.
        </p>
        <button
          type="button"
          onClick={handleSendPasswordReset}
          disabled={isSendingPasswordReset || !accountEmail}
          className="btn-secondary px-4 py-2 disabled:opacity-60"
        >
          {isSendingPasswordReset ? 'Sending reset email...' : 'Send password reset email'}
        </button>
      </section>

      <section className="space-y-3 rounded-lg border border-[rgba(255,107,125,0.55)] bg-[rgba(79,11,26,0.35)] p-4">
        <h3 className="text-lg font-semibold text-[var(--danger)]">Delete account</h3>
        <p className="text-sm text-[var(--danger)]">
          This permanently deletes your account. Donation totals stay intact, but your linked donation data is anonymized.
        </p>
        <label className="block text-sm text-[var(--danger)]">
          <span className="mb-1 block">Type DELETE to confirm</span>
          <input
            aria-label="Type DELETE to confirm"
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            className="input-modern w-full border-[rgba(255,107,125,0.55)] px-3 py-2"
          />
        </label>
        <button
          type="button"
          disabled={isDeleting || deleteConfirmation !== 'DELETE'}
          onClick={handleDeleteAccount}
          className="rounded-lg bg-[var(--danger)] px-4 py-2 text-[#1e0710] font-semibold hover:brightness-105 disabled:opacity-60"
        >
          {isDeleting ? 'Deleting...' : 'Delete account'}
        </button>
      </section>

      {message && <p className="text-sm text-[var(--text-muted)]">{message}</p>}
    </div>
  );
}
