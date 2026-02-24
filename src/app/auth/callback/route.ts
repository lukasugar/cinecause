import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function getSafeNextPath(next: string | null) {
  if (!next) {
    return '/';
  }

  if (!next.startsWith('/') || next.startsWith('//')) {
    return '/';
  }

  return next;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(getSafeNextPath(next), requestUrl.origin));
}
