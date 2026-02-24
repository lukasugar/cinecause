import { MediaCard } from './MediaCard';
import type { MediaItem } from '@/types/media';

interface MediaGridProps {
  items: MediaItem[];
  emptyMessage?: string;
  showBadges?: boolean;
}

export function MediaGrid({ items, emptyMessage = 'No results found.', showBadges = false }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="section-block py-12 text-center text-[var(--text-muted)]">
        <p className="text-lg font-medium text-[var(--text-strong)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="-m-2 grid grid-cols-2 gap-4 overflow-visible p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <MediaCard key={`${item.mediaType}-${item.id}`} item={item} showBadge={showBadges} />
      ))}
    </div>
  );
}
