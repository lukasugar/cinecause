import { NextRequest, NextResponse } from 'next/server';
import { searchNonprofits } from '@/lib/every-org-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json({ nonprofits: [] });
  }

  const nonprofits = await searchNonprofits(query);
  return NextResponse.json({ nonprofits });
}
