import { NextResponse } from 'next/server';
import { getInstagramTimelineMore } from '@/lib/instagram/client';
import { INTERCEPT_TOKEN_MAX_LEN, interceptUnavailable } from '@/lib/intercept/api-response';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token')?.trim() ?? '';
  if (!token || token.length > INTERCEPT_TOKEN_MAX_LEN) {
    return NextResponse.json({ ok: false, reason: 'invalid token' }, { status: 400 });
  }
  const result = await getInstagramTimelineMore(token);
  if (result.kind !== 'ok') {
    return interceptUnavailable(result.reason);
  }
  return NextResponse.json({
    ok: true,
    videos: result.videos,
    continuation: result.continuation,
  });
}
