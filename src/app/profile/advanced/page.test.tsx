import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdvancedProfilePage from './page';

const captured = vi.hoisted(() => ({
  props: null as null | { initialDisplayName: string; initialIsPublic: boolean; accountEmail: string },
}));

const mocks = vi.hoisted(() => {
  const getUserMock = vi.fn();
  const profileLimitMock = vi.fn();
  const insertReturningMock = vi.fn();
  const insertValuesMock = vi.fn(() => ({ returning: insertReturningMock }));
  const selectMock = vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({ limit: profileLimitMock })),
    })),
  }));

  return { getUserMock, profileLimitMock, selectMock, insertValuesMock };
});

vi.mock('@/components/ProfileSettings', () => ({
  ProfileSettings: (props: { initialDisplayName: string; initialIsPublic: boolean; accountEmail: string }) => {
    captured.props = props;
    return <div>Profile Settings Stub</div>;
  },
}));

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

describe('AdvancedProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captured.props = null;
    mocks.getUserMock.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'person@example.com' } },
    });
    mocks.profileLimitMock.mockResolvedValue([
      { userId: 'user-1', displayName: null, isPublic: false, deletedAt: null },
    ]);
  });

  it('renders settings view and passes empty display name when profile displayName is null', async () => {
    render(await AdvancedProfilePage());

    expect(screen.getByRole('heading', { name: /advanced settings/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to profile/i })).toHaveAttribute('href', '/profile');
    expect(captured.props?.initialDisplayName).toBe('');
    expect(captured.props?.initialIsPublic).toBe(false);
    expect(captured.props?.accountEmail).toBe('person@example.com');
  });
});
