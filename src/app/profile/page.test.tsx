import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfilePage from './page';

const mocks = vi.hoisted(() => {
  const getUserMock = vi.fn();
  const profileLimitMock = vi.fn();
  const donationsOrderByMock = vi.fn();
  const insertReturningMock = vi.fn();
  const insertValuesMock = vi.fn(() => ({ returning: insertReturningMock }));

  const selectMock = vi
    .fn()
    .mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: profileLimitMock })),
      })),
    }))
    .mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({ orderBy: donationsOrderByMock })),
        })),
      })),
    }));

  return {
    getUserMock,
    profileLimitMock,
    donationsOrderByMock,
    selectMock,
    insertValuesMock,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mocks.getUserMock },
  })),
}));

vi.mock('@/db', () => ({
  db: {
    select: mocks.selectMock,
    insert: vi.fn(() => ({ values: mocks.insertValuesMock })),
  },
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserMock.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'person@example.com' } },
    });
    mocks.profileLimitMock.mockResolvedValue([
      { userId: 'user-1', displayName: null, isPublic: false, deletedAt: null },
    ]);
    mocks.donationsOrderByMock.mockResolvedValue([]);
  });

  it('shows donation history and links to advanced settings, without inline profile settings', async () => {
    render(await ProfilePage());

    expect(screen.getByRole('heading', { name: /donation history/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /advanced settings/i })).toHaveAttribute(
      'href',
      '/profile/advanced'
    );
    expect(screen.queryByRole('heading', { name: /profile settings/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /delete account/i })).not.toBeInTheDocument();
  });
});
