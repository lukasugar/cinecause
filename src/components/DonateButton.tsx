'use client';

import { useState } from 'react';

interface DonateButtonProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  nonprofitSlug?: string;
  label?: string;
}

export function DonateButton({ tmdbId, mediaType, title, nonprofitSlug, label = 'Donate now' }: DonateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDonate() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/donations/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tmdbId,
          mediaType,
          title,
          nonprofitSlug,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create donation link: ${response.status}`);
      }

      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        throw new Error('Donation URL missing');
      }

      open(data.url, '_blank', 'noopener,noreferrer');
    } catch {
      setError('Unable to open donation page right now.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => void handleDonate()}
        disabled={isLoading}
        className="btn-primary inline-flex items-center gap-2 px-6 py-3"
      >
        {isLoading ? 'Preparing...' : label}
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-red-500" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
      {error && <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>}
      <p className="mt-2 text-sm text-[var(--text-muted)]">Powered by Every.org</p>
    </div>
  );
}
