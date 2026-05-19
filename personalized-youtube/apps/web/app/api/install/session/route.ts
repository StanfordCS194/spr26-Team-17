import type { NextRequest } from 'next/server';
import { ensureInstallVisitor, installJson, optionsResponse } from '../_shared';

export const runtime = 'nodejs';

export function OPTIONS(req: NextRequest) {
  return optionsResponse(req);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { visitorId?: string };
  const visitorId = typeof body.visitorId === 'string' && body.visitorId.length > 0
    ? body.visitorId
    : crypto.randomUUID();
  await ensureInstallVisitor(visitorId);
  return installJson(req, { visitorId });
}
