import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTrendingTv, getTvById, searchTv } from '../tmdb';

describe('TMDB TV Functions', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.stubEnv('TMDB_API_KEY', 'test-api-key');
  });

  describe('getTrendingTv', () => {
    it('is exported and callable', () => {
      expect(typeof getTrendingTv).toBe('function');
    });
  });

  describe('getTvById', () => {
    it('is exported and callable', () => {
      expect(typeof getTvById).toBe('function');
    });
  });

  describe('searchTv', () => {
    it('is exported and callable', () => {
      expect(typeof searchTv).toBe('function');
    });
  });

  describe('fallback behavior without API key', () => {
    it('returns empty trending tv list', async () => {
      vi.stubEnv('TMDB_API_KEY', '');
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const shows = await getTrendingTv();
      expect(shows).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns empty tv search results', async () => {
      vi.stubEnv('TMDB_API_KEY', '');
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const shows = await searchTv('game');
      expect(shows).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns fallback tv detail', async () => {
      vi.stubEnv('TMDB_API_KEY', '');
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      const detail = await getTvById(1399);
      expect(detail.id).toBe(1399);
      expect(detail.name).toBe('Title unavailable');
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
