import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LeaderboardPage from './page';

const mocks = vi.hoisted(() => {
  const allTimeOrderByMock = vi.fn();
  const recentOrderByMock = vi.fn();
  const recentDonationsLimitMock = vi.fn();
  const leaderboardPropsMock = vi.fn();
  const recentDonationsPropsMock = vi.fn();
  const selectMock = vi.fn();

  return {
    allTimeOrderByMock,
    recentOrderByMock,
    recentDonationsLimitMock,
    leaderboardPropsMock,
    recentDonationsPropsMock,
    selectMock,
  };
});

vi.mock('@/db', () => ({
  db: {
    select: mocks.selectMock,
  },
}));

vi.mock('@/components/Leaderboard', () => ({
  Leaderboard: (props: unknown) => {
    mocks.leaderboardPropsMock(props);
    return <div data-testid="leaderboard" />;
  },
}));

vi.mock('@/components/RecentDonations', () => ({
  RecentDonations: (props: unknown) => {
    mocks.recentDonationsPropsMock(props);
    return <div data-testid="recent-donations" />;
  },
}));

function mockAllTimeSelect() {
  return {
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        orderBy: mocks.allTimeOrderByMock,
      })),
    })),
  };
}

function mockRecentMediaSelect() {
  return {
    from: vi.fn(() => ({
      innerJoin: vi.fn(() => ({
        where: vi.fn(() => ({
          groupBy: vi.fn(() => ({
            orderBy: mocks.recentOrderByMock,
          })),
        })),
      })),
    })),
  };
}

function mockRecentDonationsSelect() {
  return {
    from: vi.fn(() => ({
      leftJoin: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: mocks.recentDonationsLimitMock,
          })),
        })),
      })),
    })),
  };
}

describe('LeaderboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = 'postgres://test';

    mocks.selectMock.mockReset();
    mocks.selectMock
      .mockImplementationOnce(mockAllTimeSelect)
      .mockImplementationOnce(mockRecentMediaSelect)
      .mockImplementationOnce(mockRecentDonationsSelect);

    mocks.allTimeOrderByMock.mockResolvedValue([
      {
        id: 1,
        tmdbId: 550,
        mediaType: 'movie',
        title: 'Fight Club',
        posterPath: null,
        releaseYear: 1999,
        totalDonationsCents: 50000,
        donationCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    mocks.recentOrderByMock.mockResolvedValue([
      {
        id: 2,
        tmdbId: 13,
        mediaType: 'movie',
        title: 'Forrest Gump',
        posterPath: null,
        releaseYear: 1994,
        totalDonationsCents: 12000,
        donationCount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    mocks.recentDonationsLimitMock.mockResolvedValue([]);
  });

  it('defaults to all-time view when view param is missing', async () => {
    render(await LeaderboardPage({ searchParams: Promise.resolve({}) }));

    expect(mocks.leaderboardPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        initialView: 'all',
      })
    );
    expect(screen.getByTestId('recent-donations')).toBeInTheDocument();
  });

  it('uses recent view when query param is recent', async () => {
    render(await LeaderboardPage({ searchParams: Promise.resolve({ view: 'recent' }) }));

    expect(mocks.leaderboardPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({ initialView: 'recent' })
    );
  });

  it('falls back to all-time for invalid view query param', async () => {
    render(await LeaderboardPage({ searchParams: Promise.resolve({ view: 'invalid' }) }));

    expect(mocks.leaderboardPropsMock).toHaveBeenCalledWith(
      expect.objectContaining({ initialView: 'all' })
    );
  });
});
