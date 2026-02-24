export interface DonateMetadata {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  nonprofitSlug?: string;
  partnerDonationId?: string;
}

export function generateDonateUrl(metadata: DonateMetadata): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const webhookToken = process.env.NEXT_PUBLIC_EVERY_ORG_WEBHOOK_TOKEN;
  const everyOrgBaseUrl = process.env.NEXT_PUBLIC_EVERY_ORG_URL || 'https://www.every.org';

  const partnerMetadata = {
    tmdb_id: metadata.tmdbId,
    media_type: metadata.mediaType,
    title: metadata.title,
  };

  const encodedMetadata = btoa(JSON.stringify(partnerMetadata));

  const params = new URLSearchParams({
    partner_metadata: encodedMetadata,
    success_url: `${siteUrl}/donation/success`,
    exit_url: `${siteUrl}/${metadata.mediaType}/${metadata.tmdbId}`,
  });

  if (metadata.partnerDonationId) {
    params.set('partner_donation_id', metadata.partnerDonationId);
  }

  if (webhookToken) {
    params.set('webhook_token', webhookToken);
  }

  // Use a specific nonprofit slug for a better landing experience on Every.org
  // instead of the generic /donate page
  const nonprofitSlug = metadata.nonprofitSlug || process.env.NEXT_PUBLIC_EVERY_ORG_NONPROFIT_SLUG || 'wwf';

  return `${everyOrgBaseUrl}/${nonprofitSlug}?${params.toString()}`;
}
