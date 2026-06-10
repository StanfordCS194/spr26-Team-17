import { NextResponse } from 'next/server';
import { sanitizePublicReason } from './security';

/** Standard 502 for intercept adapter failures (matches /api/yt/* posture). */
export function interceptUnavailable(reason?: string, status = 502): NextResponse {
  return NextResponse.json({ ok: false, reason: sanitizePublicReason(reason) }, { status });
}

export const INTERCEPT_QUERY_MAX_LEN = 256;
export const INTERCEPT_TOKEN_MAX_LEN = 4096;
