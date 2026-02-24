'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Media } from '@/db/schema';

// NOTE: Currently using client-side pagination which loads all data upfront.
// If the app scales significantly (thousands of items), switch to server-side
// pagination with cursor-based or offset queries to reduce initial load time.
const ITEMS_PER_PAGE = 50;

export type LeaderboardView = 'all' | 'recent';

export type LeaderboardMediaRow = Pick<
  Media,
  'id' | 'tmdbId' | 'mediaType' | 'title' | 'releaseYear' | 'totalDonationsCents' | 'donationCount'
>;

interface LeaderboardProps {
  allTimeMedia: LeaderboardMediaRow[];
  recentMedia: LeaderboardMediaRow[];
  initialView: LeaderboardView;
}

function formatCents(cents: number | null): string {
  const dollars = (cents || 0) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

export function Leaderboard({ allTimeMedia, recentMedia, initialView }: LeaderboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = useState<LeaderboardView>(initialView);
  const [currentPage, setCurrentPage] = useState(1);
  const activeMedia = view === 'recent' ? recentMedia : allTimeMedia;
  const donatedHeader = 'Total Donated';
  const donationsHeader = 'Donations';

  function handleViewChange(nextView: LeaderboardView) {
    if (nextView === view) {
      return;
    }

    setView(nextView);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams.toString());
    params.set('view', nextView);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (activeMedia.length === 0) {
    return (
      <div className="space-y-4">
        <div className="inline-flex rounded-full border border-[var(--border-soft)] bg-[rgba(10,23,43,0.68)] p-1">
          <button
            type="button"
            aria-pressed={view === 'all'}
            onClick={() => handleViewChange('all')}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              view === 'all'
                ? 'bg-[rgba(27,43,69,0.78)] text-[var(--text-strong)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
            }`}
          >
            All time
          </button>
          <button
            type="button"
            aria-pressed={view === 'recent'}
            onClick={() => handleViewChange('recent')}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              view === 'recent'
                ? 'bg-[rgba(27,43,69,0.78)] text-[var(--text-strong)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
            }`}
          >
            Last 30 days
          </button>
        </div>

        <div className="section-block px-6 py-12 text-center">
          <p className="text-lg font-semibold text-[var(--text-strong)]">No donations logged yet. Be first to set the tone.</p>
          <p className="mt-2 text-[var(--text-muted)]">Explore a title and make the first impact contribution.</p>
          <Link href="/" className="btn-primary mt-5 inline-flex px-4 py-2 text-sm">
            Discover trending titles
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(activeMedia.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMedia = activeMedia.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-[var(--border-soft)] bg-[rgba(10,23,43,0.68)] p-1">
        <button
          type="button"
          aria-pressed={view === 'all'}
          onClick={() => handleViewChange('all')}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            view === 'all'
              ? 'bg-[rgba(27,43,69,0.78)] text-[var(--text-strong)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
          }`}
        >
          All time
        </button>
        <button
          type="button"
          aria-pressed={view === 'recent'}
          onClick={() => handleViewChange('recent')}
          className={`rounded-full px-4 py-1.5 text-sm transition ${
            view === 'recent'
              ? 'bg-[rgba(27,43,69,0.78)] text-[var(--text-strong)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
          }`}
        >
          Last 30 days
        </button>
      </div>

      <div className="table-surface">
        <table className="min-w-full divide-y divide-[var(--border-soft)]">
          <thead className="bg-[rgba(10,23,43,0.82)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Movie
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                {donatedHeader}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                {donationsHeader}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)] bg-[rgba(11,21,40,0.86)]">
            {paginatedMedia.map((item, index) => (
              <tr key={item.id} className="hover:bg-[rgba(27,43,69,0.65)]">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-muted)]">
                  #{startIndex + index + 1}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Link
                    href={`/${item.mediaType}/${item.tmdbId}`}
                    className="text-sm font-medium text-[var(--text-strong)] hover:text-[var(--accent-2)]"
                  >
                    {item.title}
                  </Link>
                  {item.releaseYear && (
                    <span className="ml-2 text-sm text-[var(--text-muted)]">
                      ({item.releaseYear})
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-[var(--success)]">
                  {formatCents(item.totalDonationsCents)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-[var(--text-muted)]">
                  {item.donationCount ?? 0} donations
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 border-t border-[var(--border-soft)] bg-[rgba(11,21,40,0.86)] py-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-[var(--text-muted)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
