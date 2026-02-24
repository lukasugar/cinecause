'use client';

import { useState } from 'react';
import { CharitySelector, Charity } from './CharitySelector';
import { DonateButton } from './DonateButton';

interface DonationSectionProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
}

const KNOWN_CHARITIES: Record<string, Charity> = {
  wwf: {
    name: 'World Wildlife Fund',
    slug: 'wwf',
    logoUrl: '/images/wwf-logo.png',
  },
  wikipedia: {
    name: 'Wikipedia',
    slug: 'wikipedia',
    logoUrl: '/images/wikipedia-logo.png',
  },
};

function getDefaultCharity(): Charity {
  const slug = process.env.NEXT_PUBLIC_EVERY_ORG_NONPROFIT_SLUG || 'wwf';
  return KNOWN_CHARITIES[slug] || KNOWN_CHARITIES.wwf;
}

export function DonationSection({ tmdbId, mediaType, title }: DonationSectionProps) {
  const [selectedCharity, setSelectedCharity] = useState<Charity>(getDefaultCharity);

  const contextText = mediaType === 'movie'
    ? 'Still thinking about this story? Back a cause now.'
    : 'Still thinking about this story? Back a cause now.';

  return (
    <div className="section-block mt-8 p-5">
      <p className="mb-4 text-[var(--text-strong)]">{contextText}</p>

      <CharitySelector
        label="Donation destination"
        selectedCharity={selectedCharity}
        onCharityChange={setSelectedCharity}
      />

      <DonateButton
        tmdbId={tmdbId}
        mediaType={mediaType}
        title={title}
        nonprofitSlug={selectedCharity.slug}
        label="Donate now"
      />
    </div>
  );
}
