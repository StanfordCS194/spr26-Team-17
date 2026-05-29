/** Showcase surfaces the chat can navigate between. */
export const SHOWCASE_SITES = [
  { id: 'youtube', slug: 'youtube-clone', label: 'YouTube', path: '/' },
  { id: 'amazon', slug: 'amazon-storefront', label: 'Amazon', path: '/amazon' },
  { id: 'instagram', slug: 'instagram-feed', label: 'Instagram', path: '/instagram' },
  { id: 'slack', slug: 'slack-workspace', label: 'Slack', path: '/slack' },
] as const;

export type ShowcaseSiteId = (typeof SHOWCASE_SITES)[number]['id'];

export function siteById(id: string) {
  return SHOWCASE_SITES.find((s) => s.id === id);
}

export function siteBySlug(slug: string) {
  return SHOWCASE_SITES.find((s) => s.slug === slug);
}

export function siteByPath(path: string) {
  const p = path === '' ? '/' : path;
  return SHOWCASE_SITES.find((s) => s.path === p);
}

// ── Dynamically-opened sites ────────────────────────────────────────────────
// A visitor can ask the chat to "open <url>" and we mount it as a new tab.
// These tabs are NOT in SHOWCASE_SITES (they're created at runtime) and they
// carry their own synthetic slug so the chat / store / bridge can address them.
// The slug encodes the source URL so the server can rebuild the page on demand
// without a DB row. We only ever ingest the URL's PUBLIC content — never any
// browser session, cookie, or token for the target domain.

export const OPEN_SITE_PREFIX = 'open:';
export const OPEN_SITE_PATH = '/open';

function base64UrlEncode(input: string): string {
  const b64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(input, 'utf8').toString('base64')
      : btoa(unescape(encodeURIComponent(input)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  return typeof Buffer !== 'undefined'
    ? Buffer.from(b64, 'base64').toString('utf8')
    : decodeURIComponent(escape(atob(b64)));
}

/** Coerce user input into a safe absolute http(s) URL, or null if unusable. */
export function normalizeOpenUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!u.hostname.includes('.')) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** A friendly default label for an opened URL (the bare hostname). */
export function openSiteLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Site';
  }
}

export function encodeOpenSiteSlug(url: string): string {
  return `${OPEN_SITE_PREFIX}${base64UrlEncode(url)}`;
}

export function isOpenSiteSlug(slug: string): boolean {
  return slug.startsWith(OPEN_SITE_PREFIX);
}

/** Recover the source URL from a synthetic open-site slug (null if invalid). */
export function decodeOpenSiteSlug(slug: string): string | null {
  if (!isOpenSiteSlug(slug)) return null;
  try {
    const url = base64UrlDecode(slug.slice(OPEN_SITE_PREFIX.length));
    return normalizeOpenUrl(url);
  } catch {
    return null;
  }
}

/** Route the client navigates to when opening a URL as a tab. */
export function openSitePath(url: string, label?: string): string {
  const params = new URLSearchParams({ u: url });
  if (label) params.set('label', label);
  return `${OPEN_SITE_PATH}?${params.toString()}`;
}
