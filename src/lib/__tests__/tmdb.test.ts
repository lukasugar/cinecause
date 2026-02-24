import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTrendingMovies, getMovieById, searchMovies, getTmdbImageUrl } from '../tmdb';

describe('TMDB Client', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.stubEnv('TMDB_API_KEY', 'test-api-key');
  });

  describe('getTmdbImageUrl', () => {
    it('returns full URL for poster path', () => {
      const url = getTmdbImageUrl('/abc123.jpg');
      expect(url).toBe('https://image.tmdb.org/t/p/w500/abc123.jpg');
    });

    it('returns placeholder for null poster path', () => {
      const url = getTmdbImageUrl(null);
      expect(url).toBeNull();
    });
  });

  describe('fallback behavior without API key', () => {
    it('returns empty trending movies list', async () => {
      vi.stubEnv('TMDB_API_KEY', '');
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const movies = await getTrendingMovies();
      expect(movies).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns empty search results', async () => {
      vi.stubEnv('TMDB_API_KEY', '');
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const results = await searchMovies('fight');
      expect(results).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns fallback movie details', async () => {
      vi.stubEnv('TMDB_API_KEY', '');
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const detail = await getMovieById(550);
      expect(detail.id).toBe(550);
      expect(detail.title).toBe('Title unavailable');
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
