import Link from 'next/link';

export type RecentDonationItem = {
  id: number;
  amountCents: number;
  mediaTitle: string | null;
  mediaType: 'movie' | 'tv' | null;
  tmdbId: number | null;
  donatedAt: Date;
  donorFirstName: string | null;
  displayName: string | null;
  isPublic: boolean | null;
};

function formatCents(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function donorLabel(item: RecentDonationItem) {
  if (!item.isPublic) {
    return 'Anonymous';
  }

  return item.displayName ?? item.donorFirstName ?? 'Anonymous';
}

export function RecentDonations({ items }: { items: RecentDonationItem[] }) {
  if (items.length === 0) {
    return <p className="text-[var(--text-muted)]">No recent donations yet.</p>;
  }

  return (
    <div className="table-surface">
      <table className="min-w-full divide-y divide-[var(--border-soft)]">
        <thead className="bg-[rgba(10,23,43,0.82)]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Donor
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Inspired By
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-soft)] bg-[rgba(11,21,40,0.86)]">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-[rgba(27,43,69,0.65)]">
              <td className="px-4 py-3 text-sm text-[var(--text-strong)]">{donorLabel(item)}</td>
              <td className="px-4 py-3 text-sm text-[var(--text-strong)]">
                {item.mediaType && item.tmdbId && item.mediaTitle ? (
                  <Link href={`/${item.mediaType}/${item.tmdbId}`} className="hover:text-[var(--accent-2)]">
                    {item.mediaTitle}
                  </Link>
                ) : (
                  item.mediaTitle ?? 'Unknown media'
                )}
              </td>
              <td className="px-4 py-3 text-right text-sm font-medium text-[var(--success)]">
                {formatCents(item.amountCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
