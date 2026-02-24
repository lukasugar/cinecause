import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Leaderboard } from '../Leaderboard';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/leaderboard',
  useSearchParams: () => new URLSearchParams('view=all'),
}));

describe('Leaderboard', () => {
  const mockMedia = [
    {
      id: 1,
      tmdbId: 550,
      mediaType: 'movie',
      title: 'Fight Club',
      releaseYear: 1999,
      totalDonationsCents: 50000,
      donationCount: 10,
    },
    {
      id: 2,
      tmdbId: 157336,
      mediaType: 'movie',
      title: 'Interstellar',
      releaseYear: 2014,
      totalDonationsCents: 30000,
      donationCount: 5,
    },
  ];

  const recentMedia = [
    {
      id: 3,
      tmdbId: 13,
      mediaType: 'movie',
      title: 'Forrest Gump',
      releaseYear: 1994,
      totalDonationsCents: 25000,
      donationCount: 4,
    },
    {
      id: 4,
      tmdbId: 680,
      mediaType: 'movie',
      title: 'Pulp Fiction',
      releaseYear: 1994,
      totalDonationsCents: 12000,
      donationCount: 2,
    },
  ];

  function generateMockMedia(count: number) {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      tmdbId: 1000 + i,
      mediaType: 'movie' as const,
      title: `Movie ${i + 1}`,
      releaseYear: 2000 + (i % 25),
      totalDonationsCents: (count - i) * 1000,
      donationCount: count - i,
    }));
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all-time view labels by default', () => {
    render(<Leaderboard allTimeMedia={mockMedia} recentMedia={recentMedia} initialView="all" />);
    expect(screen.getByRole('button', { name: /all time/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/total donated/i)).toBeInTheDocument();
    expect(screen.getByText(/^donations$/i)).toBeInTheDocument();
  });

  it('renders recent labels when initialView is recent', () => {
    render(<Leaderboard allTimeMedia={mockMedia} recentMedia={recentMedia} initialView="recent" />);
    expect(screen.getByRole('button', { name: /last 30 days/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/total donated/i)).toBeInTheDocument();
    expect(screen.getByText(/^donations$/i)).toBeInTheDocument();
  });

  it('renders movie titles', () => {
    render(<Leaderboard allTimeMedia={mockMedia} recentMedia={recentMedia} initialView="all" />);
    expect(screen.getByText('Fight Club')).toBeInTheDocument();
    expect(screen.getByText('Interstellar')).toBeInTheDocument();
  });

  it('formats donation totals as currency', () => {
    render(<Leaderboard allTimeMedia={mockMedia} recentMedia={recentMedia} initialView="all" />);
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('$300.00')).toBeInTheDocument();
  });

  it('shows donation count', () => {
    render(<Leaderboard allTimeMedia={mockMedia} recentMedia={recentMedia} initialView="all" />);
    expect(screen.getByText(/10 donations/i)).toBeInTheDocument();
    expect(screen.getByText(/5 donations/i)).toBeInTheDocument();
  });

  it('renders empty state when no media', () => {
    render(<Leaderboard allTimeMedia={[]} recentMedia={[]} initialView="all" />);
    expect(screen.getByText(/no donations logged yet/i)).toBeInTheDocument();
  });

  it('does not show pagination controls when 50 or fewer items', () => {
    const media = generateMockMedia(50);
    render(<Leaderboard allTimeMedia={media} recentMedia={recentMedia} initialView="all" />);
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  it('shows pagination controls when more than 50 items', () => {
    const media = generateMockMedia(51);
    render(<Leaderboard allTimeMedia={media} recentMedia={recentMedia} initialView="all" />);
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();
  });

  it('disables Previous button on first page', () => {
    const media = generateMockMedia(51);
    render(<Leaderboard allTimeMedia={media} recentMedia={recentMedia} initialView="all" />);
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
  });

  it('navigates to next page when Next is clicked', async () => {
    const user = userEvent.setup();
    const media = generateMockMedia(51);
    render(<Leaderboard allTimeMedia={media} recentMedia={recentMedia} initialView="all" />);

    expect(screen.getByText('Movie 1')).toBeInTheDocument();
    expect(screen.queryByText('Movie 51')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.queryByText('Movie 1')).not.toBeInTheDocument();
    expect(screen.getByText('Movie 51')).toBeInTheDocument();
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();
  });

  it('disables Next button on last page', async () => {
    const user = userEvent.setup();
    const media = generateMockMedia(51);
    render(<Leaderboard allTimeMedia={media} recentMedia={recentMedia} initialView="all" />);

    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
  });

  it('shows correct ranks on second page', async () => {
    const user = userEvent.setup();
    const media = generateMockMedia(51);
    render(<Leaderboard allTimeMedia={media} recentMedia={recentMedia} initialView="all" />);

    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText('#51')).toBeInTheDocument();
  });

  it('switches to recent view, syncs URL, and resets to page 1', async () => {
    const user = userEvent.setup();
    const allTimeLarge = generateMockMedia(51);
    const recentSmall = [
      {
        id: 9001,
        tmdbId: 9001,
        mediaType: 'movie' as const,
        title: 'Recent One',
        releaseYear: 2025,
        totalDonationsCents: 8000,
        donationCount: 2,
      },
      {
        id: 9002,
        tmdbId: 9002,
        mediaType: 'movie' as const,
        title: 'Recent Two',
        releaseYear: 2025,
        totalDonationsCents: 5000,
        donationCount: 1,
      },
    ];

    render(<Leaderboard allTimeMedia={allTimeLarge} recentMedia={recentSmall} initialView="all" />);
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /last 30 days/i }));
    expect(screen.getByText('Recent One')).toBeInTheDocument();
    expect(screen.queryByText('Movie 51')).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith('/leaderboard?view=recent', { scroll: false });
  });
});
