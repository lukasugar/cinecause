import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { NowTrendingCarousel } from '../NowTrendingCarousel';
import type { MediaItem } from '@/types/media';

describe('NowTrendingCarousel', () => {
  const items: MediaItem[] = [
    {
      id: 550,
      mediaType: 'movie',
      title: 'Fight Club',
      imageUrl: '/fight-club.jpg',
      year: 1999,
      rating: 8.4,
      overview: 'Overview',
    },
    {
      id: 1399,
      mediaType: 'tv',
      title: 'Game of Thrones',
      imageUrl: '/got.jpg',
      year: 2011,
      rating: 9.2,
      overview: 'Overview',
    },
  ];

  it('keeps duplicate desktop-strip cards clickable', () => {
    const { container } = render(<NowTrendingCarousel items={items} />);

    const nonClickableLinks = container.querySelectorAll('a.pointer-events-none');
    expect(nonClickableLinks).toHaveLength(0);
  });
});
