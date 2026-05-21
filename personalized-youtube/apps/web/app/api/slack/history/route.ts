import { NextResponse } from 'next/server';
import { getSlackChannelHistory } from '@/lib/slack/client';
import { interceptUnavailable } from '@/lib/intercept/api-response';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const channel = url.searchParams.get('channel')?.trim() ?? '';
  if (!channel || channel.length > 32) {
    return NextResponse.json({ ok: false, reason: 'invalid channel' }, { status: 400 });
  }
  const result = await getSlackChannelHistory(channel);
  if (result.kind !== 'ok') {
    return interceptUnavailable(result.reason);
  }
  return NextResponse.json({
    ok: true,
    videos: result.videos,
    continuation: result.continuation,
  });
}
