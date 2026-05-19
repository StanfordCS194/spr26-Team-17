const VISITOR_KEY_PREFIX = 'showcase:visitor:';

export function getStoredVisitorId(siteId: string): string | null {
  try {
    return window.localStorage.getItem(VISITOR_KEY_PREFIX + siteId);
  } catch {
    return null;
  }
}

export function storeVisitorId(siteId: string, visitorId: string) {
  try {
    window.localStorage.setItem(VISITOR_KEY_PREFIX + siteId, visitorId);
  } catch {
    /* ignore storage failures */
  }
}

export async function ensureInstallSession(apiBaseUrl: string, siteId: string): Promise<string> {
  const existing = getStoredVisitorId(siteId);
  const res = await fetch(`${apiBaseUrl}/api/install/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorId: existing }),
  });
  if (!res.ok) throw new Error(`Showcase install session failed: ${res.status}`);
  const data = (await res.json()) as { visitorId?: string };
  if (!data.visitorId) throw new Error('Showcase install session returned no visitorId');
  storeVisitorId(siteId, data.visitorId);
  return data.visitorId;
}
