// Public-page ingestion for the "open any link as a tab" flow.
//
// SECURITY CONTRACT — this is deliberately NOT modelled on the Amazon/Instagram/
// Slack intercept adapters:
//   - We fetch ONLY the target URL's PUBLIC, unauthenticated HTML. No browser
//     cookies, session tokens, or credentials for the target domain are read,
//     sent, or replayed. `credentials` is never set; redirects are followed but
//     re-validated against the SSRF allowlist.
//   - SSRF-guarded: localhost / private / link-local / metadata hosts are blocked
//     (OWASP A10), matching the spirit of intercept/security.ts.
//   - Upstream HTML never leaves the server; only derived titles + image URLs do.
//
// Output is a small set of "cards" derived from OpenGraph tags, headings, links
// and images — enough to populate a personalizable grid. Callers blend this with
// the mock catalog so the tab always looks full even for sparse pages.

import { isIP } from 'node:net';

export interface IngestedCard {
  title: string;
  thumbnail: string; // absolute https URL, or '' when none found
  href: string;
  description: string;
}

export type ContentKind = 'article' | 'product' | 'social' | 'video' | 'generic';

export interface IngestResult {
  kind: 'ok';
  siteName: string;
  title: string;
  description: string;
  favicon: string;
  /** Brand color from <meta name="theme-color"> (#rrggbb) or null. */
  themeColor: string | null;
  /** Coarse page kind, used to pick a matching layout. */
  contentKind: ContentKind;
  cards: IngestedCard[];
}

export interface IngestFailure {
  kind: 'unavailable';
  reason: string;
}

const FETCH_TIMEOUT_MS = 6000;
const MAX_BYTES = 2_500_000; // 2.5 MB HTML cap
const MAX_CARDS = 36;

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  if (host === 'localhost' || host.endsWith('.localhost')) return true;
  if (host.endsWith('.local') || host.endsWith('.internal')) return true;
  if (host === 'metadata.google.internal') return true;

  if (isIP(host)) {
    // IPv4 private / loopback / link-local / metadata ranges.
    if (
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^0\./.test(host)
    ) {
      return true;
    }
    const m = /^172\.(\d+)\./.exec(host);
    if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return true;
    // IPv6 loopback / unique-local / link-local.
    if (host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80')) {
      return true;
    }
  }
  return false;
}

function safeUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (isBlockedHost(u.hostname)) return null;
    return u;
  } catch {
    return null;
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

function metaContent(html: string, ...keys: string[]): string {
  for (const key of keys) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`,
      'i',
    );
    const m = re.exec(html) ?? new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`,
      'i',
    ).exec(html);
    if (m?.[1]) return decodeEntities(m[1]);
  }
  return '';
}

function absolute(base: URL, href: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return '';
  }
}

/** Normalize a CSS color (hex 3/6 or rgb()) to #rrggbb, else null. */
function normalizeColor(raw: string | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  const hex6 = /^#([0-9a-f]{6})$/.exec(s);
  if (hex6) return `#${hex6[1]}`;
  const hex3 = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(s);
  if (hex3) return `#${hex3[1]}${hex3[1]}${hex3[2]}${hex3[2]}${hex3[3]}${hex3[3]}`;
  const rgb = /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(s);
  if (rgb) {
    const to2 = (n: string) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, '0');
    return `#${to2(rgb[1]!)}${to2(rgb[2]!)}${to2(rgb[3]!)}`;
  }
  return null;
}

