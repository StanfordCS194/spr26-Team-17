import { NextResponse } from 'next/server';
import { getSlackBootstrap } from '@/lib/slack/client';
import { interceptUnavailable } from '@/lib/intercept/api-response';

export const runtime = 'nodejs';

export async function GET() {
  const result = await getSlackBootstrap();
  if (result.kind !== 'ok') {
    return interceptUnavailable(result.reason);
  }
  return NextResponse.json({ ok: true, meta: result.meta });
}
