import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInPage from './page';

const mocks = vi.hoisted(() => {
  const signInWithPasswordMock = vi.fn();
  const signUpMock = vi.fn();
  const pushMock = vi.fn();
  const refreshMock = vi.fn();
  const createClientMock = vi.fn(() => ({
    auth: {
      signInWithPassword: signInWithPasswordMock,
      signUp: signUpMock,
      signInWithOAuth: vi.fn(),
    },
  }));

  return {
    signInWithPasswordMock,
    signUpMock,
    pushMock,
    refreshMock,
    createClientMock,
  };
});

vi.mock('@/lib/supabase/client', () => ({
  createClient: mocks.createClientMock,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.pushMock,
    refresh: mocks.refreshMock,
  }),
}));

describe('SignInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signInWithPasswordMock.mockResolvedValue({ error: null });
    mocks.signUpMock.mockResolvedValue({ error: null });
  });

  it('does not render Google sign-in option', () => {
    render(<SignInPage />);

    expect(screen.queryByRole('button', { name: /continue with google/i })).not.toBeInTheDocument();
  });

  it('shows sign-up-first copy', () => {
    render(<SignInPage />);

    expect(
      screen.getByRole('heading', { name: /sign up/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/create your account to track your giving history and manage privacy settings/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to sign in/i })).toBeInTheDocument();
  });

  it('does not show forgot password link in sign-up mode', () => {
    render(<SignInPage />);
    expect(screen.queryByRole('link', { name: /forgot password\?/i })).not.toBeInTheDocument();
  });

  it('shows forgot password link in sign-in mode', async () => {
    const user = userEvent.setup();
    render(<SignInPage />);

    await user.click(screen.getByRole('button', { name: /switch to sign in/i }));
    expect(screen.getByRole('link', { name: /forgot password\?/i })).toHaveAttribute(
      'href',
      '/auth/forgot-password'
    );
  });

  it('does not render separate sign mode toggle buttons', () => {
    render(<SignInPage />);

    expect(screen.queryByRole('button', { name: /select sign up form/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /select sign in form/i })).not.toBeInTheDocument();
  });

  it('uses password-manager-friendly field metadata for sign-up and sign-in', async () => {
    const user = userEvent.setup();
    render(<SignInPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute('name', 'username');
    expect(emailInput).toHaveAttribute('autocomplete', 'username');
    expect(passwordInput).toHaveAttribute('name', 'password');
    expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');

    await user.click(screen.getByRole('button', { name: /switch to sign in/i }));
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  it('switches form when clicking the copy actions', async () => {
    const user = userEvent.setup();
    render(<SignInPage />);

    const passwordInput = screen.getByLabelText(/password/i);

    await user.click(screen.getByRole('button', { name: /switch to sign in/i }));
    expect(screen.getByRole('heading', { name: /^sign in$/i })).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');

    await user.click(screen.getByRole('button', { name: /switch to sign up/i }));
    expect(screen.getByRole('heading', { name: /^sign up$/i })).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
  });

  it('shows a friendly message when signup is rate limited', async () => {
    const user = userEvent.setup();
    mocks.signUpMock.mockResolvedValue({
      error: { message: 'email rate limit exceeded' },
    });

    render(<SignInPage />);

    await user.type(screen.getByLabelText(/email/i), 'person@example.com');
    await user.type(screen.getByLabelText(/password/i), 'super-secret-password');
    await user.click(screen.getByText(/^sign up$/i, { selector: 'button[type="submit"]' }));

    expect(
      await screen.findByText(/too many signup attempts right now\. please wait a moment and try again/i)
    ).toBeInTheDocument();
  });

  it('keeps users on the sign-in page when signup is rate limited', async () => {
    const user = userEvent.setup();
    mocks.signUpMock.mockResolvedValue({
      error: { message: 'email rate limit exceeded' },
    });

    render(<SignInPage />);

    await user.type(screen.getByLabelText(/email/i), 'person@example.com');
    await user.type(screen.getByLabelText(/password/i), 'super-secret-password');
    await user.click(screen.getByText(/^sign up$/i, { selector: 'button[type="submit"]' }));

    expect(mocks.pushMock).not.toHaveBeenCalled();
  });

  it('redirects to check-email after successful signup', async () => {
    const user = userEvent.setup();
    mocks.signUpMock.mockResolvedValue({ error: null });

    render(<SignInPage />);

    await user.type(screen.getByLabelText(/email/i), 'person@example.com');
    await user.type(screen.getByLabelText(/password/i), 'super-secret-password');
    await user.click(screen.getByText(/^sign up$/i, { selector: 'button[type="submit"]' }));

    expect(mocks.signUpMock).toHaveBeenCalledOnce();
    expect(mocks.pushMock).toHaveBeenCalledWith('/auth/check-email');
  });
});
