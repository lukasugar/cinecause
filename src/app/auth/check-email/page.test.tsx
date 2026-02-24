import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import CheckEmailPage from './page';

describe('CheckEmailPage', () => {
  it('renders verification instructions and navigation links', () => {
    render(<CheckEmailPage />);

    expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument();
    expect(screen.getByText(/confirm your email to activate your profile and donation history/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore movies and shows/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /back to sign in/i })).toHaveAttribute(
      'href',
      '/auth/sign-in'
    );
  });
});
