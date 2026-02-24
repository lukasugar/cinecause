import {
  tmdbMovieListSchema,
  tmdbMovieDetailSchema,
  tmdbTvListSchema,
  tmdbTvDetailSchema,
  type TmdbMovie,
  type TmdbTv,
  type TmdbMovieDetail,
  type TmdbTvDetail,
} from './schemas';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function getApiKey(): string | null {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    return null;
  }
  return key;
}

function fallbackMovieDetail(id: number): TmdbMovieDetail {
  return {
    id,
    title: 'Title unavailable',
    poster_path: null,
    release_date: '',
    overview: 'Movie details are unavailable right now. Add TMDB_API_KEY to load live data.',
    vote_average: 0,
    genre_ids: [],
    genres: [],
    runtime: null,
    tagline: null,
    credits: {
      cast: [],
      crew: [],
    },
  };
}

function fallbackTvDetail(id: number): TmdbTvDetail {
  return {
    id,
    name: 'Title unavailable',
    poster_path: null,
    first_air_date: '',
    overview: 'Show details are unavailable right now. Add TMDB_API_KEY to load live data.',
    vote_average: 0,
    genre_ids: [],
    genres: [],
    episode_run_time: [],
    tagline: null,
    created_by: [],
    credits: {
      cast: [],
      crew: [],
    },
  };
}

export function getTmdbImageUrl(posterPath: string | null): string | null {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE}${posterPath}`;
}

export async function getTrendingMovies(): Promise<TmdbMovie[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const response = await fetch(
    `${TMDB_BASE_URL}/trending/movie/week?api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  const parsed = tmdbMovieListSchema.safeParse(data);

  if (!parsed.success) {
    console.error('TMDB response validation failed:', parsed.error);
    throw new Error('Invalid TMDB response');
  }

  return parsed.data.results;
}

export async function getMovieById(id: number): Promise<TmdbMovieDetail> {
  const apiKey = getApiKey();
  if (!apiKey) return fallbackMovieDetail(id);

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${id}?api_key=${apiKey}&append_to_response=credits`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  const parsed = tmdbMovieDetailSchema.safeParse(data);

  if (!parsed.success) {
    console.error('TMDB response validation failed:', parsed.error);
    throw new Error('Invalid TMDB response');
  }

  return parsed.data;
}

export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  const parsed = tmdbMovieListSchema.safeParse(data);

  if (!parsed.success) {
    console.error('TMDB response validation failed:', parsed.error);
    throw new Error('Invalid TMDB response');
  }

  return parsed.data.results;
}

export async function getTrendingTv(): Promise<TmdbTv[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const response = await fetch(
    `${TMDB_BASE_URL}/trending/tv/week?api_key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  const parsed = tmdbTvListSchema.safeParse(data);

  if (!parsed.success) {
    console.error('TMDB response validation failed:', parsed.error);
    throw new Error('Invalid TMDB response');
  }

  return parsed.data.results;
}

export async function getTvById(id: number): Promise<TmdbTvDetail> {
  const apiKey = getApiKey();
  if (!apiKey) return fallbackTvDetail(id);

  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${id}?api_key=${apiKey}&append_to_response=credits`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  const parsed = tmdbTvDetailSchema.safeParse(data);

  if (!parsed.success) {
    console.error('TMDB response validation failed:', parsed.error);
    throw new Error('Invalid TMDB response');
  }

  return parsed.data;
}

export async function searchTv(query: string): Promise<TmdbTv[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const response = await fetch(
    `${TMDB_BASE_URL}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();
  const parsed = tmdbTvListSchema.safeParse(data);

  if (!parsed.success) {
    console.error('TMDB response validation failed:', parsed.error);
    throw new Error('Invalid TMDB response');
  }

  return parsed.data.results;
}
