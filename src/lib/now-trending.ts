import type { MediaItem } from '@/types/media';

export function buildNowTrendingItems(
  movieItems: MediaItem[],
  tvItems: MediaItem[],
  random: () => number = Math.random
): MediaItem[] {
  const merged = [...movieItems.slice(0, 5), ...tvItems.slice(0, 5)];

  for (let index = merged.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [merged[index], merged[randomIndex]] = [merged[randomIndex], merged[index]];
  }

  return merged;
}
