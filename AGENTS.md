# AGENTS.md - Movie Altruism Project Guide

This document provides essential context, patterns, and workflows for AI agents working on the Movie Altruism codebase.

## Project Overview

**Movie Altruism** is a website where users browse popular movies/TV shows and donate to charity, with donations tracked and attributed to the media that inspired them. The platform features a dashboard showing "most impactful" movies by donation amount.

### Use Cases
- Watched a powerful movie and feel inspired to give back
- Downloaded a movie via torrent and want to "make up for it" by donating to charity
- Want to see which movies inspire the most charitable giving

### Core Flow
1. User browses/searches movies via TMDB API
2. User clicks "Donate because of this movie" → redirects to Every.org
3. User completes donation on Every.org (any charity)
4. Webhook notifies our server → database updated
5. Leaderboard reflects donation impact

---

## Tech Stack

| Component | Technology | Documentation |
|-----------|------------|--------------|
| **Frontend** | Next.js 14+ (App Router) | [Next.js Docs](https://nextjs.org/docs) - Use Context7 for latest patterns |
| **Database** | NeonDB (PostgreSQL) | [NeonDB Docs](https://neon.tech/docs) |
| **ORM** | Drizzle ORM | [Drizzle Docs](https://orm.drizzle.team/) - Use Context7 for latest patterns |
| **Validation** | Zod | [Zod Docs](https://zod.dev/) - Use Context7 for latest patterns |
| **Movie Data** | TMDB API | [TMDB API Docs](https://developer.themoviedb.org/docs) |
| **Donations** | Every.org | [Every.org Partner Webhook Docs](https://docs.every.org/docs/webhooks/partner-webhook) |
| **Hosting** | Vercel | [Vercel Docs](https://vercel.com/docs) |

### Why This Stack?
- **Next.js**: Server components for SEO, API routes for webhooks, excellent TypeScript support
- **NeonDB**: Generous free tier, serverless-friendly, official Drizzle support
- **Drizzle**: No codegen step, TypeScript-native type inference, SQL-like syntax
- **Zod**: TypeScript-first validation with excellent error messages
- **TMDB**: Best free movie API - comprehensive data, high-quality posters
- **Every.org**: Direct-to-charity donations, partner webhook for tracking, no payment handling required

### Using Context7 for Documentation

When working with this codebase, **always use Context7 MCP** to fetch up-to-date documentation for libraries, e.g.:
- Next.js App Router patterns (API routes, Server Components)
- Drizzle ORM (transactions, upserts, composite keys)
- Zod validation (safeParse patterns, error handling)

Example Context7 queries:
- "Next.js 14 App Router API routes webhook endpoints POST handlers"
- "Drizzle ORM PostgreSQL transactions idempotency upsert composite unique constraints"
- "Zod schema validation safeParse error handling TypeScript inference"

---

## Architecture Patterns

### 1. Idempotent Webhooks

**Critical Pattern**: All webhook handlers must be truly idempotent to handle retries correctly.

**Implementation**:
```typescript
// Use database transaction with early exit for duplicates
await db.transaction(async (tx) => {
  // 1. Check if donation already exists (by chargeId)
  const existingDonation = await tx
    .select()
    .from(donations)
    .where(eq(donations.chargeId, data.chargeId))
    .limit(1);

  // 2. If exists, return success immediately (no-op)
  if (existingDonation.length > 0) {
    return; // Exit transaction early, no changes made
  }

  // 3. Upsert media record
  const [mediaRecord] = await tx
    .insert(media)
    .values({...})
    .onConflictDoUpdate({...})
    .returning();

  // 4. Insert donation record
  await tx.insert(donations).values({...});

  // 5. Only increment totals AFTER successful insert
  await tx
    .update(media)
    .set({
      totalDonationsCents: sql`${media.totalDonationsCents} + ${amountCents}`,
      donationCount: sql`${media.donationCount} + 1`,
    })
    .where(eq(media.id, mediaRecord.id));
});
```

**Why**: Webhooks can be retried. This pattern ensures:
- Duplicate chargeIds don't create duplicate records
- Totals are never double-counted
- Retries are safe and fast (early exit)

### 2. Composite Unique Constraints

**Problem**: TMDB IDs overlap between movies and TV shows (e.g., movie ID 550 ≠ TV show ID 550).

**Solution**: Use composite unique constraint on `(tmdb_id, media_type)`.

```typescript
export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  tmdbId: integer('tmdb_id').notNull(),
  mediaType: varchar('media_type', { length: 10 }).notNull(), // 'movie' or 'tv'
  // ...
}, (table) => ({
  // Composite unique constraint
  tmdbMediaTypeUnique: unique().on(table.tmdbId, table.mediaType),
}));
```

**Usage in Upserts**:
```typescript
.onConflictDoUpdate({
  target: [media.tmdbId, media.mediaType], // Composite unique constraint
  set: { title: data.partnerMetadata.title },
})
```

### 3. Zod Validation with safeParse

**Pattern**: Always use `safeParse` for external API validation (webhooks, TMDB responses).

```typescript
import { z } from 'zod';

// Define schema
export const everyOrgWebhookSchema = z.object({
  chargeId: z.string(),
  amount: z.string(),
  partnerMetadata: z.object({
    tmdb_id: z.number(),
    media_type: z.enum(['movie', 'tv']),
    title: z.string(),
  }),
  // ...
});

// Validate with safeParse (doesn't throw)
const parsed = everyOrgWebhookSchema.safeParse(body);
if (!parsed.success) {
  console.error('Invalid webhook payload:', parsed.error);
  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}

const data = parsed.data; // Type-safe!
```

**Why**: `safeParse` returns a discriminated union instead of throwing, allowing graceful error handling.

### 4. Database Transactions

**Pattern**: Use transactions for any multi-step database operations to ensure atomicity.

```typescript
await db.transaction(async (tx) => {
  // All operations here are atomic
  // If any fail, entire transaction rolls back
});
```

**When to Use**:
- Webhook processing (upsert media + insert donation + update totals)
- Any operation that modifies multiple tables
- Operations that must succeed or fail together

---

## Development Workflow

### Pre-Commit Checklist

**CRITICAL**: Before every commit, run these commands:

```bash
npm run lint        # ESLint checks
npm run typecheck   # TypeScript type checking
npm run build       # Full build (catches additional issues)
npm run test:run    # Run tests (when tests exist)
```

**Do not commit code with lint or type errors.**

### Environment Variables

Required environment variables (`.env.local`):

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
TMDB_API_KEY=your_tmdb_api_key_here
EVERY_ORG_WEBHOOK_TOKEN=token_from_every_org_support  # Only needed in production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Database Migrations

```bash
# Push schema changes to database
npm run db:push

# Open Drizzle Studio to inspect database
npm run db:studio
```

**Note**: This project uses Drizzle's `push` mode (no migration files). Schema changes are applied directly.

### Local Development

```bash
# Start dev server
npm run dev

# In another terminal, test webhook locally
./scripts/test-webhook.sh

# Seed test data
./scripts/seed-test-donations.sh
```

### Testing Webhooks Locally

**Key Insight**: You can fully test webhook integration locally without:
- Making real donations
- Having the Partner Webhook token
- Waiting for Every.org approval

The webhook endpoint simply:
1. Receives JSON payload
2. Validates structure with Zod
3. Updates database

Use the test scripts in `scripts/` to send mock payloads.

---

## Common Tasks

### Adding a New API Route

1. Create route file: `src/app/api/[route-name]/route.ts`
2. Export HTTP method handlers: `export async function GET/POST(request: Request)`
3. Use `NextResponse.json()` for JSON responses
4. Handle errors with try/catch and appropriate status codes

**Example**:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    return NextResponse.json({ data: 'result' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
```

### Creating a New Database Table

1. Add table definition to `src/db/schema.ts`:
```typescript
export const myTable = pgTable('my_table', {
  id: serial('id').primaryKey(),
  // ... columns
});
```

2. Export types:
```typescript
export type MyTable = typeof myTable.$inferSelect;
export type NewMyTable = typeof myTable.$inferInsert;
```

3. Push schema: `npm run db:push`

4. Verify in Drizzle Studio: `npm run db:studio`

### Adding Validation for External APIs

1. Define Zod schema in `src/lib/schemas.ts`:
```typescript
export const externalApiSchema = z.object({
  field1: z.string(),
  field2: z.number(),
});
```

2. Use `safeParse` in API route:
```typescript
const parsed = externalApiSchema.safeParse(data);
if (!parsed.success) {
  return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
}
const validated = parsed.data; // Type-safe!
```

3. Export inferred type if needed:
```typescript
export type ExternalApiData = z.infer<typeof externalApiSchema>;
```

### Testing Webhook Endpoints

1. Use test script: `./scripts/test-webhook.sh`
2. Or send curl request:
```bash
curl -X POST http://localhost:3000/api/webhooks/every-org \
  -H "Content-Type: application/json" \
  -d '{"chargeId": "test-123", ...}'
```

3. Verify in database:
```bash
npm run db:studio
```

### Adding a New Page

1. Create page file: `src/app/[route]/page.tsx`
2. Use Server Components by default (async/await for data fetching)
3. Add metadata export for SEO:
```typescript
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
};
```

---

## Testing Strategy

### Unit Tests

- Use Vitest for testing
- Test webhook idempotency (send same payload twice)
- Test Zod validation (valid/invalid payloads)
- Test database operations (transactions, upserts)

**Example Test Structure**:
```typescript
import { describe, it, expect } from 'vitest';
import { POST } from '../route';

describe('Webhook Handler', () => {
  it('should process valid donation', async () => {
    // Test implementation
  });

  it('should be idempotent', async () => {
    // Send same payload twice, verify no duplicates
  });
});
```

### Integration Tests

- Test full donation flow (mock Every.org redirect)
- Test leaderboard queries
- Test TMDB API integration

### Manual Testing

Use provided scripts:
- `scripts/test-webhook.sh` - Test webhook with mock data
- `scripts/seed-test-donations.sh` - Populate database with test data

### Testing Checklist

Before deploying:
- [ ] Webhook returns 200 for valid payload
- [ ] Webhook returns 400 for invalid payload
- [ ] Duplicate chargeId doesn't create duplicate records
- [ ] Duplicate chargeId doesn't double-count totals
- [ ] Media totals are accurate (match sum of donations)
- [ ] All lint checks pass
- [ ] All type checks pass
- [ ] Build succeeds

---

## Important Conventions

### Code Style

- **TypeScript**: Strict mode enabled, prefer type inference
- **Imports**: Use `@/` alias for absolute imports
- **Components**: Use Server Components by default, Client Components only when needed
- **Error Handling**: Always use try/catch in API routes, return appropriate status codes

### Naming Conventions

- **Files**: kebab-case for routes (`movie/[id]/page.tsx`), PascalCase for components (`MovieCard.tsx`)
- **Variables**: camelCase
- **Types**: PascalCase, prefer `type` over `interface` for inferred types
- **Database**: snake_case for columns (`total_donations_cents`)

### File Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── page.tsx           # Homepage
│   ├── movie/[id]/        # Movie detail pages
│   ├── api/               # API routes
│   │   └── webhooks/      # Webhook endpoints
│   └── ...
├── components/            # React components
├── lib/                   # Utility functions
│   ├── tmdb.ts           # TMDB API client
│   ├── every-org.ts      # Every.org integration
│   └── schemas.ts        # Zod schemas
├── db/                    # Database
│   ├── schema.ts         # Drizzle schema
│   └── index.ts          # Database client
└── types/                 # TypeScript types
```

### Database Conventions

- Use `serial` for auto-incrementing IDs
- Use `bigint` for monetary amounts (cents)
- Always include `createdAt` and `updatedAt` timestamps
- Use composite unique constraints for multi-column uniqueness
- Index frequently queried columns (e.g., `totalDonationsCents`)

### API Route Conventions

- Always validate external input with Zod
- Use `safeParse` instead of `parse` (doesn't throw)
- Return appropriate HTTP status codes
- Log errors but don't expose sensitive info in responses
- Use transactions for multi-step operations

---

## Key Files Reference

### Core Files

| File | Purpose |
|------|---------|
| `src/db/schema.ts` | Database schema definitions (Drizzle) |
| `src/db/index.ts` | Database client initialization |
| `src/lib/schemas.ts` | Zod validation schemas for external APIs |
| `src/lib/tmdb.ts` | TMDB API client |
| `src/lib/every-org.ts` | Every.org donation link generator |
| `src/app/api/webhooks/every-org/route.ts` | Webhook endpoint for donation notifications |

### Configuration Files

| File | Purpose |
|------|---------|
| `drizzle.config.ts` | Drizzle ORM configuration |
| `.env.local` | Environment variables (not committed) |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |

### Documentation Files

| File | Purpose |
|------|---------|
| `IMPLEMENTATION_PLAN.md` | Complete implementation guide with milestones |
| `LEGAL_REQUIREMENTS.md` | Legal compliance requirements (GDPR, privacy, etc.) |
| `AGENTS.md` | This file - guide for AI agents |

### Scripts

| File | Purpose |
|------|---------|
| `scripts/test-webhook.sh` | Test webhook endpoint with mock data |
| `scripts/seed-test-donations.sh` | Populate database with test donations |

---

## Troubleshooting

### Database Connection Issues

- **NeonDB auto-suspend**: Free tier suspends after 5min idle. First request may be slow.
- **Connection string**: Ensure `?sslmode=require` is included in `DATABASE_URL`

### Webhook Issues

- **Duplicate donations**: Check idempotency logic - should exit early if `chargeId` exists
- **Totals incorrect**: Verify totals only increment AFTER successful donation insert
- **Validation errors**: Check Zod schema matches actual payload structure

### Type Errors

- **Drizzle types**: Use `typeof table.$inferSelect` and `typeof table.$inferInsert`
- **Zod types**: Use `z.infer<typeof schema>`
- **Run typecheck**: `npm run typecheck` to see all errors

### Build Errors

- **Missing env vars**: Ensure all required variables are set
- **Type errors**: Fix all TypeScript errors before building
- **Import errors**: Check `@/` alias is configured in `tsconfig.json`

---

## Resources

### Documentation
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Zod Docs](https://zod.dev/)
- [TMDB API Docs](https://developer.themoviedb.org/docs)
- [Every.org Partner Webhook Docs](https://docs.every.org/docs/webhooks/partner-webhook)

### Context7 Queries
When you need up-to-date documentation, use Context7 MCP with queries like:
- "Next.js 14 App Router API routes POST handlers error handling"
- "Drizzle ORM PostgreSQL transactions upsert composite keys"
- "Zod safeParse validation error handling patterns"

### Project-Specific
- See `IMPLEMENTATION_PLAN.md` for detailed implementation steps
- See `LEGAL_REQUIREMENTS.md` for compliance requirements

---

## Quick Reference

### Essential Commands

```bash
npm run dev          # Start development server
npm run lint         # Run ESLint
npm run typecheck    # Type check TypeScript
npm run build        # Build for production
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm run test:run     # Run tests
```

### Common Patterns

**Webhook Handler**:
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  // Process with transaction...
}
```

**Database Query**:
```typescript
const results = await db
  .select()
  .from(table)
  .where(eq(table.column, value));
```

**Zod Validation**:
```typescript
const parsed = schema.safeParse(data);
if (!parsed.success) {
  // Handle error
}
const validated = parsed.data; // Type-safe!
```

---

**Last Updated**: 2025-01-12
**Maintained By**: AI Agents working on Movie Altruism project
