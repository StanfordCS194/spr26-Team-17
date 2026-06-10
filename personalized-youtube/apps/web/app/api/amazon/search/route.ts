import { NextResponse } from 'next/server';
import { getAmazonSearchFeed } from '@/lib/amazon/client';
import { INTERCEPT_QUERY_MAX_LEN, interceptUnavailable } from '@/lib/intercept/api-response';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  if (q.length > INTERCEPT_QUERY_MAX_LEN) {
    return NextResponse.json({ ok: false, reason: 'invalid query' }, { status: 400 });
  }
  const result = await getAmazonSearchFeed(q || undefined);
  if (result.kind !== 'ok') {
    return interceptUnavailable(result.reason);
  }
  return NextResponse.json({
    ok: true,
    videos: result.videos,
    query: q || process.env.AMAZON_SEARCH_QUERY?.trim() || 'best sellers',
    continuation: result.continuation,
  });
}
