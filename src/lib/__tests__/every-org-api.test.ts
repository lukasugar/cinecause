import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchNonprofits } from '../every-org-api';

describe('searchNonprofits', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('EVERY_ORG_API_KEY', 'test-api-key');
    vi.stubEnv('EVERY_ORG_SEARCH_API_BASE_URL', '');
    vi.stubGlobal('fetch', vi.fn());
  });

  it('calls Every.org API with correct URL and params', async () => {
    const mockResponse = {
      nonprofits: [
        {
          name: 'Test Charity',
          primarySlug: 'test-charity',
          description: 'A test charity',
          logoUrl: 'https://example.com/logo.png',
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const result = await searchNonprofits('test');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://partners.every.org/v0.2/search/test')
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('apiKey=test-api-key')
    );
    expect(result).toEqual(mockResponse.nonprofits);
  });

  it('uses EVERY_ORG_SEARCH_API_BASE_URL when configured', async () => {
    const mockResponse = {
      nonprofits: [],
    };

    vi.stubEnv('EVERY_ORG_SEARCH_API_BASE_URL', 'https://partners-staging.every.org/');
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    await searchNonprofits('test');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://partners-staging.every.org/v0.2/search/test')
    );
  });

  it('returns empty array on error', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const result = await searchNonprofits('test');

    expect(result).toEqual([]);
  });
});
