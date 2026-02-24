export type MediaType = 'movie' | 'tv';

export interface MediaCredit {
  name: string;
  role: string;
  imageUrl?: string;
}

export interface MediaItem {
  id: number;
  mediaType: MediaType;
  title: string;
  imageUrl: string | null;
  year: number | null;
  rating: number | null;
  donationCount?: number;
  totalDonationsCents?: number;
  overview: string;
  genres?: string[];
  runtime?: number | null;
  tagline?: string;
  director?: string;
  cast?: MediaCredit[];
}
