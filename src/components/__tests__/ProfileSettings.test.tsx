import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileSettings } from '../ProfileSettings';

const mocks = vi.hoisted(() => {
  const signOutMock = vi.fn().mockResolvedValue({ error: null });
  const resetPasswordForEmailMock = vi.fn().mockResolvedValue({ error: null });
  const createClientMock = vi.fn(() => ({
    auth: {
      signOut: signOutMock,
      resetPasswordForEmail: resetPasswordForEmailMock,
    },
  }));

  return { signOutMock, resetPasswordForEmailMock, createClientMock };
});

vi.mock('@/lib/supabase/client', () => ({
  createClient: mocks.createClientMock,
}));

describe('ProfileSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
    );
  });

  it('renders delete account action', () => {
    render(<ProfileSettings initialDisplayName="Luka" initialIsPublic={true} accountEmail="person@example.com" />);

    expect(screen.getByRole('heading', { name: /delete account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
  });

  it('calls DELETE /api/profile when confirmed', async () => {
    const user = userEvent.setup();

    render(<ProfileSettings initialDisplayName="Luka" initialIsPublic={true} accountEmail="person@example.com" />);

    await user.type(screen.getByLabelText(/type delete to confirm/i), 'DELETE');
    await user.click(screen.getByRole('button', { name: /delete account/i }));

    expect(fetch).toHaveBeenCalledWith('/api/profile', expect.objectContaining({ method: 'DELETE' }));
    await waitFor(() => {
      expect(mocks.signOutMock).toHaveBeenCalledTimes(1);
    });
  });

  it('requests password reset email from settings', async () => {
    const user = userEvent.setup();
    render(<ProfileSettings initialDisplayName="Luka" initialIsPublic={true} accountEmail="person@example.com" />);

    await user.click(screen.getByRole('button', { name: /send password reset email/i }));

    expect(mocks.resetPasswordForEmailMock).toHaveBeenCalledWith(
      'person@example.com',
      expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/callback?next=%2Fauth%2Fupdate-password'),
      })
    );
    expect(await screen.findByText(/if your email is eligible, we sent a reset link/i)).toBeInTheDocument();
  });

  it('renders empty display name input when initialDisplayName is empty', () => {
    render(<ProfileSettings initialDisplayName="" initialIsPublic={false} accountEmail="person@example.com" />);

    expect(screen.getByRole('textbox', { name: /display name/i })).toHaveValue('');
  });
});
