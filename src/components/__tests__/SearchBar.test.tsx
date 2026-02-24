import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchBar } from '../SearchBar';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

describe('SearchBar', () => {
  it('renders hero mode by default', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText(/search movies and tv shows/i)).toBeInTheDocument();
  });

  it('renders page mode with full-width container', () => {
    render(<SearchBar mode="page" />);
    const input = screen.getByPlaceholderText(/search movies and tv shows/i);
    expect(input.closest('div.relative.w-full.max-w-xl.mx-auto')).toBeNull();
  });
});
