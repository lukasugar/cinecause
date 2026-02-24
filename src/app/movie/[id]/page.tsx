import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMovieById } from '@/lib/tmdb';
import { tmdbMovieToMediaItem } from '@/lib/adapters';
import { DonationSection } from '@/components/DonationSection';
import { db } from '@/db';
import { media } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

function formatCents(cents: number | null): string {
  const dollars = (cents || 0) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

export async function generateMetadata({ params }: MoviePageProps) {
  const { id } = await params;
  try {
    const movie = await getMovieById(parseInt(id));
    return {
      title: `${movie.title} - CineCause`,
      description: movie.overview,
    };
  } catch {
    return {
      title: 'Movie Not Found - CineCause',
    };
  }
}

export const dynamic = 'force-dynamic';

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const tmdbId = parseInt(id);

  let movieDetail;
  try {
    movieDetail = await getMovieById(tmdbId);
  } catch {
    notFound();
  }

  const item = tmdbMovieToMediaItem(movieDetail);

  let mediaStats: typeof media.$inferSelect | undefined;
  if (process.env.DATABASE_URL) {
    [mediaStats] = await db
      .select()
      .from(media)
      .where(and(eq(media.tmdbId, tmdbId), eq(media.mediaType, 'movie')))
      .limit(1);
  }

  return (
    <div className="page-container">
      <Link
        href="/"
        className="mb-8 inline-flex items-center text-sm text-[var(--accent-2)] hover:text-[var(--text-strong)]"
      >
        &larr; Back to Home
      </Link>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div className="surface-card relative aspect-[2/3] overflow-hidden">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
              No Image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-semibold text-[var(--text-strong)]">
            {item.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-[var(--text-muted)]">
            {item.year && <span>{item.year}</span>}
            {item.rating && (
              <span className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                {item.rating.toFixed(1)}
              </span>
            )}
            {item.runtime && <span>{item.runtime} min</span>}
          </div>

          {item.genres && item.genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.genres.map((genre) => (
                <span
                  key={genre}
                  className="chip px-2 py-1 text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {item.tagline && (
            <p className="mt-4 italic text-[var(--text-muted)]">&quot;{item.tagline}&quot;</p>
          )}

          {mediaStats && mediaStats.donationCount && mediaStats.donationCount > 0 && (
            <div className="mt-4 rounded-lg border border-[var(--success)]/60 bg-[rgba(10,50,35,0.32)] p-4">
              <p className="font-medium text-[var(--success)]">
                This movie has inspired {formatCents(mediaStats.totalDonationsCents)} in donations
              </p>
              <p className="text-sm text-[var(--success)]">
                from {mediaStats.donationCount} generous donors
              </p>
            </div>
          )}

          <p className="mt-6 leading-relaxed text-[var(--text-muted)]">
            {item.overview}
          </p>

          {item.director && (
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              <span className="font-medium text-[var(--text-strong)]">Director:</span> {item.director}
            </p>
          )}

          {item.cast && item.cast.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-[var(--text-strong)]">Cast:</p>
              <div className="flex flex-wrap gap-2">
                {item.cast.map((actor) => (
                  <span
                    key={actor.name}
                    className="chip rounded px-2 py-1 text-sm"
                  >
                    {actor.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <DonationSection
            tmdbId={item.id}
            mediaType="movie"
            title={item.title}
          />
        </div>
      </div>
    </div>
  );
}
