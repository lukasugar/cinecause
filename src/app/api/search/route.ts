import { NextRequest, NextResponse } from 'next/server';
import { searchMovies, searchTv } from '@/lib/tmdb';
import { tmdbMovieListToMediaItems, tmdbTvListToMediaItems } from '@/lib/adapters';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'all';

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  let movieItems: ReturnType<typeof tmdbMovieListToMediaItems> = [];
  let tvItems: ReturnType<typeof tmdbTvListToMediaItems> = [];

  if (type === 'all' || type === 'movie') {
    const movies = await searchMovies(query);
    movieItems = tmdbMovieListToMediaItems(movies);
  }

  if (type === 'all' || type === 'tv') {
    const tvShows = await searchTv(query);
    tvItems = tmdbTvListToMediaItems(tvShows);
  }

  // Combine and sort by image priority, then rating, limit to 8 results
  const results = [...movieItems, ...tvItems]
    .sort((a, b) => {
      // Items with images come first
      const aHasImage = a.imageUrl !== null;
      const bHasImage = b.imageUrl !== null;
      if (aHasImage !== bHasImage) {
        return bHasImage ? 1 : -1;
      }
      // Then sort by rating
      return (b.rating || 0) - (a.rating || 0);
    })
    .slice(0, 8);

  return NextResponse.json({ results });
}
