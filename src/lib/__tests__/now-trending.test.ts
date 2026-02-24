import { describe, expect, it } from 'vitest';
import type { MediaItem } from '@/types/media';
import { buildNowTrendingItems } from '../now-trending';

function createItem(id: number, mediaType: 'movie' | 'tv'): MediaItem {
  return {
    id,
    mediaType,
    title: `${mediaType}-${id}`,
    imageUrl: `/image-${id}.jpg`,
    year: 2025,
    rating: 7.5,
    overview: 'test',
  };
}

describe('buildNowTrendingItems', () => {
  it('returns top 5 movies and top 5 TV shows', () => {
    const movies = Array.from({ length: 8 }, (_, index) => createItem(index + 1, 'movie'));
    const tvShows = Array.from({ length: 8 }, (_, index) => createItem(index + 101, 'tv'));

    const result = buildNowTrendingItems(movies, tvShows, () => 0.5);

    expect(result).toHaveLength(10);
    expect(result.filter((item) => item.mediaType === 'movie')).toHaveLength(5);
    expect(result.filter((item) => item.mediaType === 'tv')).toHaveLength(5);
    expect(result.some((item) => item.id === 6)).toBe(false);
    expect(result.some((item) => item.id === 106)).toBe(false);
  });

  it('shuffles the merged list using the provided random function', () => {
    const movies = Array.from({ length: 5 }, (_, index) => createItem(index + 1, 'movie'));
    const tvShows = Array.from({ length: 5 }, (_, index) => createItem(index + 101, 'tv'));

    const result = buildNowTrendingItems(movies, tvShows, () => 0);
    const unshuffled = [...movies, ...tvShows];

    expect(result.map((item) => `${item.mediaType}-${item.id}`)).not.toEqual(
      unshuffled.map((item) => `${item.mediaType}-${item.id}`)
    );
  });
});
