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
// Output is (a) a small set of "cards" derived from OpenGraph tags, headings,
// links and images, and (b) a FrontendProfile inferred from the site's own
// HTML/CSS (mode, brand color, font, radius, grid) so the opened tab can follow
// the real site's look. Only the site's OWN content is used — no mock padding.

import { isIP } from 'node:net';

export interface IngestedCard {
  title: string;
  thumbnail: string; // absolute https URL, or '' when none found
  href: string;
  description: string;
}

export type ContentKind = 'article' | 'product' | 'social' | 'video' | 'generic';

// What we infer about the target site's actual frontend, by reading its HTML +
// CSS (inline styles plus a couple of its linked stylesheets). Used to make the
// opened tab follow the real site's look rather than a one-size preset.
export interface FrontendProfile {
  mode: 'light' | 'dark';
  /** Primary brand/CTA color (#rrggbb) or null when undetectable. */
  accent: string | null;
  /** Detected body font, mapped to a supported font key (e.g. 'inter'). */
  fontKey: string;
  radius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Grid column count read from the site's CSS, or null when unknown. */
  columns: 2 | 3 | 4 | 5 | null;
}

export interface NavLink {
  label: string;
  href: string;
}

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
  /** Inferred frontend look (colors, mode, font, radius, grid). */
  frontend: FrontendProfile;
  /** True when the page allows being embedded in an <iframe> (no XFO/CSP block). */
  embeddable: boolean;
  /** URL after following redirects (what an iframe would actually load). */
  finalUrl: string;
  /** Primary navigation labels lifted from the page's <nav>/header. */
  nav: NavLink[];
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

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return null;
  return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)];
}

function relLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const [r, g, b] = rgb.map((c) => c / 255) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// A color reads as a "brand accent" only if it's reasonably saturated and not
// near-white/near-black — so we don't pick the page background or text color.
function isVividAccent(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const [r, g, b] = rgb.map((c) => c / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
  return s > 0.3 && l > 0.2 && l < 0.85;
}

// Tally every vivid color in the supplied text (CSS values, inline styles, and
// legacy bgcolor attributes). The brand color is usually the most-repeated
// vivid color, so frequency is a good signal when there's no named brand var.
function vividColorCounts(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  const add = (raw: string | undefined) => {
    const c = normalizeColor(raw);
    if (c && isVividAccent(c)) counts.set(c, (counts.get(c) ?? 0) + 1);
  };
  for (const m of text.matchAll(/#[0-9a-fA-F]{6}\b/g)) add(m[0]);
  for (const m of text.matchAll(/#[0-9a-fA-F]{3}\b/g)) add(m[0]);
  for (const m of text.matchAll(/rgba?\([^)]+\)/gi)) add(m[0]);
  return counts;
}

function topColor(counts: Map<string, number>): string | null {
  let best: string | null = null;
  let bestN = 0;
  for (const [c, n] of counts) {
    if (n > bestN) {
      best = c;
      bestN = n;
    }
  }
  return best;
}

// Map a CSS font-family string to one of our supported font keys.
function mapFont(familyRaw: string): string {
  const f = familyRaw.toLowerCase();
  if (/\binter\b/.test(f)) return 'inter';
  if (/geist/.test(f)) return 'geist';
  if (/space grotesk/.test(f)) return 'space-grotesk';
  if (/(poppins|montserrat|dm sans|work sans|nunito|manrope|rubik|figtree|sora|outfit|plus jakarta)/.test(f))
    return 'space-grotesk';
  if (/fraunces/.test(f)) return 'fraunces';
  if (/(playfair|dm serif|bodoni)/.test(f)) return 'dm-serif';
  if (/(merriweather|newsreader|source serif|noto serif)/.test(f)) return 'newsreader';
  if (/(lora|pt serif|libre baskerville)/.test(f)) return 'lora';
  if (/(jetbrains|ibm plex mono|consolas|menlo|sf mono|monospace)/.test(f)) return 'jetbrains';
  if (/(georgia|times|garamond|cormorant)/.test(f) || (/\bserif\b/.test(f) && !/sans-serif/.test(f)))
    return 'lora';
  return 'inter';
}

function inlineCss(html: string): string {
  let out = '';
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) out += `\n${m[1] ?? ''}`;
  for (const m of html.matchAll(/style=["']([^"']+)["']/gi)) out += `\n*{${m[1] ?? ''}}`;
  return out;
}

const CSS_FETCH_TIMEOUT_MS = 3500;
const CSS_MAX_BYTES = 400_000;

async function fetchText(url: string): Promise<string> {
  const safe = safeUrl(url);
  if (!safe) return '';
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), CSS_FETCH_TIMEOUT_MS);
    const res = await fetch(safe.toString(), {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'ShowcaseBot/1.0 (+personalization preview)', Accept: 'text/css,*/*' },
    });
    clearTimeout(timer);
    if (!res.ok || !safeUrl(res.url || safe.toString())) return '';
    const buf = await res.arrayBuffer();
    return Buffer.from(buf.slice(0, CSS_MAX_BYTES)).toString('utf8');
  } catch {
    return '';
  }
}

