import { NextResponse } from 'next/server';
import { getInstagramSearchFeed } from '@/lib/instagram/client';
import { INTERCEPT_QUERY_MAX_LEN, interceptUnavailable } from '@/lib/intercept/api-response';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  if (q.length > INTERCEPT_QUERY_MAX_LEN) {
    return NextResponse.json({ ok: false, reason: 'invalid query' }, { status: 400 });
  }
  const result = await getInstagramSearchFeed(q);
  if (result.kind !== 'ok') {
    return interceptUnavailable(result.reason);
  }
  return NextResponse.json({
    ok: true,
    videos: result.videos,
    query: q || 'timeline',
    continuation: result.continuation,
  });
}
