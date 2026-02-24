import { db } from '@/db';
import { donations, media, profiles } from '@/db/schema';
import { asc, desc, eq, gt, gte, sql } from 'drizzle-orm';
import { Leaderboard, type LeaderboardView } from '@/components/Leaderboard';
import { RecentDonations } from '@/components/RecentDonations';

export const metadata = {
  title: 'Leaderboard - CineCause',
  description: 'See which movies inspire the most charitable giving.',
};

export const dynamic = 'force-dynamic'; // Render at request time to avoid build-time DB dependency

interface LeaderboardPageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const { view } = await searchParams;
  const initialView: LeaderboardView = view === 'recent' ? 'recent' : 'all';

  let allTimeMedia: typeof media.$inferSelect[] = [];
  let recentMedia: typeof media.$inferSelect[] = [];
  let recentDonations: Array<{
    id: number;
    amountCents: number;
    donatedAt: Date;
    donorFirstName: string | null;
    mediaTitle: string | null;
    mediaType: string | null;
    tmdbId: number | null;
    displayName: string | null;
    isPublic: boolean | null;
  }> = [];

  if (process.env.DATABASE_URL) {
    const recentCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTotalDonations = sql<number>`coalesce(sum(${donations.amountCents}), 0)`;
    const recentDonationCount = sql<number>`count(${donations.id})`;

    allTimeMedia = await db
      .select()
      .from(media)
      .where(gt(media.totalDonationsCents, 0))
      .orderBy(desc(media.totalDonationsCents));

    recentMedia = await db
      .select({
        id: media.id,
        tmdbId: media.tmdbId,
        mediaType: media.mediaType,
        title: media.title,
        posterPath: media.posterPath,
        releaseYear: media.releaseYear,
        totalDonationsCents: recentTotalDonations.as('total_donations_cents'),
        donationCount: recentDonationCount.as('donation_count'),
        createdAt: media.createdAt,
        updatedAt: media.updatedAt,
      })
      .from(donations)
      .innerJoin(media, eq(donations.mediaId, media.id))
      .where(gte(donations.donatedAt, recentCutoff))
      .groupBy(media.id)
      .orderBy(desc(recentTotalDonations), desc(recentDonationCount), asc(media.title));

    recentDonations = await db
      .select({
        id: donations.id,
        amountCents: donations.amountCents,
        donatedAt: donations.donatedAt,
        donorFirstName: donations.donorFirstName,
        mediaTitle: media.title,
        mediaType: media.mediaType,
        tmdbId: media.tmdbId,
        displayName: profiles.displayName,
        isPublic: profiles.isPublic,
      })
      .from(donations)
      .leftJoin(media, eq(donations.mediaId, media.id))
      .leftJoin(profiles, eq(donations.userId, profiles.userId))
      .orderBy(desc(donations.donatedAt))
      .limit(20);
  }

  const recentDonationItems = recentDonations.map((row) => ({
    ...row,
    mediaType: row.mediaType as 'movie' | 'tv' | null,
  }));

  return (
    <div className="page-container">
      <div className="mb-8 fade-up">
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Impact Leaderboard</h1>
        <p className="mt-2 text-lg text-[var(--text-muted)]">
          See which stories are driving the most generosity.
        </p>
      </div>

      <Leaderboard allTimeMedia={allTimeMedia} recentMedia={recentMedia} initialView={initialView} />

      <section className="mt-12 fade-up">
        <h2 className="text-2xl font-semibold text-[var(--text-strong)]">Recent Donations</h2>
        <p className="mt-2 text-[var(--text-muted)]">Latest giving activity, respecting donor privacy settings.</p>
        <div className="mt-4">
          <RecentDonations items={recentDonationItems} />
        </div>
      </section>
    </div>
  );
}
