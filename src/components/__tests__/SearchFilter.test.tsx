import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchFilter } from '../SearchFilter';

describe('SearchFilter', () => {
  it('renders all filter options', () => {
    render(<SearchFilter value="all" onChange={() => {}} />);
    expect(screen.getByText('All')).toBeDefined();
    expect(screen.getByText('Movies')).toBeDefined();
    expect(screen.getByText('TV Shows')).toBeDefined();
  });

  it('highlights the active filter', () => {
    render(<SearchFilter value="movie" onChange={() => {}} />);
    const moviesButton = screen.getByText('Movies');
    expect(moviesButton.className).toContain('bg-[var(--accent)]');
  });

  it('calls onChange when filter is clicked', () => {
    const onChange = vi.fn();
    render(<SearchFilter value="all" onChange={onChange} />);
    fireEvent.click(screen.getByText('TV Shows'));
    expect(onChange).toHaveBeenCalledWith('tv');
  });
});
