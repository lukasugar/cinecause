import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DonateButton } from '../DonateButton';

describe('DonateButton', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    vi.restoreAllMocks();
  });

  it('renders donate button', () => {
    render(
      <DonateButton
        tmdbId={550}
        mediaType="movie"
        title="Fight Club"
      />
    );
    expect(screen.getByRole('button', { name: /donate/i })).toBeInTheDocument();
  });

  it('renders helper text', () => {
    render(
      <DonateButton tmdbId={550} mediaType="movie" title="Fight Club" />
    );
    expect(screen.getByText(/powered by every\.org/i)).toBeInTheDocument();
  });

  it('requests donation link and opens returned URL', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://www.every.org/wwf?foo=bar' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const openMock = vi.fn();
    vi.stubGlobal('open', openMock);

    render(
      <DonateButton tmdbId={550} mediaType="movie" title="Fight Club" nonprofitSlug="red-cross" />
    );
    await user.click(screen.getByRole('button', { name: /donate/i }));

    expect(fetchMock).toHaveBeenCalledWith('/api/donations/create-link', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }));
    expect(openMock).toHaveBeenCalledWith(
      'https://www.every.org/wwf?foo=bar',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('works with tv media type payload', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://www.every.org/wwf?foo=bar' }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('open', vi.fn());

    render(<DonateButton tmdbId={1234} mediaType="tv" title="Breaking Bad" />);
    await user.click(screen.getByRole('button', { name: /donate/i }));

    expect(fetchMock).toHaveBeenCalled();
  });

  it('renders a custom label when provided', () => {
    render(<DonateButton tmdbId={550} mediaType="movie" title="Fight Club" label="Give now" />);
    expect(screen.getByRole('button', { name: /give now/i })).toBeInTheDocument();
  });
});
