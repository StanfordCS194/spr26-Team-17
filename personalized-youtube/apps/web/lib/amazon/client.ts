// Amazon retail — intercept-style client (no Product Advertising API).
//
// Replays the same request shape as amazon.com search: GET /s?k=… with the
// user's Chrome session cookies. Parses product cards from the HTML response.
// Capture reference: DevTools → Network → document or xhr on /s?k=…

import type { Video } from '@showcase/shared';
import {
  composeCookieHeader,
  readAmazonCookies,
  type Cookie,
} from '../innertube/chrome-cookies';
import { fetchWithSession } from '../intercept/browser-fetch';

export type AmazonFeedResult =
  | { kind: 'ok'; videos: Video[] }
  | { kind: 'unavailable'; reason: string };

const SEARCH_BASE = 'https://www.amazon.com/s';

function decodeHtml(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/** Prefer a high-res product image (Amazon serves tiny SX/US tiles in src). */
export function upgradeAmazonImageUrl(url: string): string {
  if (!url.includes('media-amazon.com')) return url;
  const base = url.split('?')[0] ?? url;
  if (/\._AC_[A-Z0-9_,]+_\./i.test(base)) {
    return base.replace(/\._AC_[A-Z0-9_,]+_\./i, '._AC_SL500_.');
  }
  return base;
}

function extractAmazonImage(chunk: string): string {
  const dynamic = chunk.match(/data-a-dynamic-image="([^"]+)"/i);
  if (dynamic?.[1]) {
    try {
      const json = decodeHtml(dynamic[1].replace(/&quot;/g, '"'));
      const sizes = JSON.parse(json) as Record<string, [number, number]>;
      const sorted = Object.entries(sizes).sort((a, b) => (b[1][0] ?? 0) - (a[1][0] ?? 0));
      const best = sorted.find(([u]) => u.includes('media-amazon.com'))?.[0];
      if (best) return upgradeAmazonImageUrl(best);
    } catch {
      /* fall through */
    }
  }

  let bestUrl = '';
  let bestWidth = 0;
  for (const srcset of chunk.matchAll(/srcset="([^"]+)"/gi)) {
    const srcsetValue = srcset[1];
    if (!srcsetValue) continue;
    for (const part of srcsetValue.split(',')) {
      const trimmed = part.trim();
      const space = trimmed.lastIndexOf(' ');
      if (space <= 0) continue;
      const url = trimmed.slice(0, space);
      const widthToken = trimmed.slice(space + 1);
      if (!url.includes('media-amazon.com')) continue;
      // Prefer JPG over AVIF for broad browser support; bump QL54/70 → larger SF variant via upgrade.
      if (url.includes('avif') || url.includes('FMavif')) continue;
      const width = parseInt(widthToken.replace(/\D/g, ''), 10) || 0;
      if (width >= bestWidth) {
        bestWidth = width;
        bestUrl = url;
      }
    }
  }
  if (bestUrl) return upgradeAmazonImageUrl(bestUrl);

  const imgMatch =
    chunk.match(/<img[^>]+class="[^"]*s-image[^"]*"[^>]+src="([^"]+)"/i) ??
    chunk.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/i);
  return imgMatch?.[1] ? upgradeAmazonImageUrl(decodeHtml(imgMatch[1])) : '';
}

function extractAmazonPrice(chunk: string): string {
  for (const m of chunk.matchAll(/<span class="a-offscreen">\s*(\$[\d,]+(?:\.\d{2})?)\s*<\/span>/gi)) {
    const price = m[1];
    if (!price) continue;
    const idx = m.index ?? 0;
    const before = chunk.slice(Math.max(0, idx - 280), idx);
    if (/a-text-strike|List:|Was:|Typical:/i.test(before)) continue;
    const normalized = price.replace(/\s/g, '');
    if (normalized === '$0.00') continue;
    return normalized;
  }

  const whole = chunk.match(
    /class="a-price-whole"[^>]*>([\d,]+)(?:<span class="a-price-decimal">\.)?<\/span>/i,
  );
  const frac = chunk.match(/class="a-price-fraction"[^>]*>(\d{2})/i);
  if (whole?.[1]) {
    const dollars = whole[1].replace(/,/g, '');
    return `$${dollars}.${frac?.[1] ?? '00'}`;
  }

  const loose = chunk.match(/\$\s*[\d,]+\.\d{2}/);
  return loose?.[0].replace(/\s/g, '') ?? '';
}

