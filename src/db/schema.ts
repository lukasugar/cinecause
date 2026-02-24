import { pgTable, serial, integer, varchar, bigint, timestamp, text, index, unique, boolean, uuid } from 'drizzle-orm/pg-core';

export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  tmdbId: integer('tmdb_id').notNull(),
  mediaType: varchar('media_type', { length: 10 }).notNull(), // 'movie' or 'tv'
  title: varchar('title', { length: 500 }).notNull(),
  posterPath: varchar('poster_path', { length: 500 }),
  releaseYear: integer('release_year'),
  totalDonationsCents: bigint('total_donations_cents', { mode: 'number' }).default(0),
  donationCount: integer('donation_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  totalDonationsIdx: index('idx_media_total_donations').on(table.totalDonationsCents),
  tmdbMediaTypeUnique: unique().on(table.tmdbId, table.mediaType),
}));

export const donations = pgTable('donations', {
  id: serial('id').primaryKey(),
  chargeId: varchar('charge_id', { length: 100 }).unique().notNull(),
  partnerDonationId: varchar('partner_donation_id', { length: 64 }).unique(),
  userId: uuid('user_id'),
  mediaId: integer('media_id').references(() => media.id),
  amountCents: integer('amount_cents').notNull(),
  currency: varchar('currency', { length: 10 }).default('USD'),
  charityName: varchar('charity_name', { length: 500 }),
  charitySlug: varchar('charity_slug', { length: 200 }),
  donorFirstName: varchar('donor_first_name', { length: 100 }),
  publicTestimony: text('public_testimony'),
  donatedAt: timestamp('donated_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const profiles = pgTable('profiles', {
  userId: uuid('user_id').primaryKey(),
  displayName: varchar('display_name', { length: 120 }),
  isPublic: boolean('is_public').notNull().default(false),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const donationIntents = pgTable('donation_intents', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  tmdbId: integer('tmdb_id').notNull(),
  mediaType: varchar('media_type', { length: 10 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  charitySlug: varchar('charity_slug', { length: 200 }),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type DonationIntent = typeof donationIntents.$inferSelect;
export type NewDonationIntent = typeof donationIntents.$inferInsert;
