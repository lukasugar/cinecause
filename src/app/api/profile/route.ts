import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { db } from '@/db';
import { donationIntents, donations, profiles } from '@/db/schema';
import { updateProfileSchema } from '@/lib/schemas';

async function getAuthenticatedUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (existingProfile?.deletedAt) {
      return NextResponse.json({ error: 'Account deleted' }, { status: 410 });
    }

    if (existingProfile) {
      return NextResponse.json({ profile: existingProfile });
    }

    const [newProfile] = await db
      .insert(profiles)
      .values({
        userId,
        isPublic: false,
      })
      .returning();

    return NextResponse.json({ profile: newProfile });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (existingProfile?.deletedAt) {
      return NextResponse.json({ error: 'Account deleted' }, { status: 410 });
    }

    const updateData: Partial<typeof profiles.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (parsed.data.displayName !== undefined) {
      updateData.displayName = parsed.data.displayName;
    }

    if (parsed.data.isPublic !== undefined) {
      updateData.isPublic = parsed.data.isPublic;
    }

    if (existingProfile) {
      const [updatedProfile] = await db
        .update(profiles)
        .set(updateData)
        .where(eq(profiles.userId, userId))
        .returning();

      if (updatedProfile) {
        return NextResponse.json({ profile: updatedProfile });
      }
    }

    const [newProfile] = await db
      .insert(profiles)
      .values({
        userId,
        displayName: parsed.data.displayName,
        isPublic: parsed.data.isPublic ?? false,
      })
      .returning();

    return NextResponse.json({ profile: newProfile });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(profiles)
        .set({
          displayName: null,
          isPublic: false,
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, userId));

      await tx
        .update(donations)
        .set({
          userId: null,
          donorFirstName: null,
          publicTestimony: null,
        })
        .where(eq(donations.userId, userId));

      await tx.delete(donationIntents).where(eq(donationIntents.userId, userId));
    });

    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Profile DELETE auth cleanup error:', error);
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile DELETE error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
