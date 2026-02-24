import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

const mocks = vi.hoisted(() => {
  const getTrendingMoviesMock = vi.fn();
  const getTrendingTvMock = vi.fn();
  const movieAdapterMock = vi.fn();
  const tvAdapterMock = vi.fn();
  const mediaCarouselPropsMock = vi.fn();

  return {
    getTrendingMoviesMock,
    getTrendingTvMock,
    movieAdapterMock,
    tvAdapterMock,
    mediaCarouselPropsMock,
  };
});

vi.mock('@/lib/tmdb', () => ({
  getTrendingMovies: mocks.getTrendingMoviesMock,
  getTrendingTv: mocks.getTrendingTvMock,
}));

vi.mock('@/lib/adapters', () => ({
  tmdbMovieListToMediaItems: mocks.movieAdapterMock,
  tmdbTvListToMediaItems: mocks.tvAdapterMock,
}));

vi.mock('@/components/SearchBar', () => ({
  SearchBar: () => <div>Search Bar</div>,
}));

vi.mock('@/components/MediaCarousel', () => ({
  MediaCarousel: (props: { title: string; autoplayIntervalMs?: number; autoplayDirection?: string }) => {
    mocks.mediaCarouselPropsMock(props);
    return <section>{props.title}</section>;
  },
}));

vi.mock('@/components/NowTrendingCarousel', () => ({
  NowTrendingCarousel: () => <section>Now Trending</section>,
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getTrendingMoviesMock.mockResolvedValue([]);
    mocks.getTrendingTvMock.mockResolvedValue([]);
    mocks.movieAdapterMock.mockReturnValue([]);
    mocks.tvAdapterMock.mockReturnValue([]);
  });

  it('keeps the hero section above later content for search overlay visibility', async () => {
    render(await HomePage());

    const heading = screen.getByRole('heading', { name: /watch what moves you/i });
    const heroSection = heading.closest('div');

    expect(heroSection).toHaveClass('relative');
    expect(heroSection).toHaveClass('z-20');
  });

  it('does not render a browse all link above now trending', async () => {
    render(await HomePage());
    expect(screen.queryByRole('link', { name: /browse all/i })).not.toBeInTheDocument();
  });

  it('sets 4-second opposite autoplay directions for movie and TV carousels', async () => {
    render(await HomePage());

    const carouselProps = mocks.mediaCarouselPropsMock.mock.calls.map(([props]) => props);
    const moviesCarousel = carouselProps.find((props) => props.title === 'Trending Movies');
    const tvCarousel = carouselProps.find((props) => props.title === 'Trending TV Shows');

    expect(moviesCarousel).toMatchObject({
      autoplayIntervalMs: 4000,
      autoplayDirection: 'forward',
    });
    expect(tvCarousel).toMatchObject({
      autoplayIntervalMs: 4000,
      autoplayDirection: 'backward',
    });
  });
});
