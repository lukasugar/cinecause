import { searchMovies, searchTv } from '@/lib/tmdb';
import { tmdbMovieListToMediaItems, tmdbTvListToMediaItems } from '@/lib/adapters';
import { MediaGrid } from '@/components/MediaGrid';
import { SearchFilterClient } from '@/components/SearchFilterClient';
import { SearchBar } from '@/components/SearchBar';
import type { MediaFilter } from '@/components/SearchFilter';
import type { MediaItem } from '@/types/media';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; filter?: MediaFilter }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q} - CineCause` : 'Search - CineCause',
  };
}

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, filter = 'all' } = await searchParams;
  const query = q || '';

  let items: MediaItem[] = [];

  if (query) {
    const shouldSearchMovies = filter === 'all' || filter === 'movie';
    const shouldSearchTv = filter === 'all' || filter === 'tv';

    const [movies, tvShows] = await Promise.all([
      shouldSearchMovies ? searchMovies(query) : Promise.resolve([]),
      shouldSearchTv ? searchTv(query) : Promise.resolve([]),
    ]);

    const movieItems = tmdbMovieListToMediaItems(movies);
    const tvItems = tmdbTvListToMediaItems(tvShows);

    // Interleave results for "all" filter, otherwise just use the filtered type
    if (filter === 'all') {
      // Sort by image priority, then rating to show best results first
      items = [...movieItems, ...tvItems].sort((a, b) => {
        // Items with images come first
        const aHasImage = a.imageUrl !== null;
        const bHasImage = b.imageUrl !== null;
        if (aHasImage !== bHasImage) {
          return bHasImage ? 1 : -1;
        }
        // Then sort by rating
        return (b.rating || 0) - (a.rating || 0);
      });
    } else if (filter === 'movie') {
      items = movieItems;
    } else {
      items = tvItems;
    }
  }

  return (
    <div className="page-container">
      <div className="fade-up">
        <h1 className="mb-4 text-4xl font-semibold text-[var(--text-strong)]">
          {query ? `Search results for "${query}"` : 'Search'}
        </h1>
        <p className="mb-6 text-[var(--text-muted)]">
          Start with a title, actor, or keyword.
        </p>

        <form action="/search" method="GET" className="mb-5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search for movies and TV shows..."
              className="input-modern flex-1 px-4 py-2"
            />
            <input type="hidden" name="filter" value={filter} />
            <button
              type="submit"
              className="btn-primary px-6 py-2"
            >
              Search
            </button>
          </div>
        </form>

        <div className="mb-6">
          <SearchBar mode="page" />
        </div>

        <div className="mb-6">
          <SearchFilterClient currentFilter={filter} query={query} />
        </div>

        {query ? (
          <MediaGrid
            items={items}
            emptyMessage={`No matches for "${query}". Try a broader search.`}
            showBadges={filter === 'all'}
          />
        ) : (
          <p className="text-[var(--text-muted)]">Start with a title, actor, or keyword.</p>
        )}
      </div>
    </div>
  );
}
