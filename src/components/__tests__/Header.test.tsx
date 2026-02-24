import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../Header';

const getUserMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: getUserMock,
    },
  })),
}));

vi.mock('@/app/auth/actions', () => ({
  signOut: vi.fn(),
}));

async function renderHeader() {
  render(await Header());
}

describe('Header', () => {
  it('renders site name', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    await renderHeader();
    expect(screen.getByText(/CineCause/)).toBeDefined();
  });

  it('renders navigation links', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    await renderHeader();
    expect(screen.getAllByRole('link', { name: /leaderboard/i }).length).toBeGreaterThan(0);
  });

  it('renders how it works link', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    await renderHeader();
    expect(screen.getAllByRole('link', { name: /how it works/i }).length).toBeGreaterThan(0);
  });

  it('renders sign in link for signed out user', async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    await renderHeader();
    expect(screen.getAllByRole('link', { name: /sign in/i }).length).toBeGreaterThan(0);
  });

  it('renders profile and sign out for signed in user', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    await renderHeader();
    expect(screen.getAllByRole('link', { name: /profile/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /sign out/i }).length).toBeGreaterThan(0);
  });
});
