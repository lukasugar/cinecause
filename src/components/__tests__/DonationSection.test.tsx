import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DonationSection } from '../DonationSection';

vi.stubGlobal('fetch', vi.fn());

describe('DonationSection', () => {
  const defaultProps = {
    tmdbId: 550,
    mediaType: 'movie' as const,
    title: 'Fight Club',
  };

  it('renders context line for movies', () => {
    render(<DonationSection {...defaultProps} />);
    expect(screen.getByText(/still thinking about this story/i)).toBeInTheDocument();
  });

  it('renders context line for TV shows', () => {
    render(<DonationSection {...defaultProps} mediaType="tv" />);
    expect(screen.getByText(/still thinking about this story/i)).toBeInTheDocument();
  });

  it('renders charity selector', () => {
    render(<DonationSection {...defaultProps} />);
    expect(screen.getByText(/donation destination/i)).toBeInTheDocument();
  });

  it('renders donate button', () => {
    render(<DonationSection {...defaultProps} />);
    expect(screen.getByRole('button', { name: /donate/i })).toBeInTheDocument();
  });
});
