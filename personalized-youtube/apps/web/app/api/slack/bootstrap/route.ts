import { NextResponse } from 'next/server';
import { getSlackBootstrap } from '@/lib/slack/client';
import { interceptUnavailable } from '@/lib/intercept/api-response';
import { slackRouteBlocked } from '@/lib/intercept/slack-api-route';

export const runtime = 'nodejs';

export async function GET() {
  const blocked = slackRouteBlocked();
  if (blocked) return blocked;

  const result = await getSlackBootstrap();
  if (result.kind !== 'ok') {
    return interceptUnavailable(result.reason);
  }
  return NextResponse.json({ ok: true, meta: result.meta });
}
