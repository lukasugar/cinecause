import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

const mocks = vi.hoisted(() => {
  const getUserMock = vi.fn();
  const selectLimitMock = vi.fn();
  const selectWhereMock = vi.fn(() => ({ limit: selectLimitMock }));
  const selectFromMock = vi.fn(() => ({ where: selectWhereMock }));
  const selectMock = vi.fn(() => ({ from: selectFromMock }));
  const insertValuesMock = vi.fn();
  const insertMock = vi.fn(() => ({ values: insertValuesMock }));
  return { getUserMock, selectLimitMock, selectMock, insertValuesMock, insertMock };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mocks.getUserMock,
    },
  })),
}));

vi.mock('@/db', () => ({
  db: {
    select: mocks.selectMock,
    insert: mocks.insertMock,
  },
}));

describe('create donation link API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
    mocks.selectLimitMock.mockResolvedValue([]);
  });

  it('returns url without partner_donation_id for signed-out users', async () => {
    mocks.getUserMock.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest('http://localhost:3000/api/donations/create-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tmdbId: 550,
        mediaType: 'movie',
        title: 'Fight Club',
      }),
    });

    const response = await POST(request);
    const body = await response.json();
    const url = new URL(body.url);

    expect(response.status).toBe(200);
    expect(url.searchParams.get('partner_donation_id')).toBeNull();
    expect(mocks.insertValuesMock).not.toHaveBeenCalled();
  });

  it('creates donation intent and includes partner_donation_id for signed-in users', async () => {
    mocks.getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.selectLimitMock.mockResolvedValueOnce([{ userId: 'user-1', deletedAt: null }]);
    mocks.insertValuesMock.mockResolvedValue(undefined);
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('intent-123');

    const request = new NextRequest('http://localhost:3000/api/donations/create-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tmdbId: 550,
        mediaType: 'movie',
        title: 'Fight Club',
      }),
    });

    const response = await POST(request);
    const body = await response.json();
    const url = new URL(body.url);

    expect(response.status).toBe(200);
    expect(mocks.insertValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'intent-123',
        userId: 'user-1',
        tmdbId: 550,
        mediaType: 'movie',
        title: 'Fight Club',
      })
    );
    expect(url.searchParams.get('partner_donation_id')).toBe('intent-123');
  });

  it('returns 403 for create-link when profile has deletedAt set', async () => {
    mocks.getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.selectLimitMock.mockResolvedValueOnce([
      { userId: 'user-1', deletedAt: new Date('2026-02-06T00:00:00.000Z') },
    ]);

    const request = new NextRequest('http://localhost:3000/api/donations/create-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tmdbId: 550,
        mediaType: 'movie',
        title: 'Fight Club',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(mocks.insertValuesMock).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid payload', async () => {
    const request = new NextRequest('http://localhost:3000/api/donations/create-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Missing required fields' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
