import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const mocks = vi.hoisted(() => {
  const exchangeCodeForSessionMock = vi.fn();
  const createClientMock = vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: exchangeCodeForSessionMock,
    },
  }));

  return { exchangeCodeForSessionMock, createClientMock };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClientMock,
}));

describe('auth callback route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exchanges auth code for a session when code is present', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback?code=abc123');

    const response = await GET(request);

    expect(mocks.exchangeCodeForSessionMock).toHaveBeenCalledWith('abc123');
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('redirects to provided safe next path', async () => {
    const request = new NextRequest(
      'http://localhost:3000/auth/callback?code=abc123&next=%2Fauth%2Fupdate-password'
    );

    const response = await GET(request);

    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/update-password');
  });

  it('falls back to home for external next URL', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback?next=https://evil.example');

    const response = await GET(request);

    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('falls back to home for protocol-relative next URL', async () => {
    const request = new NextRequest('http://localhost:3000/auth/callback?next=%2F%2Fevil.example');

    const response = await GET(request);

    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });
});
