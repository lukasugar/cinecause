import Link from 'next/link';

export type DonationHistoryItem = {
  id: number;
  mediaTitle: string | null;
  mediaType: 'movie' | 'tv' | null;
  tmdbId: number | null;
  amountCents: number;
  charityName: string | null;
  donatedAt: Date;
};

function formatCents(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function DonationHistory({ items }: { items: DonationHistoryItem[] }) {
  if (items.length === 0) {
    return <p className="text-[var(--text-muted)]">No donations linked to this account yet.</p>;
  }

  return (
    <div className="table-surface">
      <table className="min-w-full divide-y divide-[var(--border-soft)]">
        <thead className="bg-[rgba(10,23,43,0.82)]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Media
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Charity
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Amount
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-soft)] bg-[rgba(11,21,40,0.86)]">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-[rgba(27,43,69,0.65)]">
              <td className="px-4 py-3 text-sm text-[var(--text-strong)]">
                {item.mediaTitle && item.mediaType && item.tmdbId ? (
                  <Link href={`/${item.mediaType}/${item.tmdbId}`} className="hover:text-[var(--accent-2)]">
                    {item.mediaTitle}
                  </Link>
                ) : (
                  'Unknown title'
                )}
              </td>
              <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{item.charityName ?? 'Unknown charity'}</td>
              <td className="px-4 py-3 text-right text-sm font-medium text-[var(--success)]">
                {formatCents(item.amountCents)}
              </td>
              <td className="px-4 py-3 text-right text-sm text-[var(--text-muted)]">{formatDate(item.donatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