/** Pick the best favicon/app icon link, preferring larger app icons. */
function pickIcon(html: string, base: URL): string {
  const candidates: Array<{ href: string; score: number }> = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/rel=["'][^"']*icon[^"']*["']/i.test(tag)) continue;
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href) continue;
    const abs = absolute(base, href);
    if (!abs || !/^https?:\/\//.test(abs)) continue;
    let score = 1;
    if (/apple-touch-icon/i.test(tag)) score += 4;
    const size = /sizes=["'](\d+)/i.exec(tag)?.[1];
    if (size) score += Math.min(3, Number(size) / 64);
    if (/\.svg(\?|$)/i.test(abs)) score += 2; // crisp at any size
    if (/\.png(\?|$)/i.test(abs)) score += 1;
    candidates.push({ href: abs, score });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.href ?? absolute(base, '/favicon.ico');
}

function classifyContent(html: string, ogType: string, imageCount: number): ContentKind {
  const t = ogType.toLowerCase();
  if (t.includes('article') || t.includes('news')) return 'article';
  if (t.includes('product')) return 'product';
  if (t.includes('profile') || t.includes('video.other')) return 'social';
  if (t.startsWith('video')) return 'video';
  if (/property=["']product:price|itemprop=["']price|add to cart/i.test(html)) return 'product';
  if (/<article[\s>]/i.test(html) && imageCount < 6) return 'article';
  return 'generic';
}

function collectImages(html: string, base: URL): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string) => {
    const abs = absolute(base, raw);
    if (!abs || !/^https?:\/\//.test(abs)) return;
    if (/\.svg(\?|$)/i.test(abs)) return; // skip vector logos/sprites
    if (seen.has(abs)) return;
    seen.add(abs);
    out.push(abs);
  };

  for (const m of html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)[^>]*content=["']([^"']+)["']/gi)) {
    if (m[1]) push(m[1]);
  }
  for (const m of html.matchAll(/<img[^>]+(?:data-src|src)=["']([^"']+)["']/gi)) {
    if (m[1]) push(m[1]);
    if (out.length >= MAX_CARDS * 2) break;
  }
  return out;
}

function collectLinks(html: string, base: URL): Array<{ href: string; text: string }> {
  const out: Array<{ href: string; text: string }> = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/<a[^>]+href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = absolute(base, m[1] ?? '');
    const text = decodeEntities((m[2] ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
    if (!href || !/^https?:\/\//.test(href)) continue;
    if (text.length < 8 || text.length > 120) continue;
    if (seen.has(href)) continue;
    seen.add(href);
    out.push({ href, text });
    if (out.length >= MAX_CARDS) break;
  }
  return out;
}

export async function ingestPublicPage(rawUrl: string): Promise<IngestResult | IngestFailure> {
  const target = safeUrl(rawUrl);
  if (!target) return { kind: 'unavailable', reason: 'invalid or disallowed URL' };

  let html: string;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(target.toString(), {
      signal: ctrl.signal,
      redirect: 'follow',
      // Never attach ambient credentials for the target origin.
      headers: {
        'User-Agent': 'ShowcaseBot/1.0 (+personalization preview)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timer);

    // Re-validate the post-redirect URL against the SSRF allowlist.
    if (!safeUrl(res.url || target.toString())) {
      return { kind: 'unavailable', reason: 'redirected to a disallowed host' };
    }
    const ct = (res.headers.get('content-type') ?? '').toLowerCase();
    if (!res.ok) return { kind: 'unavailable', reason: `fetch failed (HTTP ${res.status})` };
    if (!ct.includes('html')) return { kind: 'unavailable', reason: 'target is not an HTML page' };

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      html = Buffer.from(buf.slice(0, MAX_BYTES)).toString('utf8');
    } else {
      html = Buffer.from(buf).toString('utf8');
    }
  } catch (err) {
    const msg = (err as Error).name === 'AbortError' ? 'timed out' : 'network error';
    return { kind: 'unavailable', reason: `could not load page (${msg})` };
  }

  const base = safeUrl(rawUrl)!;
  const siteName = metaContent(html, 'og:site_name') || base.hostname.replace(/^www\./, '');
  const titleTag = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '';
  const title = metaContent(html, 'og:title', 'twitter:title') || decodeEntities(titleTag) || siteName;
  const description = metaContent(html, 'og:description', 'twitter:description', 'description');
  const favicon = pickIcon(html, base);
  const themeColor = normalizeColor(metaContent(html, 'theme-color'));

  const images = collectImages(html, base);
  const links = collectLinks(html, base);
  const contentKind = classifyContent(html, metaContent(html, 'og:type'), images.length);

  const cards: IngestedCard[] = [];
  const seenTitles = new Set<string>();
  const linkCount = Math.min(links.length, MAX_CARDS);
  for (let i = 0; i < Math.max(linkCount, Math.min(images.length, MAX_CARDS)); i++) {
    const link = links[i];
    const cardTitle = (link?.text ?? title).slice(0, 140);
    const key = cardTitle.toLowerCase();
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);
    cards.push({
      title: cardTitle,
      thumbnail: images[i] ?? images[0] ?? '',
      href: link?.href ?? base.toString(),
      description: '',
    });
    if (cards.length >= MAX_CARDS) break;
  }

  return { kind: 'ok', siteName, title, description, favicon, themeColor, contentKind, cards };
}
