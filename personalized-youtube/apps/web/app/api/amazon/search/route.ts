import { NextResponse } from 'next/server';
import { getAmazonSearchFeed } from '@/lib/amazon/client';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  const result = await getAmazonSearchFeed(q || undefined);
  if (result.kind !== 'ok') {
    return NextResponse.json({ ok: false, reason: result.reason ?? 'unavailable' }, { status: 502 });
  }
  return NextResponse.json({
    ok: true,
    videos: result.videos,
    query: q || process.env.AMAZON_SEARCH_QUERY?.trim() || 'best sellers',
  });
}
