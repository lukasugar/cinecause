import { describe, it, expect } from 'vitest';
import { everyOrgWebhookSchema, tmdbMovieSchema, tmdbTvSchema } from '../schemas';

describe('everyOrgWebhookSchema', () => {
  it('validates a complete webhook payload', () => {
    const payload = {
      chargeId: 'test-123',
      amount: '25.00',
      currency: 'USD',
      frequency: 'ONCE',
      donationDate: '2025-01-12T10:30:00Z',
      partnerMetadata: {
        tmdb_id: 550,
        media_type: 'movie',
        title: 'Fight Club',
      },
      toNonprofit: {
        slug: 'red-cross',
        name: 'American Red Cross',
      },
    };

    const result = everyOrgWebhookSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('validates a monthly donation payload', () => {
    const payload = {
      chargeId: 'test-456',
      amount: '10.00',
      currency: 'USD',
      frequency: 'MONTHLY',
      donationDate: '2025-01-12T10:30:00Z',
      partnerMetadata: {
        tmdb_id: 1399,
        media_type: 'tv',
        title: 'Game of Thrones',
      },
      toNonprofit: {
        slug: 'doctors-without-borders',
        name: 'Doctors Without Borders',
      },
    };

    const result = everyOrgWebhookSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rejects invalid media_type', () => {
    const payload = {
      chargeId: 'test-123',
      amount: '25.00',
      currency: 'USD',
      frequency: 'ONCE',
      donationDate: '2025-01-12T10:30:00Z',
      partnerMetadata: {
        tmdb_id: 550,
        media_type: 'podcast', // invalid
        title: 'Fight Club',
      },
      toNonprofit: {
        slug: 'red-cross',
        name: 'American Red Cross',
      },
    };

    const result = everyOrgWebhookSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe('tmdbMovieSchema', () => {
  it('validates TMDB movie response', () => {
    const movie = {
      id: 550,
      title: 'Fight Club',
      poster_path: '/poster.jpg',
      release_date: '1999-10-15',
      overview: 'A movie about...',
      vote_average: 8.4,
    };

    const result = tmdbMovieSchema.safeParse(movie);
    expect(result.success).toBe(true);
  });
});

describe('tmdbTvSchema', () => {
  it('validates TMDB TV show response', () => {
    const tvShow = {
      id: 1399,
      name: 'Game of Thrones',
      poster_path: '/poster.jpg',
      first_air_date: '2011-04-17',
      overview: 'A TV show about...',
      vote_average: 9.3,
    };

    const result = tmdbTvSchema.safeParse(tvShow);
    expect(result.success).toBe(true);
  });
});
