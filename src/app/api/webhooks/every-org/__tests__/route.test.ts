import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock the database
vi.mock('@/db', () => ({
  db: {
    transaction: vi.fn((callback) => callback({
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          onConflictDoUpdate: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
          })),
        })),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => Promise.resolve()),
        })),
      })),
    })),
  },
}));

const createMockPayload = (overrides = {}) => ({
  chargeId: `test-${Date.now()}`,
  amount: '50.00',
  netAmount: '48.50',
  currency: 'USD',
  frequency: 'ONCE',
  donationDate: new Date().toISOString(),
  partnerMetadata: {
    tmdb_id: 550,
    media_type: 'movie',
    title: 'Fight Club',
  },
  toNonprofit: {
    slug: 'test-charity',
    name: 'Test Charity',
  },
  firstName: 'Test',
  ...overrides,
});

describe('Every.org Webhook', () => {
  const webhookToken = 'test-webhook-token';

  beforeEach(() => {
    vi.stubEnv('EVERY_ORG_WEBHOOK_TOKEN', webhookToken);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should process a valid donation and return 200', async () => {
    const payload = createMockPayload();
    const request = new NextRequest(
      'http://localhost:3000/api/webhooks/every-org',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${webhookToken}`,
        },
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it('should process a monthly donation and return 200', async () => {
    const payload = createMockPayload({ frequency: 'MONTHLY' });
    const request = new NextRequest(
      'http://localhost:3000/api/webhooks/every-org',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${webhookToken}`,
        },
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it('should reject invalid payload and return 400', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/webhooks/every-org',
      {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${webhookToken}`,
        },
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should handle missing optional fields', async () => {
    const payload = createMockPayload({
      firstName: undefined,
      publicTestimony: undefined,
      netAmount: undefined,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/webhooks/every-org',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${webhookToken}`,
        },
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('should handle duplicate chargeId (idempotency)', async () => {
    // Create a mock that returns an existing donation for the idempotency check
    const { db } = await import('@/db');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(db.transaction).mockImplementationOnce(async (callback: any) => {
      return callback({
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              // Return an existing donation - simulates duplicate webhook
              limit: vi.fn(() => Promise.resolve([{ id: 1, chargeId: 'duplicate-123' }])),
            })),
          })),
        })),
        insert: vi.fn(() => ({
          values: vi.fn(() => ({
            onConflictDoUpdate: vi.fn(() => ({
              returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
            })),
          })),
        })),
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve()),
          })),
        })),
      } as unknown);
    });

    const payload = createMockPayload({ chargeId: 'duplicate-123' });
    const request = new NextRequest(
      'http://localhost:3000/api/webhooks/every-org',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${webhookToken}`,
        },
      }
    );

    const response = await POST(request);
    // Should still return 200 (idempotent behavior)
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it('should reject requests with unexpected authorization header', async () => {
    const payload = createMockPayload();
    const request = new NextRequest(
      'http://localhost:3000/api/webhooks/every-org',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'wrong-token',
        },
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should reject requests with missing authorization header', async () => {
    const payload = createMockPayload();
    const request = new NextRequest(
      'http://localhost:3000/api/webhooks/every-org',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should link donation to user when partnerDonationId matches intent', async () => {
    const donationInsertValues = vi.fn(() => Promise.resolve());
    const selectLimitMock = vi.fn()
      // First call: idempotency check in donations table
      .mockResolvedValueOnce([])
      // Second call: intent lookup by partnerDonationId
      .mockResolvedValueOnce([{ id: 'intent-123', userId: 'user-1' }]);

    const mediaInsertValues = vi.fn(() => ({
      onConflictDoUpdate: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
      })),
    }));

    const { db } = await import('@/db');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(db.transaction).mockImplementationOnce(async (callback: any) => {
      const insertMock = vi.fn()
        .mockReturnValueOnce({ values: mediaInsertValues })
        .mockReturnValueOnce({ values: donationInsertValues });

      return callback({
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: selectLimitMock,
            })),
          })),
        })),
        insert: insertMock,
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve()),
          })),
        })),
      } as unknown);
    });

    const payload = createMockPayload({ partnerDonationId: 'intent-123' });
    const request = new NextRequest(
      'http://localhost:3000/api/webhooks/every-org',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${webhookToken}`,
        },
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(donationInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        partnerDonationId: 'intent-123',
      })
    );
  });

  it('should keep donation anonymous when partnerDonationId has no matching intent', async () => {
    const donationInsertValues = vi.fn(() => Promise.resolve());
    const selectLimitMock = vi.fn()
      // First call: idempotency check in donations table
      .mockResolvedValueOnce([])
      // Second call: intent lookup by partnerDonationId
      .mockResolvedValueOnce([]);

    const mediaInsertValues = vi.fn(() => ({
      onConflictDoUpdate: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
      })),
    }));

    const { db } = await import('@/db');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(db.transaction).mockImplementationOnce(async (callback: any) => {
      const insertMock = vi.fn()
        .mockReturnValueOnce({ values: mediaInsertValues })
        .mockReturnValueOnce({ values: donationInsertValues });

      return callback({
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: selectLimitMock,
            })),
          })),
        })),
        insert: insertMock,
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve()),
          })),
        })),
      } as unknown);
    });

    const payload = createMockPayload({ partnerDonationId: 'intent-missing' });
    const request = new NextRequest(
      'http://localhost:3000/api/webhooks/every-org',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${webhookToken}`,
        },
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(donationInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        partnerDonationId: 'intent-missing',
      })
    );
  });
});
