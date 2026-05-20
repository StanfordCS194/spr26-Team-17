import { NextResponse } from 'next/server';
import { getAmazonSearchMore } from '@/lib/amazon/client';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token')?.trim() ?? '';
  if (!token || token.length > 4096) {
    return NextResponse.json({ ok: false, reason: 'invalid token' }, { status: 400 });
  }
  const result = await getAmazonSearchMore(token);
  if (result.kind !== 'ok') {
    return NextResponse.json({ ok: false, reason: result.reason ?? 'unavailable' }, { status: 502 });
  }
  return NextResponse.json({
    ok: true,
    videos: result.videos,
    continuation: result.continuation,
  });
}
