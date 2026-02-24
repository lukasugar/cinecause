import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateDonateUrl } from '../every-org';

describe('generateDonateUrl', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    vi.stubEnv('NEXT_PUBLIC_EVERY_ORG_WEBHOOK_TOKEN', 'test-token');
  });

  it('generates URL with encoded partner_metadata', () => {
    const url = generateDonateUrl({
      tmdbId: 550,
      mediaType: 'movie',
      title: 'Fight Club',
    });

    expect(url).toContain('every.org');
    expect(url).toContain('partner_metadata=');
    expect(url).toContain('success_url=');
  });

  it('includes movie data in base64 encoded metadata', () => {
    const url = generateDonateUrl({
      tmdbId: 550,
      mediaType: 'movie',
      title: 'Fight Club',
    });

    // Extract partner_metadata param
    const urlObj = new URL(url);
    const metadata = urlObj.searchParams.get('partner_metadata');
    expect(metadata).toBeTruthy();

    // Decode and verify
    const decoded = JSON.parse(atob(metadata!));
    expect(decoded.tmdb_id).toBe(550);
    expect(decoded.media_type).toBe('movie');
    expect(decoded.title).toBe('Fight Club');
  });

  it('includes webhook_token when env var is set', () => {
    const url = generateDonateUrl({
      tmdbId: 550,
      mediaType: 'movie',
      title: 'Fight Club',
    });

    const urlObj = new URL(url);
    expect(urlObj.searchParams.get('webhook_token')).toBe('test-token');
  });

  it('uses provided nonprofit slug when given', () => {
    const url = generateDonateUrl({
      tmdbId: 550,
      mediaType: 'movie',
      title: 'Fight Club',
      nonprofitSlug: 'doctors-without-borders',
    });

    expect(url).toContain('every.org/doctors-without-borders');
  });

  it('falls back to default nonprofit slug when not provided', () => {
    const url = generateDonateUrl({
      tmdbId: 550,
      mediaType: 'movie',
      title: 'Fight Club',
    });

    expect(url).toContain('every.org/wwf');
  });

  it('includes partner_donation_id when provided', () => {
    const url = generateDonateUrl({
      tmdbId: 550,
      mediaType: 'movie',
      title: 'Fight Club',
      partnerDonationId: 'intent-123',
    });

    const urlObj = new URL(url);
    expect(urlObj.searchParams.get('partner_donation_id')).toBe('intent-123');
  });
});
