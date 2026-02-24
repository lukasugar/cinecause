import type { MediaItem, MediaCredit } from '@/types/media';
import type { TmdbMovie, TmdbTv, TmdbMovieDetail, TmdbTvDetail } from './schemas';
import { getTmdbImageUrl } from './tmdb';

function extractYear(dateString?: string): number | null {
  if (!dateString) return null;
  const year = parseInt(dateString.split('-')[0], 10);
  return isNaN(year) ? null : year;
}

function extractDirector(crew?: { name: string; job: string }[]): string | undefined {
  if (!crew) return undefined;
  const director = crew.find((c) => c.job === 'Director');
  return director?.name;
}

function extractCast(cast?: { name: string; character?: string; profile_path: string | null }[]): MediaCredit[] | undefined {
  if (!cast || cast.length === 0) return undefined;
  return cast.slice(0, 5).map((c) => ({
    name: c.name,
    role: c.character || 'Actor',
    imageUrl: c.profile_path ? getTmdbImageUrl(c.profile_path) ?? undefined : undefined,
  }));
}

export function tmdbMovieToMediaItem(movie: TmdbMovieDetail): MediaItem {
  return {
    id: movie.id,
    mediaType: 'movie',
    title: movie.title,
    imageUrl: getTmdbImageUrl(movie.poster_path),
    year: extractYear(movie.release_date),
    rating: movie.vote_average ?? null,
    overview: movie.overview,
    genres: movie.genres?.map((g) => g.name),
    runtime: movie.runtime ?? null,
    tagline: movie.tagline ?? undefined,
    director: extractDirector(movie.credits?.crew),
    cast: extractCast(movie.credits?.cast),
  };
}

export function tmdbTvToMediaItem(tv: TmdbTvDetail): MediaItem {
  return {
    id: tv.id,
    mediaType: 'tv',
    title: tv.name,
    imageUrl: getTmdbImageUrl(tv.poster_path),
    year: extractYear(tv.first_air_date),
    rating: tv.vote_average ?? null,
    overview: tv.overview,
    genres: tv.genres?.map((g) => g.name),
    runtime: tv.episode_run_time?.[0] ?? null,
    tagline: tv.tagline ?? undefined,
    director: tv.created_by?.[0]?.name ?? extractDirector(tv.credits?.crew),
    cast: extractCast(tv.credits?.cast),
  };
}

export function tmdbMovieListToMediaItems(movies: TmdbMovie[]): MediaItem[] {
  return movies.map((movie) => ({
    id: movie.id,
    mediaType: 'movie' as const,
    title: movie.title,
    imageUrl: getTmdbImageUrl(movie.poster_path),
    year: extractYear(movie.release_date),
    rating: movie.vote_average ?? null,
    overview: movie.overview,
  }));
}

export function tmdbTvListToMediaItems(tvShows: TmdbTv[]): MediaItem[] {
  return tvShows.map((tv) => ({
    id: tv.id,
    mediaType: 'tv' as const,
    title: tv.name,
    imageUrl: getTmdbImageUrl(tv.poster_path),
    year: extractYear(tv.first_air_date),
    rating: tv.vote_average ?? null,
    overview: tv.overview,
  }));
}
