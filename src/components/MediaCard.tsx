import Image from 'next/image';
import Link from 'next/link';
import type { MediaItem } from '@/types/media';
import { cardDensityClassMap, type CardDensity } from '@/types/ui';

interface MediaCardProps {
  item: MediaItem;
  showBadge?: boolean;
  density?: CardDensity;
}

export const ZERO_DONATION_FALLBACKS = [
  'Be first to spark impact',
  'No impact yet. Start the wave',
  'This story needs its first donor',
  'Set the first giving milestone',
  'Open this title\'s impact story',
  'No donations yet. Lead the way',
  'Start the first ripple of good',
  'Be the first to turn this into impact',
  'No giving momentum yet. Kick it off',
  'Launch the first donation',
] as const;

function formatDollars(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function getStableFallbackCopy(item: MediaItem): string {
  const seed = `${item.mediaType}-${item.id}-${item.title}`;
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) % 2147483647;
  }

  return ZERO_DONATION_FALLBACKS[hash % ZERO_DONATION_FALLBACKS.length];
}

export function MediaCard({ item, showBadge = false, density = 'standard' }: MediaCardProps) {
  const mediaTypeLabel = item.mediaType === 'movie' ? 'Movie' : 'TV';
  const formattedRating =
    typeof item.rating === 'number'
      ? Math.max(0, Math.min(10, item.rating)).toFixed(1)
      : null;
  const donationCount = Math.max(0, item.donationCount ?? 0);
  const totalDonationsCents = Math.max(0, item.totalDonationsCents ?? 0);
  const compactSubline =
    donationCount > 0
      ? `${donationCount} donation${donationCount === 1 ? '' : 's'} • ${formatDollars(totalDonationsCents)} raised`
      : getStableFallbackCopy(item);

  return (
    <Link
      href={`/${item.mediaType}/${item.id}`}
      className="surface-card group block overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(9,17,35,0.45)]"
    >
      <div className="relative aspect-[2/3] bg-[var(--surface-2)]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
            No Image
          </div>
        )}
        {showBadge && (
          <span className="absolute left-2 top-2 rounded-full border border-[var(--border-soft)] bg-[rgba(5,10,22,0.7)] px-2 py-1 text-xs font-medium text-[var(--text-strong)]">
            {mediaTypeLabel}
          </span>
        )}
        {density === 'compact' && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[rgba(4,12,26,0.86)] to-transparent" />
            {item.year && (
              <span className="absolute left-2 top-2 rounded-full border border-[var(--border-soft)] bg-[rgba(5,10,22,0.72)] px-2 py-1 text-[11px] font-semibold text-[var(--text-strong)]">
                {item.year}
              </span>
            )}
            {formattedRating && (
              <span className="absolute right-2 top-2 rounded-full border border-[var(--border-soft)] bg-[rgba(5,10,22,0.72)] px-2 py-1 text-[11px] font-semibold text-[var(--text-strong)]">
                ★ {formattedRating}
              </span>
            )}
          </>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-1 text-base font-semibold text-[var(--text-strong)] group-hover:text-[var(--accent-2)]">
          {item.title}
        </h3>
        <div className={cardDensityClassMap[density]}>
          {density === 'standard' ? (
            <>
              {item.year && <span>{item.year}</span>}
              {formattedRating && (
                <>
                  <span>•</span>
                  <span>{formattedRating}</span>
                </>
              )}
            </>
          ) : (
            <span>{compactSubline}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
