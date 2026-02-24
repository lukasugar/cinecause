import Link from 'next/link';
import { ArrowRight, Film, Heart, Sparkles } from 'lucide-react';
import { inArray } from 'drizzle-orm';
import { db } from '@/db';
import { media } from '@/db/schema';
import { getTrendingMovies, getTrendingTv } from '@/lib/tmdb';
import { tmdbMovieListToMediaItems, tmdbTvListToMediaItems } from '@/lib/adapters';
import { buildNowTrendingItems } from '@/lib/now-trending';
import { MediaCarousel } from '@/components/MediaCarousel';
import { NowTrendingCarousel } from '@/components/NowTrendingCarousel';
import { SearchBar } from '@/components/SearchBar';
import type { MediaItem } from '@/types/media';

export const dynamic = 'force-dynamic';

function mergeDonationStats(items: MediaItem[], statsByKey: Map<string, { donationCount: number; totalDonationsCents: number }>) {
  return items.map((item) => {
    const stats = statsByKey.get(`${item.mediaType}-${item.id}`);
    if (!stats) return item;
    return {
      ...item,
      donationCount: stats.donationCount,
      totalDonationsCents: stats.totalDonationsCents,
    };
  });
}

export default async function HomePage() {
  const [movies, tvShows] = await Promise.all([
    getTrendingMovies(),
    getTrendingTv(),
  ]);

  const movieItemsRaw = tmdbMovieListToMediaItems(movies);
  const tvItemsRaw = tmdbTvListToMediaItems(tvShows);
  const statsByKey = new Map<string, { donationCount: number; totalDonationsCents: number }>();

  if (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test') {
    const tmdbIds = Array.from(new Set([...movieItemsRaw, ...tvItemsRaw].map((item) => item.id)));

    if (tmdbIds.length > 0) {
      try {
        const mediaRows = await db
          .select({
            tmdbId: media.tmdbId,
            mediaType: media.mediaType,
            donationCount: media.donationCount,
            totalDonationsCents: media.totalDonationsCents,
          })
          .from(media)
          .where(inArray(media.tmdbId, tmdbIds));

        for (const row of mediaRows) {
          statsByKey.set(`${row.mediaType}-${row.tmdbId}`, {
            donationCount: row.donationCount ?? 0,
            totalDonationsCents: row.totalDonationsCents ?? 0,
          });
        }
      } catch (error) {
        console.warn('Unable to load donation stats for home page cards:', error);
      }
    }
  }

  const movieItems = mergeDonationStats(movieItemsRaw, statsByKey);
  const tvItems = mergeDonationStats(tvItemsRaw, statsByKey);
  const heroStripItems = buildNowTrendingItems(movieItems, tvItems);

  return (
    <div className="page-container">
      <div className="section-block relative z-20 mb-10 p-6 text-center sm:p-8 fade-up">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-2)]">
          Stories to impact
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-5xl">
          Watch what moves you.
          <br />
          Give where it matters.
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-base text-[var(--text-muted)] sm:text-lg">
          Turn the story you just watched into measurable real-world impact in under a minute.
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
          <span className="chip inline-flex items-center gap-1.5 px-3 py-1.5">
            <Film className="h-4 w-4 text-[var(--accent-2)]" />
            Discover
          </span>
          <span>→</span>
          <span className="chip inline-flex items-center gap-1.5 px-3 py-1.5">
            <Heart className="h-4 w-4 text-[var(--danger)]" />
            Donate
          </span>
          <span>→</span>
          <span className="chip inline-flex items-center gap-1.5 px-3 py-1.5">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            Track impact
          </span>
        </div>

        <div className="mt-4">
          <Link href="/how-it-works" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent-2)] hover:text-[var(--text-strong)]">
            See how it works
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mx-auto mt-5 max-w-xl">
          <SearchBar mode="hero" />
        </div>

        <NowTrendingCarousel items={heroStripItems} />
      </div>

      <MediaCarousel
        items={movieItems}
        title="Trending Movies"
        emptyMessage="No trending movies found."
        autoplayIntervalMs={4000}
        autoplayDirection="forward"
      />

      <MediaCarousel
        items={tvItems}
        title="Trending TV Shows"
        emptyMessage="No trending TV shows found."
        autoplayIntervalMs={4000}
        autoplayDirection="backward"
      />
    </div>
  );
}
