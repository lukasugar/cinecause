import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { donationIntents, profiles } from '@/db/schema';
import { generateDonateUrl } from '@/lib/every-org';
import { createDonationLinkSchema } from '@/lib/schemas';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createDonationLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let partnerDonationId: string | undefined;
    if (user?.id) {
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, user.id))
        .limit(1);

      if (profile?.deletedAt) {
        return NextResponse.json({ error: 'Account deleted' }, { status: 403 });
      }

      partnerDonationId = crypto.randomUUID();
      await db.insert(donationIntents).values({
        id: partnerDonationId,
        userId: user.id,
        tmdbId: parsed.data.tmdbId,
        mediaType: parsed.data.mediaType,
        title: parsed.data.title,
        charitySlug: parsed.data.nonprofitSlug,
      });
    }

    const url = generateDonateUrl({
      tmdbId: parsed.data.tmdbId,
      mediaType: parsed.data.mediaType,
      title: parsed.data.title,
      nonprofitSlug: parsed.data.nonprofitSlug,
      partnerDonationId,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Create link error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
