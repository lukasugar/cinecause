import { z } from 'zod';

export const everyOrgWebhookSchema = z.object({
  chargeId: z.string(),
  amount: z.string(),
  netAmount: z.string().optional(),
  currency: z.string(),
  frequency: z.enum(['ONCE', 'MONTHLY', 'YEARLY']),
  donationDate: z.string(),
  partnerDonationId: z.string().optional(),
  partnerMetadata: z.object({
    tmdb_id: z.number(),
    media_type: z.enum(['movie', 'tv']),
    title: z.string(),
  }),
  toNonprofit: z.object({
    slug: z.string(),
    ein: z.string().optional(),
    name: z.string(),
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  publicTestimony: z.string().optional(),
  privateNote: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export const tmdbMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  poster_path: z.string().nullable(),
  release_date: z.string().optional(),
  overview: z.string(),
  vote_average: z.number().optional(),
  genre_ids: z.array(z.number()).optional(),
});

export const tmdbTvSchema = z.object({
  id: z.number(),
  name: z.string(),
  poster_path: z.string().nullable(),
  first_air_date: z.string().optional(),
  overview: z.string(),
  vote_average: z.number().optional(),
  genre_ids: z.array(z.number()).optional(),
});

export const tmdbMovieListSchema = z.object({
  page: z.number(),
  results: z.array(tmdbMovieSchema),
  total_pages: z.number(),
  total_results: z.number(),
});

export const tmdbTvListSchema = z.object({
  page: z.number(),
  results: z.array(tmdbTvSchema),
  total_pages: z.number(),
  total_results: z.number(),
});

export const tmdbCreditsSchema = z.object({
  cast: z.array(z.object({
    name: z.string(),
    character: z.string().optional(),
    profile_path: z.string().nullable(),
    order: z.number().optional(),
  })),
  crew: z.array(z.object({
    name: z.string(),
    job: z.string(),
    department: z.string().optional(),
  })),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  isPublic: z.boolean().optional(),
});

export const createDonationLinkSchema = z.object({
  tmdbId: z.number(),
  mediaType: z.enum(['movie', 'tv']),
  title: z.string().min(1),
  nonprofitSlug: z.string().optional(),
});

export const tmdbMovieDetailSchema = tmdbMovieSchema.extend({
  genres: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
  runtime: z.number().nullable().optional(),
  tagline: z.string().nullable().optional(),
  credits: tmdbCreditsSchema.optional(),
});

export const tmdbTvDetailSchema = tmdbTvSchema.extend({
  genres: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
  episode_run_time: z.array(z.number()).optional(),
  tagline: z.string().nullable().optional(),
  created_by: z.array(z.object({ name: z.string() })).optional(),
  credits: tmdbCreditsSchema.optional(),
});

export type EveryOrgWebhook = z.infer<typeof everyOrgWebhookSchema>;
export type TmdbMovie = z.infer<typeof tmdbMovieSchema>;
export type TmdbTv = z.infer<typeof tmdbTvSchema>;
export type TmdbMovieList = z.infer<typeof tmdbMovieListSchema>;
export type TmdbTvList = z.infer<typeof tmdbTvListSchema>;
export type TmdbCredits = z.infer<typeof tmdbCreditsSchema>;
export type TmdbMovieDetail = z.infer<typeof tmdbMovieDetailSchema>;
export type TmdbTvDetail = z.infer<typeof tmdbTvDetailSchema>;
