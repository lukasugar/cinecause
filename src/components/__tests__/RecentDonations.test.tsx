import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentDonations, type RecentDonationItem } from '../RecentDonations';

describe('RecentDonations', () => {
  it('shows display name for public profiles', () => {
    const items: RecentDonationItem[] = [
      {
        id: 1,
        amountCents: 2000,
        mediaTitle: 'Fight Club',
        mediaType: 'movie',
        tmdbId: 550,
        donatedAt: new Date('2026-02-06T10:00:00Z'),
        donorFirstName: 'John',
        displayName: 'Luka',
        isPublic: true,
      },
    ];

    render(<RecentDonations items={items} />);
    expect(screen.getByText('Luka')).toBeInTheDocument();
  });

  it('shows Anonymous for private profiles', () => {
    const items: RecentDonationItem[] = [
      {
        id: 2,
        amountCents: 3000,
        mediaTitle: 'Interstellar',
        mediaType: 'movie',
        tmdbId: 157336,
        donatedAt: new Date('2026-02-06T10:00:00Z'),
        donorFirstName: 'John',
        displayName: 'Luka',
        isPublic: false,
      },
    ];

    render(<RecentDonations items={items} />);
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('shows Anonymous for donations not linked to user profile', () => {
    const items: RecentDonationItem[] = [
      {
        id: 3,
        amountCents: 1000,
        mediaTitle: 'The Godfather',
        mediaType: 'movie',
        tmdbId: 238,
        donatedAt: new Date('2026-02-06T10:00:00Z'),
        donorFirstName: 'John',
        displayName: null,
        isPublic: null,
      },
    ];

    render(<RecentDonations items={items} />);
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });
});