function extractProductUrl(chunk: string, asin: string): string {
  const dpPath =
    chunk.match(new RegExp(`href="(/[^"?]*/dp/${asin}[^"]*)"`, 'i'))?.[1] ??
    chunk.match(new RegExp(`href="(/dp/${asin}[^"]*)"`, 'i'))?.[1];
  if (dpPath) {
    const path = decodeHtml(dpPath).replace(/&amp;/g, '&');
    return `https://www.amazon.com${path.split('?')[0]}`;
  }
  return `https://www.amazon.com/dp/${asin}`;
}

function splitSearchResultBlocks(html: string): string[] {
  const indices: number[] = [];
  const re =
    /<div[^>]+data-asin="([A-Z0-9]{10})"[^>]*data-component-type="s-search-result"|<div[^>]+data-component-type="s-search-result"[^>]*data-asin="([A-Z0-9]{10})"/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index != null) indices.push(m.index);
  }
  const blocks: string[] = [];
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i]!;
    const end = indices[i + 1] ?? html.length;
    blocks.push(html.slice(start, Math.min(end, start + 32000)));
  }
  return blocks;
}

/** Parse search-results HTML for ASIN blocks (defensive walk). */
export function parseAmazonSearchHtml(html: string): Video[] {
  const out: Video[] = [];
  const seen = new Set<string>();

  for (const chunk of splitSearchResultBlocks(html)) {
    const asinMatch = chunk.match(/data-asin="([A-Z0-9]{10})"/i);
    const asin = asinMatch?.[1];
    if (!asin || seen.has(asin)) continue;
    if (chunk.includes('data-component-type="sp-sponsored"')) continue;

    const titleMatch =
      chunk.match(/<span[^>]*class="[^"]*a-text-normal[^"]*"[^>]*>([^<]{4,220})<\/span>/i) ??
      chunk.match(/<h2[^>]*>[\s\S]*?<span[^>]*>([^<]{4,220})<\/span>/i);
    const titleRaw = titleMatch?.[1];
    const title = titleRaw ? decodeHtml(titleRaw.trim()) : `Product ${asin}`;
    if (title.length < 3) continue;

    const thumbnail = extractAmazonImage(chunk);
    const price = extractAmazonPrice(chunk);

    const ratingMatch = chunk.match(/([0-5]\.[0-9])\s+out of 5 stars/i);
    const rating = ratingMatch?.[1] ? `${ratingMatch[1]} ★` : '';

    seen.add(asin);
    const productUrl = extractProductUrl(chunk, asin);
    out.push({
      id: asin,
      title,
      channel: {
        name: 'Amazon',
        avatar: 'https://www.amazon.com/favicon.ico',
        verified: true,
        subscriberCount: 0,
      },
      thumbnail,
      duration: price || 'See price',
      views: 0,
      postedAgo: rating,
      tags: ['amazon', 'shopping'],
      description: productUrl,
      category: 'shopping',
    });
    if (out.length >= 48) break;
  }

  return out;
}

export async function getAmazonSearchFeed(query?: string): Promise<AmazonFeedResult> {
  const cookieResult = await readAmazonCookies();
  if (cookieResult.kind !== 'ok') {
    return { kind: 'unavailable', reason: cookieResult.reason };
  }

  const q =
    query?.trim() ||
    process.env.AMAZON_SEARCH_QUERY?.trim() ||
    'best sellers';
  const cookieHeader = composeCookieHeader(cookieResult.cookies, 'amazon.com');
  if (!cookieHeader) {
    return { kind: 'unavailable', reason: 'amazon cookie header empty' };
  }

  const url = `${SEARCH_BASE}?k=${encodeURIComponent(q)}`;
  let res: Response;
  try {
    res = await fetchWithSession(url, {
      method: 'GET',
      cookieHeader,
      headers: {
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        Referer: 'https://www.amazon.com/',
      },
    });
  } catch (err) {
    return { kind: 'unavailable', reason: `amazon fetch failed: ${(err as Error).message}` };
  }

  if (!res.ok) {
    return { kind: 'unavailable', reason: `amazon HTTP ${res.status}` };
  }

  const html = await res.text();
  const videos = parseAmazonSearchHtml(html);
  if (videos.length === 0) {
    return {
      kind: 'unavailable',
      reason: 'amazon search parsed empty (captcha, region block, or HTML shape changed)',
    };
  }

  const withPrice = videos.filter((v) => v.duration.startsWith('$')).length;
  console.log(`[amazon] search "${q}": ${videos.length} products (${withPrice} with price)`);
  return { kind: 'ok', videos };
}

export function amazonCookiesForDiagnostics(cookies: Cookie[]): { count: number; hasSession: boolean } {
  const header = composeCookieHeader(cookies, 'amazon.com');
  return {
    count: cookies.length,
    hasSession: header.includes('session-id') || header.includes('ubid-main'),
  };
}
