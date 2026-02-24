import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MediaCard, ZERO_DONATION_FALLBACKS } from '../MediaCard';
import type { MediaItem } from '@/types/media';

describe('MediaCard', () => {
  const mockMovie: MediaItem = {
    id: 550,
    mediaType: 'movie',
    title: 'Fight Club',
    imageUrl: 'https://image.tmdb.org/t/p/w500/poster.jpg',
    year: 1999,
    rating: 8.4,
    overview: 'A movie about...',
  };

  const mockTv: MediaItem = {
    id: 1399,
    mediaType: 'tv',
    title: 'Game of Thrones',
    imageUrl: 'https://image.tmdb.org/t/p/w500/got.jpg',
    year: 2011,
    rating: 8.4,
    overview: 'A TV show about...',
  };

  it('renders movie title', () => {
    render(<MediaCard item={mockMovie} />);
    expect(screen.getByText('Fight Club')).toBeDefined();
  });

  it('renders year', () => {
    render(<MediaCard item={mockMovie} />);
    expect(screen.getByText('1999')).toBeDefined();
  });

  it('renders rating', () => {
    render(<MediaCard item={mockMovie} />);
    expect(screen.getByText('8.4')).toBeDefined();
  });

  it('links to movie detail page for movies', () => {
    render(<MediaCard item={mockMovie} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/movie/550');
  });

  it('links to TV detail page for TV shows', () => {
    render(<MediaCard item={mockTv} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/tv/1399');
  });

  it('shows badge when showBadge is true', () => {
    render(<MediaCard item={mockMovie} showBadge />);
    expect(screen.getByText('Movie')).toBeDefined();
  });

  it('shows TV badge for TV shows', () => {
    render(<MediaCard item={mockTv} showBadge />);
    expect(screen.getByText('TV')).toBeDefined();
  });

  it('renders compact metadata in compact density mode', () => {
    render(
      <MediaCard
        item={{
          ...mockMovie,
          donationCount: 3,
          totalDonationsCents: 12450,
        }}
        density="compact"
      />
    );
    expect(screen.getAllByText('1999').length).toBeGreaterThan(0);
    expect(screen.getAllByText('★ 8.4').length).toBeGreaterThan(0);
    expect(screen.getByText('3 donations • $124.50 raised')).toBeDefined();
  });

  it('renders deterministic fallback copy when there are no donations', () => {
    render(
      <MediaCard
        density="compact"
        item={{
          ...mockMovie,
          donationCount: 0,
          totalDonationsCents: 0,
        }}
      />
    );

    const fallbackMatch = ZERO_DONATION_FALLBACKS.find((copy) => screen.queryByText(copy));
    expect(fallbackMatch).toBeDefined();
  });
});
