import { beforeEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MediaCarousel } from '../MediaCarousel';
import type { MediaItem } from '@/types/media';

const emblaMocks = vi.hoisted(() => ({
  scrollPrev: vi.fn(),
  scrollNext: vi.fn(),
  scrollTo: vi.fn(),
  scrollSnapList: vi.fn(() => [0, 1, 2]),
  selectedScrollSnap: vi.fn(() => 0),
  slidesInView: vi.fn(() => [0, 1, 2, 3, 4]),
  on: vi.fn(),
  off: vi.fn(),
  canScrollPrev: vi.fn(() => true),
  canScrollNext: vi.fn(() => true),
}));

// Mock embla-carousel-react
vi.mock('embla-carousel-react', () => ({
  default: () => [
    vi.fn(),
    emblaMocks,
  ],
}));

describe('MediaCarousel', () => {
  const mockItems: MediaItem[] = [
    { id: 1, mediaType: 'movie', title: 'Movie 1', imageUrl: '/1.jpg', year: 2020, rating: 8.0, overview: 'test' },
    { id: 2, mediaType: 'movie', title: 'Movie 2', imageUrl: '/2.jpg', year: 2021, rating: 7.5, overview: 'test' },
    { id: 3, mediaType: 'movie', title: 'Movie 3', imageUrl: '/3.jpg', year: 2022, rating: 9.0, overview: 'test' },
  ];

  beforeEach(() => {
    vi.useRealTimers();
    emblaMocks.scrollPrev.mockClear();
    emblaMocks.scrollNext.mockClear();
    emblaMocks.scrollTo.mockClear();
    emblaMocks.scrollSnapList.mockClear();
    emblaMocks.selectedScrollSnap.mockClear();
    emblaMocks.slidesInView.mockClear();
    emblaMocks.on.mockClear();
    emblaMocks.off.mockClear();
    emblaMocks.canScrollPrev.mockImplementation(() => true);
    emblaMocks.canScrollNext.mockImplementation(() => true);
    emblaMocks.scrollSnapList.mockImplementation(() => [0, 1, 2]);
    emblaMocks.selectedScrollSnap.mockImplementation(() => 0);
    emblaMocks.slidesInView.mockImplementation(() => [0, 1, 2, 3, 4]);
    emblaMocks.on.mockImplementation((_event: string, callback: () => void) => {
      callback();
      return emblaMocks;
    });
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(min-width: 640px)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders all items', () => {
    render(<MediaCarousel items={mockItems} title="Test Carousel" />);
    expect(screen.getByText('Movie 1')).toBeDefined();
    expect(screen.getByText('Movie 2')).toBeDefined();
    expect(screen.getByText('Movie 3')).toBeDefined();
  });

  it('renders the title', () => {
    render(<MediaCarousel items={mockItems} title="Trending Movies" />);
    expect(screen.getByText('Trending Movies')).toBeDefined();
  });

  it('renders empty state when no items', () => {
    render(<MediaCarousel items={[]} title="Empty" />);
    expect(screen.getByText(/no results/i)).toBeDefined();
  });

  it('renders custom empty message', () => {
    render(<MediaCarousel items={[]} title="Empty" emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeDefined();
  });

  it('renders navigation arrows', () => {
    render(<MediaCarousel items={mockItems} title="Test" />);
    expect(screen.getByRole('button', { name: /previous/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /next/i })).toBeDefined();
  });

  it('passes showBadge to MediaCard when showBadges is true', () => {
    const mixedItems: MediaItem[] = [
      { id: 1, mediaType: 'movie', title: 'Movie 1', imageUrl: '/1.jpg', year: 2020, rating: 8.0, overview: 'test' },
      { id: 2, mediaType: 'tv', title: 'TV Show 1', imageUrl: '/2.jpg', year: 2021, rating: 7.5, overview: 'test' },
    ];
    render(<MediaCarousel items={mixedItems} title="Mixed" showBadges />);
    expect(screen.getByText('Movie')).toBeDefined();
    expect(screen.getByText('TV')).toBeDefined();
  });

  it('auto-advances every 7 seconds', () => {
    vi.useFakeTimers();
    render(<MediaCarousel items={mockItems} title="Autoplay" />);

    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(emblaMocks.scrollNext).toHaveBeenCalledTimes(1);
  });

  it('loops back to start when it reaches the end', () => {
    vi.useFakeTimers();
    emblaMocks.canScrollNext.mockImplementation(() => false);
    render(<MediaCarousel items={mockItems} title="Autoplay Loop" />);

    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(emblaMocks.scrollTo).toHaveBeenCalledWith(0);
  });

  it('auto-advances backward at custom interval', () => {
    vi.useFakeTimers();
    emblaMocks.canScrollPrev.mockImplementation(() => true);
    render(
      <MediaCarousel
        items={mockItems}
        title="Autoplay Reverse"
        autoplayIntervalMs={4000}
        autoplayDirection="backward"
      />
    );

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(emblaMocks.scrollPrev).toHaveBeenCalledTimes(1);
  });

  it('loops to the last slide when autoplaying backward from start', () => {
    vi.useFakeTimers();
    emblaMocks.canScrollPrev.mockImplementation(() => false);
    emblaMocks.scrollSnapList.mockImplementation(() => [0, 1, 2, 3]);
    render(
      <MediaCarousel
        items={mockItems}
        title="Autoplay Reverse Loop"
        autoplayIntervalMs={4000}
        autoplayDirection="backward"
      />
    );

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(emblaMocks.scrollTo).toHaveBeenCalledWith(3);
  });

  it('moves by all visible cards on desktop arrow click', () => {
    emblaMocks.selectedScrollSnap.mockImplementation(() => 1);
    emblaMocks.scrollSnapList.mockImplementation(() => Array.from({ length: 12 }, (_, i) => i));
    emblaMocks.slidesInView.mockImplementation(() => [0, 1, 2, 3, 4]);

    render(<MediaCarousel items={mockItems} title="Desktop Arrow Jump" />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(emblaMocks.scrollTo).toHaveBeenCalledWith(6);
  });

  it('keeps one-card movement on mobile arrow click', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<MediaCarousel items={mockItems} title="Mobile Arrow Step" />);
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(emblaMocks.scrollNext).toHaveBeenCalledTimes(1);
  });
});
