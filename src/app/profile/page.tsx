import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { donations, media, profiles } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { DonationHistory, type DonationHistoryItem } from '@/components/DonationHistory';

export const metadata = {
  title: 'Your Profile - CineCause',
  description: 'Manage your profile and view your donation history.',
};

export default async function ProfilePage() {
  let user: { id: string } | null = null;
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
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Your Profile</h1>
        <p className="mt-3 text-[var(--text-muted)]">Sign in to track your impact history and manage your visibility preferences.</p>
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
  let donationHistoryItems: DonationHistoryItem[] = [];
  let totalDonatedCents = 0;
  let totalDonationsCount = 0;

  try {
    [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (!profile) {
      [profile] = await db.insert(profiles).values({ userId: user.id, isPublic: false }).returning();
    }

    const donationRows = await db
      .select({
        id: donations.id,
        amountCents: donations.amountCents,
        charityName: donations.charityName,
        donatedAt: donations.donatedAt,
        mediaTitle: media.title,
        mediaType: media.mediaType,
        tmdbId: media.tmdbId,
      })
      .from(donations)
      .leftJoin(media, eq(donations.mediaId, media.id))
      .where(eq(donations.userId, user.id))
      .orderBy(desc(donations.donatedAt));

    donationHistoryItems = donationRows.map((row) => ({
      id: row.id,
      amountCents: row.amountCents,
      charityName: row.charityName,
      donatedAt: row.donatedAt,
      mediaTitle: row.mediaTitle,
      mediaType: row.mediaType as 'movie' | 'tv' | null,
      tmdbId: row.tmdbId,
    }));

    totalDonatedCents = donationHistoryItems.reduce((sum, donation) => sum + donation.amountCents, 0);
    totalDonationsCount = donationHistoryItems.length;
  } catch {
    return (
      <div className="page-container max-w-3xl">
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Your Profile</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Profile data is unavailable in this environment. Add `DATABASE_URL` to enable donation history.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-container max-w-3xl">
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Your Profile</h1>
        <p className="mt-3 text-[var(--text-muted)]">Unable to load profile data right now.</p>
      </div>
    );
  }

  if (profile.deletedAt) {
    return (
      <div className="page-container max-w-3xl">
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Your Profile</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          This account has been deleted. Your prior donations were anonymized while keeping aggregate impact totals intact.
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Your Profile</h1>
          <p className="mt-2 text-[var(--text-muted)]">Your contribution timeline, totals, and privacy controls in one place.</p>
        </div>
        <Link
          href="/profile/advanced"
          className="btn-secondary inline-flex items-center justify-center px-4 py-2 text-sm"
        >
          Advanced settings
        </Link>
      </div>

      <section className="mt-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="section-block p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Total donated</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--success)]">
              {(totalDonatedCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </p>
          </div>
          <div className="section-block p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Donations made</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">{totalDonationsCount}</p>
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-semibold text-[var(--text-strong)]">Donation History</h2>
        <DonationHistory items={donationHistoryItems} />
      </section>
    </div>
  );
}
