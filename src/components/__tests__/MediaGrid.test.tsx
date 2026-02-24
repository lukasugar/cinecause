import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MediaGrid } from '../MediaGrid';
import type { MediaItem } from '@/types/media';

describe('MediaGrid', () => {
  const mockItems: MediaItem[] = [
    { id: 1, mediaType: 'movie', title: 'Movie 1', imageUrl: '/1.jpg', year: 2020, rating: 8.0, overview: 'test' },
    { id: 2, mediaType: 'tv', title: 'TV Show 1', imageUrl: '/2.jpg', year: 2021, rating: 7.5, overview: 'test' },
  ];

  it('renders all items', () => {
    render(<MediaGrid items={mockItems} />);
    expect(screen.getByText('Movie 1')).toBeDefined();
    expect(screen.getByText('TV Show 1')).toBeDefined();
  });

  it('renders empty state when no items', () => {
    render(<MediaGrid items={[]} />);
    expect(screen.getByText(/no results/i)).toBeDefined();
  });

  it('renders custom empty message', () => {
    render(<MediaGrid items={[]} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeDefined();
  });

  it('passes showBadge to MediaCard', () => {
    render(<MediaGrid items={mockItems} showBadges />);
    expect(screen.getByText('Movie')).toBeDefined();
    expect(screen.getByText('TV')).toBeDefined();
  });
});
