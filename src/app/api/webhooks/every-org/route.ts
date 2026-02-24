import { NextRequest, NextResponse } from 'next/server';
import { everyOrgWebhookSchema } from '@/lib/schemas';
import { db } from '@/db';
import { media, donations, donationIntents } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const expectedAuthorization = process.env.EVERY_ORG_WEBHOOK_TOKEN;
    if (!expectedAuthorization) {
      console.error('EVERY_ORG_WEBHOOK_TOKEN is not set; refusing to process webhook');
      return NextResponse.json({ error: 'Webhook authorization misconfigured' }, { status: 500 });
    }

    const receivedAuthorization = request.headers.get('authorization');

    if (receivedAuthorization !== `Bearer ${expectedAuthorization}`) {
      console.error('Unexpected authorization header value for Every.org webhook:', receivedAuthorization);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Log full request for debugging Every.org webhook format
    const rawBody = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    console.log('=== EVERY.ORG WEBHOOK REQUEST ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', rawBody);
    console.log('IP:', request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown');
    console.log('=== END WEBHOOK REQUEST ===');

    const body = JSON.parse(rawBody);

    // Validate payload
    const parsed = everyOrgWebhookSchema.safeParse(body);
    if (!parsed.success) {
      console.error('Invalid webhook payload:', parsed.error);
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const data = parsed.data;

    // Parse amount safely (avoid floating point issues)
    const amountParts = data.amount.split('.');
    const dollars = parseInt(amountParts[0]) || 0;
    const cents = parseInt((amountParts[1] || '0').padEnd(2, '0').slice(0, 2)) || 0;
    const amountCents = dollars * 100 + cents;

    // Use a transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // First, check if this donation already exists (idempotency check)
      const existingDonation = await tx
        .select()
        .from(donations)
        .where(eq(donations.chargeId, data.chargeId))
        .limit(1);

      // If donation already exists, skip processing (webhook retry)
      if (existingDonation.length > 0) {
        return; // Exit transaction early, no changes made
      }

      // Upsert media record (create if new, or just fetch if exists)
      const [mediaRecord] = await tx
        .insert(media)
        .values({
          tmdbId: data.partnerMetadata.tmdb_id,
          mediaType: data.partnerMetadata.media_type,
          title: data.partnerMetadata.title,
          totalDonationsCents: 0,
          donationCount: 0,
        })
        .onConflictDoUpdate({
          target: [media.tmdbId, media.mediaType],
          set: {
            title: data.partnerMetadata.title,
            updatedAt: new Date(),
          },
        })
        .returning();

      let linkedUserId: string | null = null;
      if (data.partnerDonationId) {
        const [intent] = await tx
          .select()
          .from(donationIntents)
          .where(eq(donationIntents.id, data.partnerDonationId))
          .limit(1);

        if (intent) {
          linkedUserId = intent.userId;
        }
      }

      // Create the donation record
      await tx.insert(donations).values({
        chargeId: data.chargeId,
        partnerDonationId: data.partnerDonationId,
        userId: linkedUserId,
        mediaId: mediaRecord.id,
        amountCents,
        currency: data.currency,
        charityName: data.toNonprofit.name,
        charitySlug: data.toNonprofit.slug,
        donorFirstName: data.firstName,
        publicTestimony: data.publicTestimony,
        donatedAt: new Date(data.donationDate),
      });

      if (data.partnerDonationId) {
        await tx
          .update(donationIntents)
          .set({ completedAt: new Date() })
          .where(eq(donationIntents.id, data.partnerDonationId));
      }

      // Only increment totals AFTER donation is successfully inserted
      await tx
        .update(media)
        .set({
          totalDonationsCents: sql`${media.totalDonationsCents} + ${amountCents}`,
          donationCount: sql`${media.donationCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(media.id, mediaRecord.id));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
