import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DonationSuccessPage from './page';

const getUserMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: getUserMock,
    },
  })),
}));

describe('DonationSuccessPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows gratitude-focused success copy for all users', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    render(await DonationSuccessPage());

    expect(
      screen.getByRole('heading', { name: /thank you for creating real-world impact!/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /your donation was securely processed by every\.org and added to this title's impact on cinecause\./i
      )
    ).toBeInTheDocument();
  });

  it('shows a profile impact link when the user is signed in', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });

    render(await DonationSuccessPage());

    expect(screen.getByRole('link', { name: /see your impact/i })).toHaveAttribute(
      'href',
      '/profile'
    );
  });

  it('does not show a profile impact link when the user is signed out', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    render(await DonationSuccessPage());

    expect(screen.queryByRole('link', { name: /see your impact/i })).not.toBeInTheDocument();
  });
});
