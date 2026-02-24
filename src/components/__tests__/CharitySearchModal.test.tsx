import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharitySearchModal } from '../CharitySearchModal';

describe('CharitySearchModal', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('renders search input', () => {
    render(<CharitySearchModal onSelect={() => {}} onClose={() => {}} />);
    expect(screen.getByPlaceholderText(/search charities/i)).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<CharitySearchModal onSelect={() => {}} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<CharitySearchModal onSelect={() => {}} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /close/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it('searches and displays results', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        nonprofits: [
          { name: 'Red Cross', slug: 'red-cross', description: 'Disaster relief' },
        ],
      }),
    } as Response);

    render(<CharitySearchModal onSelect={() => {}} onClose={() => {}} />);

    await user.type(screen.getByPlaceholderText(/search charities/i), 'red');

    await waitFor(() => {
      expect(screen.getByText('Red Cross')).toBeInTheDocument();
    });
  });

  it('calls onSelect when charity is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        nonprofits: [
          { name: 'Red Cross', slug: 'red-cross', description: 'Disaster relief' },
        ],
      }),
    } as Response);

    render(<CharitySearchModal onSelect={onSelect} onClose={() => {}} />);

    await user.type(screen.getByPlaceholderText(/search charities/i), 'red');

    await waitFor(() => {
      expect(screen.getByText('Red Cross')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Red Cross'));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Red Cross',
      slug: 'red-cross',
    }));
  });
});
