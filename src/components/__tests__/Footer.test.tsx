import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';

describe('Footer', () => {
  it('renders TMDB attribution', () => {
    render(<Footer />);
    expect(screen.getByText(/powered by tmdb/i)).toBeDefined();
  });

  it('renders legal links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /privacy/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /terms/i })).toBeDefined();
  });
});
