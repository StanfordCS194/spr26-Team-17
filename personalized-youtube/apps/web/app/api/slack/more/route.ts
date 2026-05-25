import { NextResponse } from 'next/server';
import { getSlackHistoryMore } from '@/lib/slack/client';
import { INTERCEPT_TOKEN_MAX_LEN, interceptUnavailable } from '@/lib/intercept/api-response';
import { slackRouteBlocked } from '@/lib/intercept/slack-api-route';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const blocked = slackRouteBlocked();
  if (blocked) return blocked;

  const url = new URL(req.url);
  const token = url.searchParams.get('token')?.trim() ?? '';
  if (!token || token.length > INTERCEPT_TOKEN_MAX_LEN) {
    return NextResponse.json({ ok: false, reason: 'invalid token' }, { status: 400 });
  }
  const result = await getSlackHistoryMore(token);
  if (result.kind !== 'ok') {
    return interceptUnavailable(result.reason);
  }
  return NextResponse.json({
    ok: true,
    videos: result.videos,
    continuation: result.continuation,
  });
}
