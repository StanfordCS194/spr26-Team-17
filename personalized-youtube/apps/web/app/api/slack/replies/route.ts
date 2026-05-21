import { NextResponse } from 'next/server';
import { getSlackThreadReplies } from '@/lib/slack/client';
import { interceptUnavailable } from '@/lib/intercept/api-response';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const channel = url.searchParams.get('channel')?.trim() ?? '';
  const ts = url.searchParams.get('ts')?.trim() ?? '';
  if (!channel || channel.length > 32 || !ts || ts.length > 32) {
    return NextResponse.json({ ok: false, reason: 'invalid parameters' }, { status: 400 });
  }
  const result = await getSlackThreadReplies(channel, ts);
  if (result.kind !== 'ok') {
    return interceptUnavailable(result.reason);
  }
  return NextResponse.json({ ok: true, replies: result.replies });
}
