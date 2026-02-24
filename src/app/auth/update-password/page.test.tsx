import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UpdatePasswordPage from './page';

const mocks = vi.hoisted(() => {
  const updateUserMock = vi.fn();
  const pushMock = vi.fn();
  const refreshMock = vi.fn();
  const createClientMock = vi.fn(() => ({
    auth: { updateUser: updateUserMock },
  }));

  return { updateUserMock, pushMock, refreshMock, createClientMock };
});

vi.mock('@/lib/supabase/client', () => ({ createClient: mocks.createClientMock }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.pushMock,
    refresh: mocks.refreshMock,
  }),
}));

describe('UpdatePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateUserMock.mockResolvedValue({ error: null });
  });

  it('shows validation error and does not call updateUser for mismatched passwords', async () => {
    const user = userEvent.setup();
    render(<UpdatePasswordPage />);

    await user.type(screen.getByLabelText(/new password/i), 'new-password-123');
    await user.type(screen.getByLabelText(/confirm password/i), 'different-password-123');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mocks.updateUserMock).not.toHaveBeenCalled();
  });

  it('updates password and redirects to advanced settings on success', async () => {
    const user = userEvent.setup();
    render(<UpdatePasswordPage />);

    await user.type(screen.getByLabelText(/new password/i), 'new-password-123');
    await user.type(screen.getByLabelText(/confirm password/i), 'new-password-123');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(mocks.updateUserMock).toHaveBeenCalledWith({ password: 'new-password-123' });
    expect(mocks.pushMock).toHaveBeenCalledWith('/profile/advanced');
    expect(mocks.refreshMock).toHaveBeenCalledTimes(1);
  });
});
