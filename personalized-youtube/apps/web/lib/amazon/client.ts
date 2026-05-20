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
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/** Parse search-results HTML for ASIN blocks (defensive regex walk). */
export function parseAmazonSearchHtml(html: string): Video[] {
  const out: Video[] = [];
  const seen = new Set<string>();
  // Each result tile usually has data-asin on a div; skip empty ASINs.
  const asinRe = /data-asin="([A-Z0-9]{10})"/g;
  let m: RegExpExecArray | null;
  while ((m = asinRe.exec(html)) !== null) {
    const asin = m[1];
    if (!asin || seen.has(asin)) continue;
    const start = Math.max(0, m.index - 400);
    const end = Math.min(html.length, m.index + 12000);
    const chunk = html.slice(start, end);
    if (chunk.includes('data-component-type="sp-sponsored"')) continue;

    const titleMatch =
      chunk.match(/<span[^>]*class="[^"]*a-text-normal[^"]*"[^>]*>([^<]{4,200})<\/span>/i) ??
      chunk.match(/<h2[^>]*>[\s\S]*?<span[^>]*>([^<]{4,200})<\/span>/i);
    const titleRaw = titleMatch?.[1];
    const title = titleRaw ? decodeHtml(titleRaw.trim()) : `Product ${asin}`;
    if (title.length < 3) continue;

    const imgMatch =
      chunk.match(/src="(https:\/\/m\.media-amazon\.com\/images\/[^"]+)"/i) ??
      chunk.match(/src="(https:\/\/[^"]+media-amazon[^"]+)"/i);
    const thumbnail = imgMatch?.[1] ?? '';

    const priceMatch =
      chunk.match(/class="a-offscreen"[^>]*>\s*\$([^<]+)/i) ??
      chunk.match(/\$([0-9][0-9.,]*)/);
    const price = priceMatch?.[1] ? `$${priceMatch[1].trim()}` : '';

    const ratingMatch = chunk.match(/([0-5]\.[0-9])\s+out of 5 stars/i);
    const rating = ratingMatch?.[1] ? `${ratingMatch[1]} ★` : '';

    seen.add(asin);
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
      duration: price || '—',
      views: 0,
      postedAgo: rating,
      tags: ['amazon', 'shopping'],
      description: `https://www.amazon.com/dp/${asin}`,
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

  console.log(`[amazon] search "${q}": ${videos.length} products`);
  return { kind: 'ok', videos };
}

export function amazonCookiesForDiagnostics(cookies: Cookie[]): { count: number; hasSession: boolean } {
  const header = composeCookieHeader(cookies, 'amazon.com');
  return {
    count: cookies.length,
    hasSession: header.includes('session-id') || header.includes('ubid-main'),
  };
}
