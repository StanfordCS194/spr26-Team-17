// Slack intercept input validation (shared by API routes + client).

/** Slack channel / conversation id (C…, D…, G…, W…). */
export function isSlackChannelId(id: string): boolean {
  return /^[CDGW][A-Z0-9]{8,11}$/.test(id.trim());
}

/** Slack user / member id (U…, W… for Slack Connect guests). */
export function isSlackUserId(id: string): boolean {
  return /^[UW][A-Z0-9]{8,15}$/.test(id.trim());
}

/** Thread root timestamp from Slack (e.g. 1715628123.456789). */
export function isSlackThreadTs(ts: string): boolean {
  return /^\d{10,16}\.\d{6,9}$/.test(ts.trim());
}

/** Slack API pagination cursor (opaque string from response_metadata). */
export function isSlackListCursor(cursor: string): boolean {
  const c = cursor.trim();
  return c.length > 0 && c.length <= 512 && /^[A-Za-z0-9+/=_-]+$/.test(c);
}

export type SlackHistoryContinuation = { channel: string; cursor: string };

/** Parse our base64url history continuation token (server-issued only). */
export function parseSlackHistoryContinuation(token: string): SlackHistoryContinuation | null {
  const raw = token.trim();
  if (!raw || raw.length > 4096) return null;
  try {
    const decoded = Buffer.from(raw, 'base64url').toString('utf8');
    if (decoded.length > 512) return null;
    const parsed = JSON.parse(decoded) as { channel?: unknown; cursor?: unknown };
    const channel = typeof parsed.channel === 'string' ? parsed.channel.trim() : '';
    const cursor = typeof parsed.cursor === 'string' ? parsed.cursor.trim() : '';
    if (!isSlackChannelId(channel) || !isSlackListCursor(cursor)) return null;
    return { channel, cursor };
  } catch {
    return null;
  }
}
