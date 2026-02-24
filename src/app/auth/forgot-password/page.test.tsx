import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from './page';

const mocks = vi.hoisted(() => {
  const resetPasswordForEmailMock = vi.fn();
  const createClientMock = vi.fn(() => ({
    auth: { resetPasswordForEmail: resetPasswordForEmailMock },
  }));

  return { resetPasswordForEmailMock, createClientMock };
});

vi.mock('@/lib/supabase/client', () => ({ createClient: mocks.createClientMock }));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resetPasswordForEmailMock.mockResolvedValue({ error: null });
  });

  it('requests reset email with callback redirect and shows generic success copy', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText(/email/i), 'person@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(mocks.resetPasswordForEmailMock).toHaveBeenCalledWith(
      'person@example.com',
      expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/callback?next=%2Fauth%2Fupdate-password'),
      })
    );
    expect(await screen.findByText(/if an account exists for this email/i)).toBeInTheDocument();
  });

  it('still shows generic success copy when reset request returns an auth error', async () => {
    const user = userEvent.setup();
    mocks.resetPasswordForEmailMock.mockResolvedValue({ error: { message: 'User not found' } });

    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText(/email/i), 'missing@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(await screen.findByText(/if an account exists for this email/i)).toBeInTheDocument();
  });

  it('renders a back-to-sign-in link', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByRole('link', { name: /back to sign in/i })).toHaveAttribute('href', '/auth/sign-in');
  });
});
