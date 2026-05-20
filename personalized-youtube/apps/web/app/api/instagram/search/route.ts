import { NextResponse } from 'next/server';
import { getInstagramSearchFeed } from '@/lib/instagram/client';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim() ?? '';
  if (q.length > 256) {
    return NextResponse.json({ ok: false, reason: 'invalid query' }, { status: 400 });
  }
  const result = await getInstagramSearchFeed(q);
  if (result.kind !== 'ok') {
    return NextResponse.json({ ok: false, reason: result.reason ?? 'unavailable' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, videos: result.videos, query: q || 'timeline' });
}
