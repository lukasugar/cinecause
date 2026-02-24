import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { ProfileSettings } from '@/components/ProfileSettings';

export const metadata = {
  title: 'Advanced Profile Settings - CineCause',
  description: 'Manage profile visibility and account settings.',
};

export default async function AdvancedProfilePage() {
  let user: { id: string; email?: string | null } | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();
    user = supabaseUser;
  } catch {
    user = null;
  }

  if (!user) {
    return (
      <div className="page-container max-w-3xl">
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Advanced Settings</h1>
        <p className="mt-3 text-[var(--text-muted)]">Sign in to manage your profile settings.</p>
        <Link
          href="/auth/sign-in"
          className="btn-primary mt-6 inline-block px-4 py-2"
        >
          Sign in
        </Link>
      </div>
    );
  }

  let profile: typeof profiles.$inferSelect | undefined;
  try {
    [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (!profile) {
      [profile] = await db.insert(profiles).values({ userId: user.id, isPublic: false }).returning();
    }
  } catch {
    return (
      <div className="page-container max-w-3xl">
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Advanced Settings</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Profile settings are unavailable in this environment. Add `DATABASE_URL` to enable account controls.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container max-w-3xl">
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Advanced Settings</h1>
        <p className="mt-3 text-[var(--text-muted)]">Unable to load profile settings right now.</p>
      </div>
    );
  }

  if (profile.deletedAt) {
    return (
      <div className="page-container max-w-3xl">
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Advanced Settings</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          This account has been deleted. Your prior donations were anonymized while keeping aggregate impact totals intact.
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <Link href="/profile" className="text-sm text-[var(--accent-2)] hover:text-[var(--text-strong)]">
          Back to profile
        </Link>
        <h1 className="mt-3 text-4xl font-semibold text-[var(--text-strong)]">Advanced Settings</h1>
        <p className="mt-2 text-[var(--text-muted)]">Control your public donation visibility and account settings.</p>
      </div>

      <ProfileSettings
        initialDisplayName={profile.displayName ?? ''}
        initialIsPublic={profile.isPublic}
        accountEmail={user.email ?? ''}
      />
    </div>
  );
}
