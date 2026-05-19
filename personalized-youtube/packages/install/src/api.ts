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

export async function loadInstallPatches(apiBaseUrl: string, siteId: string, visitorId: string): Promise<unknown[]> {
  const url = new URL(`${apiBaseUrl}/api/install/page`);
  url.searchParams.set('siteId', siteId);
  url.searchParams.set('visitorId', visitorId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Showcase install page load failed: ${res.status}`);
  const data = (await res.json()) as { patches?: unknown[] };
  return Array.isArray(data.patches) ? data.patches : [];
}

export async function resetInstallPreferences(apiBaseUrl: string, siteId: string, visitorId: string): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/api/install/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteId, visitorId }),
  });
  if (!res.ok) throw new Error(`Showcase install reset failed: ${res.status}`);
}
