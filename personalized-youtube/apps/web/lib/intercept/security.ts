// Shared security helpers for intercept adapters (Amazon, Instagram, YouTube).
//
// Matches the innertube tolerance contract:
//   - Cookie values are never logged or returned to clients.
//   - Upstream HTML/JSON bodies stay server-side.
//   - Public error strings are short and non-sensitive.

const PUBLIC_REASON_MAX = 120;

/** Mask a secret-ish string for server-side logs only. */
export function maskSecretForLog(s: string): string {
  if (s.length === 0) return '';
  if (s.length <= 4) return '*'.repeat(s.length);
  return `${s.slice(0, 2)}${'*'.repeat(Math.max(0, s.length - 4))}${s.slice(-2)}`;
}

/**
 * Strip sensitive upstream payloads before returning adapter errors to the browser.
 * Innertube already uses short reason codes; Amazon/IG must not forward HTML bodies.
 */
export function sanitizePublicReason(reason: string | undefined): string {
  if (!reason?.trim()) return 'unavailable';
  const trimmed = reason.trim();
  if (trimmed.length <= PUBLIC_REASON_MAX && !looksSensitive(trimmed)) {
    return trimmed;
  }
  if (looksSensitive(trimmed)) return 'intercept unavailable';
  return `${trimmed.slice(0, PUBLIC_REASON_MAX)}…`;
}

function looksSensitive(s: string): boolean {
  if (/<[a-z!/]/i.test(s)) return true;
  if (/sessionid|csrftoken|set-cookie|cookie:/i.test(s)) return true;
  if (/Bearer\s+\S/i.test(s)) return true;
  return false;
}

/** Log intercept failure details server-side without leaking secrets to the client. */
export function logInterceptFailure(scope: string, detail: string): void {
  const safe =
    detail.length > 240 ? `${maskSecretForLog(detail.slice(0, 120))}…(${detail.length} chars)` : detail;
  console.warn(`[${scope}] ${safe}`);
}

/** Block SSRF when fetching thumbnails for multimodal chat (OWASP A10). */
export function isAllowedOutboundImageUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    const allowedSuffixes = [
      '.googleusercontent.com',
      '.ytimg.com',
      '.ggpht.com',
      '.media-amazon.com',
      '.cdninstagram.com',
      '.fbcdn.net',
      '.slack-edge.com',
      '.slack.com',
      '.gravatar.com',
      '.pravatar.cc',
    ];
    return allowedSuffixes.some((s) => host.endsWith(s) || host === s.slice(1));
  } catch {
    return false;
  }
}

export function chatDebugEventsEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_DEVTOOLS_ENABLED === 'true';
  }
  return process.env.NEXT_PUBLIC_DEVTOOLS_ENABLED !== 'false';
}
