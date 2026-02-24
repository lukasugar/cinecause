import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { donations, donationIntents, profiles } from '@/db/schema';
import { DELETE, GET, PATCH } from '../route';

const mocks = vi.hoisted(() => {
  const getUserMock = vi.fn();
  const adminDeleteUserMock = vi.fn();
  const createAdminClientMock = vi.fn(() => ({
    auth: {
      admin: {
        deleteUser: adminDeleteUserMock,
      },
    },
  }));

  const selectLimitMock = vi.fn();
  const selectWhereMock = vi.fn(() => ({ limit: selectLimitMock }));
  const selectFromMock = vi.fn(() => ({ where: selectWhereMock }));
  const selectMock = vi.fn(() => ({ from: selectFromMock }));

  const insertReturningMock = vi.fn();
  const insertValuesMock = vi.fn(() => ({ returning: insertReturningMock }));
  const insertMock = vi.fn(() => ({ values: insertValuesMock }));

  const updateReturningMock = vi.fn();
  const updateWhereMock = vi.fn(() => ({ returning: updateReturningMock }));
  const updateSetMock = vi.fn(() => ({ where: updateWhereMock }));
  const updateMock = vi.fn(() => ({ set: updateSetMock }));

  const txProfileUpdateWhereMock = vi.fn();
  const txProfileUpdateSetMock = vi.fn(() => ({ where: txProfileUpdateWhereMock }));
  const txDonationsUpdateWhereMock = vi.fn();
  const txDonationsUpdateSetMock = vi.fn(() => ({ where: txDonationsUpdateWhereMock }));
  const txUpdateMock = vi.fn((table) => {
    if (table === profiles) {
      return { set: txProfileUpdateSetMock };
    }
    if (table === donations) {
      return { set: txDonationsUpdateSetMock };
    }
    return { set: vi.fn() };
  });

  const txDeleteWhereMock = vi.fn();
  const txDeleteMock = vi.fn((table) => {
    if (table === donationIntents) {
      return { where: txDeleteWhereMock };
    }
    return { where: vi.fn() };
  });
  const transactionMock = vi.fn(async (callback) =>
    callback({
      update: txUpdateMock,
      delete: txDeleteMock,
    })
  );

  return {
    getUserMock,
    adminDeleteUserMock,
    createAdminClientMock,
    selectLimitMock,
    selectMock,
    insertReturningMock,
    insertValuesMock,
    insertMock,
    updateReturningMock,
    updateSetMock,
    updateMock,
    txProfileUpdateSetMock,
    txDonationsUpdateSetMock,
    txDeleteWhereMock,
    transactionMock,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mocks.getUserMock,
    },
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: mocks.createAdminClientMock,
}));

vi.mock('@/db', () => ({
  db: {
    select: mocks.selectMock,
    insert: mocks.insertMock,
    update: mocks.updateMock,
    transaction: mocks.transactionMock,
  },
}));

describe('Profile API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.adminDeleteUserMock.mockResolvedValue({ error: null });
    mocks.selectLimitMock.mockResolvedValue([]);
  });

  it('returns 401 when user is not authenticated', async () => {
    mocks.getUserMock.mockResolvedValue({ data: { user: null } });

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it('creates default profile on first GET', async () => {
    mocks.getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.selectLimitMock.mockResolvedValueOnce([]);
    mocks.insertReturningMock.mockResolvedValueOnce([{ userId: 'user-1', isPublic: false }]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.insertValuesMock).toHaveBeenCalled();
    expect(body.profile.userId).toBe('user-1');
    expect(body.profile.isPublic).toBe(false);
  });

  it('returns 410 for GET when profile is deleted', async () => {
    mocks.selectLimitMock.mockResolvedValueOnce([
      { userId: 'user-1', deletedAt: new Date('2026-02-06T00:00:00.000Z') },
    ]);

    const response = await GET();

    expect(response.status).toBe(410);
  });

  it('updates profile privacy and display name on PATCH', async () => {
    mocks.getUserMock.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.selectLimitMock.mockResolvedValueOnce([{ userId: 'user-1', deletedAt: null }]);
    mocks.updateReturningMock.mockResolvedValueOnce([
      { userId: 'user-1', displayName: 'Luka', isPublic: true },
    ]);

    const request = new NextRequest('http://localhost:3000/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: 'Luka', isPublic: true }),
    });

    const response = await PATCH(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.updateSetMock).toHaveBeenCalled();
    expect(body.profile.displayName).toBe('Luka');
    expect(body.profile.isPublic).toBe(true);
  });

  it('returns 410 for PATCH when profile is deleted', async () => {
    mocks.selectLimitMock.mockResolvedValueOnce([
      { userId: 'user-1', deletedAt: new Date('2026-02-06T00:00:00.000Z') },
    ]);

    const request = new NextRequest('http://localhost:3000/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: 'Luka', isPublic: true }),
    });

    const response = await PATCH(request);

    expect(response.status).toBe(410);
    expect(mocks.updateSetMock).not.toHaveBeenCalled();
  });

  it('returns 401 on DELETE when unauthenticated', async () => {
    mocks.getUserMock.mockResolvedValue({ data: { user: null } });

    const response = await DELETE();

    expect(response.status).toBe(401);
  });

  it('marks profile deleted and sets deletedAt', async () => {
    const response = await DELETE();

    expect(response.status).toBe(200);
    expect(mocks.txProfileUpdateSetMock).toHaveBeenCalledTimes(1);
    expect(mocks.txProfileUpdateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: null,
        isPublic: false,
        deletedAt: expect.any(Date),
      })
    );
  });

  it('anonymizes donations for deleted account', async () => {
    const response = await DELETE();

    expect(response.status).toBe(200);
    expect(mocks.txDonationsUpdateSetMock).toHaveBeenCalledTimes(1);
    expect(mocks.txDonationsUpdateSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        donorFirstName: null,
        publicTestimony: null,
      })
    );
  });

  it('deletes donation intents for deleted account', async () => {
    const response = await DELETE();

    expect(response.status).toBe(200);
    expect(mocks.txDeleteWhereMock).toHaveBeenCalledTimes(1);
  });

  it('calls supabase admin deleteUser', async () => {
    const response = await DELETE();

    expect(response.status).toBe(200);
    expect(mocks.adminDeleteUserMock).toHaveBeenCalledWith('user-1');
  });
});
