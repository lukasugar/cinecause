import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DonationHistory, type DonationHistoryItem } from '../DonationHistory';

describe('DonationHistory', () => {
  it('renders donation rows with media title and amount', () => {
    const items: DonationHistoryItem[] = [
      {
        id: 1,
        mediaTitle: 'Fight Club',
        mediaType: 'movie',
        tmdbId: 550,
        amountCents: 2500,
        charityName: 'Red Cross',
        donatedAt: new Date('2026-02-06T10:00:00Z'),
      },
    ];

    render(<DonationHistory items={items} />);

    expect(screen.getByText(/fight club/i)).toBeInTheDocument();
    expect(screen.getByText(/\$25\.00/)).toBeInTheDocument();
    expect(screen.getByText(/red cross/i)).toBeInTheDocument();
  });
});