// Fetch up to 2 of the page's linked stylesheets so color/font/radius detection
// works even when a site ships its CSS in external files (most do).
async function fetchStylesheets(html: string, base: URL): Promise<string> {
  const hrefs: string[] = [];
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/rel=["'][^"']*stylesheet[^"']*["']/i.test(tag)) continue;
    const href = /href=["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href) continue;
    const abs = absolute(base, href);
    if (abs && /^https?:\/\//.test(abs) && safeUrl(abs)) hrefs.push(abs);
    if (hrefs.length >= 2) break;
  }
  const parts = await Promise.all(hrefs.map(fetchText));
  return parts.join('\n');
}

function firstColorVar(css: string, names: string[]): string | null {
  for (const name of names) {
    const re = new RegExp(`--${name}\\s*:\\s*(#[0-9a-fA-F]{3,6}|rgba?\\([^)]+\\))`, 'i');
    const m = re.exec(css);
    const c = normalizeColor(m?.[1]);
    if (c) return c;
  }
  return null;
}

function analyzeFrontend(
  html: string,
  css: string,
  themeColor: string | null,
  contentKind: ContentKind,
): FrontendProfile {
  const all = `${css}\n${inlineCss(html)}`;

  // ── Background + light/dark mode ──────────────────────────────────────────
  const bgVar =
    firstColorVar(all, ['background', 'bg', 'body-bg', 'page-bg', 'surface', 'color-background', 'background-primary']) ??
    normalizeColor(/(?:body|html|:root)\s*\{[^}]*?background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/i.exec(all)?.[1]);
  const htmlTag = /<html\b[^>]*>/i.exec(html)?.[0] ?? '';
  const declaresDark =
    /data-theme=["']dark|class=["'][^"']*\bdark\b|color-scheme["'][^>]*content=["'][^"']*\bdark\b(?![^"']*light)/i.test(
      `${htmlTag} ${metaContent(html, 'color-scheme')}`,
    );
  let mode: 'light' | 'dark' = 'light';
  if (bgVar) mode = relLuminance(bgVar) < 0.4 ? 'dark' : 'light';
  else if (declaresDark) mode = 'dark';

  // ── Accent / brand color ──────────────────────────────────────────────────
  // 1) a named brand/primary CSS var (most reliable),
  // 2) else theme-color if it's vivid,
  // 3) else the most-repeated vivid color across CSS + inline + bgcolor attrs.
  const namedAccent = firstColorVar(all, [
    'accent', 'primary', 'color-primary', 'brand', 'brand-primary', 'brand-color',
    'cta', 'color-accent', 'accent-color', 'interactive', 'link', 'color-link',
  ]);
  let accent: string | null = null;
  if (namedAccent && isVividAccent(namedAccent)) accent = namedAccent;
  else if (themeColor && isVividAccent(themeColor)) accent = themeColor;
  else {
    const bgcolors = [...html.matchAll(/bgcolor=["']?(#[0-9a-fA-F]{3,6})/gi)].map((m) => m[1]).join(' ');
    accent = topColor(vividColorCounts(`${all}\n${bgcolors}`)) ?? themeColor;
  }

  // ── Font family ───────────────────────────────────────────────────────────
  // Google Fonts link wins (it's almost always the real display font). Else
  // pick the most-declared family, ignoring monospace unless it's the only one
  // (code blocks shouldn't make the whole page mono).
  let fontKey = 'inter';
  const gfont = /fonts\.googleapis\.com\/css2?\?family=([^:&"']+)/i.exec(html)?.[1];
  if (gfont) {
    fontKey = mapFont(decodeURIComponent(gfont.replace(/\+/g, ' ')));
  } else {
    const fontCounts = new Map<string, number>();
    for (const m of all.matchAll(/font-family\s*:\s*([^;}{]+)/gi)) {
      const key = mapFont(m[1] ?? '');
      fontCounts.set(key, (fontCounts.get(key) ?? 0) + 1);
    }
    if (fontCounts.size > 1) fontCounts.delete('jetbrains');
    let bestN = 0;
    for (const [key, n] of fontCounts) {
      if (n > bestN) {
        fontKey = key;
        bestN = n;
      }
    }
  }

  // ── Corner radius ─────────────────────────────────────────────────────────
  const radii: number[] = [];
  for (const m of all.matchAll(/border-radius\s*:\s*(\d+(?:\.\d+)?)px/gi)) {
    const v = Number(m[1]);
    if (v >= 0 && v <= 40) radii.push(v);
  }
  let radius: FrontendProfile['radius'] = 'lg';
  if (radii.length) {
    radii.sort((a, b) => a - b);
    const med = radii[Math.floor(radii.length / 2)]!;
    radius = med <= 1 ? 'none' : med <= 5 ? 'sm' : med <= 9 ? 'md' : med <= 16 ? 'lg' : 'xl';
  }

  // ── Grid columns ──────────────────────────────────────────────────────────
  let columns: FrontendProfile['columns'] = null;
  const rep = /grid-template-columns\s*:\s*repeat\(\s*(\d+)/i.exec(all)?.[1];
  if (rep) columns = Math.max(2, Math.min(5, Number(rep))) as FrontendProfile['columns'];

  // contentKind nudges defaults when CSS was silent.
  if (columns === null && contentKind === 'article') columns = 2;

  return { mode, accent, fontKey, radius, columns };
}

// True when the (possibly redirected) page is a login/auth wall rather than
// real public content — e.g. docs.google.com → accounts.google.com sign-in.
// There's nothing public to mirror in that case, so we surface it honestly.
function isAuthWall(finalUrl: string, html: string, title: string): boolean {
  let host = '';
  let path = '';
  try {
    const u = new URL(finalUrl);
    host = u.hostname.toLowerCase();
    path = u.pathname.toLowerCase();
  } catch {
    /* ignore */
  }
  if (/(^|\.)accounts\.google\.com$|(^|\.)login\.|(^|\.)signin\.|(^|\.)auth\./.test(host)) return true;
  if (/\/(login|signin|sign-in|sso|oauth|session\/new)(\/|$)/.test(path)) return true;
  const t = title.toLowerCase();
  const hasPassword = /<input[^>]+type=["']password["']/i.test(html);
  if (hasPassword && /\bsign in\b|\blog ?in\b/.test(t)) return true;
  return false;
}

// Can the page be shown inside our <iframe>? False when it sends a blocking
// X-Frame-Options or a restrictive CSP frame-ancestors directive.
function isEmbeddable(xfo: string | null, csp: string | null): boolean {
  if (xfo) {
    const v = xfo.toLowerCase();
    if (v.includes('deny') || v.includes('sameorigin')) return false;
  }
  if (csp) {
    const m = /frame-ancestors([^;]*)/i.exec(csp);
    if (m) {
      const val = (m[1] ?? '').trim().toLowerCase();
      if (val.includes("'none'")) return false;
      if (!val.includes('*')) return false; // explicit allow-list → assume not us
    }
  }
  return true;
}

function collectNav(html: string, base: URL): NavLink[] {
  const block =
    /<nav\b[^>]*>([\s\S]*?)<\/nav>/i.exec(html)?.[1] ??
    /<header\b[^>]*>([\s\S]*?)<\/header>/i.exec(html)?.[1] ??
    '';
  const out: NavLink[] = [];
  const seen = new Set<string>();
  for (const m of block.matchAll(/<a[^>]+href=["']([^"'#]*)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const text = decodeEntities((m[2] ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
    if (text.length < 2 || text.length > 22) continue;
    const href = absolute(base, m[1] ?? '');
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label: text, href: /^https?:\/\//.test(href) ? href : base.toString() });
    if (out.length >= 6) break;
  }
  return out;
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
  let finalUrl = target.toString();
  let embeddable = true;
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
    finalUrl = res.url || target.toString();

    // Re-validate the post-redirect URL against the SSRF allowlist.
    if (!safeUrl(finalUrl)) {
      return { kind: 'unavailable', reason: 'redirected to a disallowed host' };
    }
    const ct = (res.headers.get('content-type') ?? '').toLowerCase();
    if (!res.ok) return { kind: 'unavailable', reason: `fetch failed (HTTP ${res.status})` };
    if (!ct.includes('html')) return { kind: 'unavailable', reason: 'target is not an HTML page' };

    embeddable = isEmbeddable(res.headers.get('x-frame-options'), res.headers.get('content-security-policy'));

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

  // A login wall has no public content to mirror — say so rather than dressing
  // up sign-in links as a content grid.
  if (isAuthWall(finalUrl, html, title)) {
    return { kind: 'unavailable', reason: 'requires sign-in' };
  }

  const images = collectImages(html, base);
  const links = collectLinks(html, base);
  const contentKind = classifyContent(html, metaContent(html, 'og:type'), images.length);

  const nav = collectNav(html, base);

  // Read the site's own CSS to follow its real frontend (colors/mode/font/grid).
  const externalCss = await fetchStylesheets(html, base);
  const frontend = analyzeFrontend(html, externalCss, themeColor, contentKind);

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

  return {
    kind: 'ok',
    siteName,
    title,
    description,
    favicon,
    themeColor,
    contentKind,
    frontend,
    embeddable,
    finalUrl,
    nav,
    cards,
  };
}
