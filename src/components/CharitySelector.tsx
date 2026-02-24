'use client';

import { useState } from 'react';
import { CharitySearchModal } from './CharitySearchModal';

export interface Charity {
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
}

interface CharitySelectorProps {
  selectedCharity: Charity;
  onCharityChange: (charity: Charity) => void;
  label?: string;
}

export function CharitySelector({
  selectedCharity,
  onCharityChange,
  label = 'Your donation goes to:',
}: CharitySelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const charitySummary = selectedCharity.description?.trim();

  return (
    <div className="mb-4">
      <p className="mb-2 text-sm text-[var(--text-muted)]">{label}</p>
      <button
        onClick={() => setIsModalOpen(true)}
        className="input-modern flex w-full cursor-pointer items-center gap-3 p-3 text-left hover:border-[var(--accent-2)] sm:w-fit"
      >
        {selectedCharity.logoUrl ? (
          <img
            src={selectedCharity.logoUrl}
            alt={selectedCharity.name}
            className="w-8 h-8 rounded object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
            ?
          </div>
        )}
        <span className="font-medium text-[var(--text-strong)]">{selectedCharity.name}</span>
        <svg
          className="ml-auto h-4 w-4 text-[var(--text-muted)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {charitySummary && (
        <div className="mt-3 rounded-xl border border-[var(--border-soft)]/70 bg-[var(--surface-2)]/35 p-3 sm:p-4">
          <p className="text-sm font-medium text-[var(--text-strong)]">
            {`Great choice! You're supporting ${selectedCharity.name}.`}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">{charitySummary}</p>
        </div>
      )}

      {isModalOpen && (
        <CharitySearchModal
          onSelect={(charity) => {
            onCharityChange(charity);
            setIsModalOpen(false);
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
