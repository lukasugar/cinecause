import { describe, it, expect } from 'vitest';
import { media, donations, profiles, donationIntents } from '../schema';

describe('Database Schema', () => {
  it('exports media table with required columns', () => {
    expect(media.tmdbId).toBeDefined();
    expect(media.mediaType).toBeDefined();
    expect(media.title).toBeDefined();
    expect(media.totalDonationsCents).toBeDefined();
    expect(media.donationCount).toBeDefined();
  });

  it('exports donations table with required columns', () => {
    expect(donations.chargeId).toBeDefined();
    expect(donations.mediaId).toBeDefined();
    expect(donations.amountCents).toBeDefined();
  });

  it('exports profiles table with privacy columns', () => {
    expect(profiles.userId).toBeDefined();
    expect(profiles.displayName).toBeDefined();
    expect(profiles.isPublic).toBeDefined();
  });

  it('exports donation intents table', () => {
    expect(donationIntents.id).toBeDefined();
    expect(donationIntents.userId).toBeDefined();
    expect(donationIntents.tmdbId).toBeDefined();
    expect(donationIntents.mediaType).toBeDefined();
  });

  it('extends donations with user ownership columns', () => {
    expect(donations.userId).toBeDefined();
    expect(donations.partnerDonationId).toBeDefined();
  });

  it('adds account lifecycle fields to profiles', () => {
    expect(profiles.deletedAt).toBeDefined();
  });
});
