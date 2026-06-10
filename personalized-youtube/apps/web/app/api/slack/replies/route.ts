import { NextResponse } from 'next/server';
import { getSlackThreadReplies } from '@/lib/slack/client';
import { interceptUnavailable } from '@/lib/intercept/api-response';
import { isSlackChannelId, isSlackThreadTs } from '@/lib/intercept/slack-input';
import { slackRouteBlocked } from '@/lib/intercept/slack-api-route';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const blocked = slackRouteBlocked();
  if (blocked) return blocked;

  const url = new URL(req.url);
  const channel = url.searchParams.get('channel')?.trim() ?? '';
  const ts = url.searchParams.get('ts')?.trim() ?? '';
  if (!isSlackChannelId(channel) || !isSlackThreadTs(ts)) {
    return NextResponse.json({ ok: false, reason: 'invalid parameters' }, { status: 400 });
  }
  const result = await getSlackThreadReplies(channel, ts);
  if (result.kind !== 'ok') {
    return interceptUnavailable(result.reason);
  }
  return NextResponse.json({ ok: true, replies: result.replies });
}
