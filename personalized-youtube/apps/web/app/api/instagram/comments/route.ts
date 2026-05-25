import { NextResponse } from 'next/server';
import { getInstagramMediaComments } from '@/lib/instagram/client';
import { interceptUnavailable } from '@/lib/intercept/api-response';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id')?.trim() ?? '';
  if (!id || id.length > 64) {
    return NextResponse.json({ ok: false, reason: 'invalid id' }, { status: 400 });
  }
  const result = await getInstagramMediaComments(id);
  if (result.kind !== 'ok') {
    return interceptUnavailable(result.reason);
  }
  return NextResponse.json({
    ok: true,
    comments: result.comments,
    total: result.total,
  });
}
