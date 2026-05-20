import {
  composeCookieHeader,
  readAmazonCookies,
} from '../innertube/chrome-cookies';
import { fetchWithSession } from '../intercept/browser-fetch';
import { decodeHtml, upgradeAmazonImageUrl } from './client';
import { dedupeAmazonImages } from './image-utils';

export type AmazonProductDetail = {
  asin: string;
  title: string;
  brand: string;
  price: string;
  listPrice: string;
  rating: number | null;
  ratingText: string;
  reviewCount: string;
  images: string[];
  bullets: string[];
  breadcrumbs: string[];
  inStock: boolean;
  primeEligible: boolean;
  boughtPastMonth: string;
  amazonChoice: boolean;
};

export type AmazonProductDetailResult =
  | { kind: 'ok'; product: AmazonProductDetail }
  | { kind: 'unavailable'; reason: string };

function extractImages(html: string): string[] {
  const urls = new Set<string>();

  const landingDynamic = html.match(/id="landingImage"[^>]*data-a-dynamic-image="([^"]+)"/i);
  if (landingDynamic?.[1]) {
    try {
      const json = decodeHtml(landingDynamic[1].replace(/&quot;/g, '"'));
      const sizes = JSON.parse(json) as Record<string, [number, number]>;
      for (const u of Object.keys(sizes)) {
        if (u.includes('media-amazon.com')) urls.add(upgradeAmazonImageUrl(u));
      }
    } catch {
      /* ignore */
    }
  }

  const landingSrc =
    html.match(/id="landingImage"[^>]+src="([^"]+)"/i)?.[1] ??
    html.match(/id="imgTagWrapperId"[^>]*>[\s\S]*?src="([^"]+media-amazon[^"]+)"/i)?.[1];
  if (landingSrc) urls.add(upgradeAmazonImageUrl(decodeHtml(landingSrc)));

  for (const m of html.matchAll(/id="altImages"[\s\S]*?<img[^>]+src="([^"]+media-amazon[^"]+)"/gi)) {
    const u = decodeHtml(m[1] ?? '');
    if (u && !u.includes('play-icon') && !u.includes('360-icon')) {
      urls.add(upgradeAmazonImageUrl(u.replace(/\._AC_US\d+_\./, '._AC_SL500_.')));
    }
  }

  for (const m of html.matchAll(/"hiRes":"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/g)) {
    urls.add(upgradeAmazonImageUrl(decodeHtml(m[1] ?? '')));
  }

  return dedupeAmazonImages([...urls]).slice(0, 7);
}

function extractPrice(html: string): { price: string; listPrice: string } {
  for (const m of html.matchAll(/<span class="a-offscreen">\s*(\$[\d,]+(?:\.\d{2})?)\s*<\/span>/gi)) {
    const price = m[1];
    if (!price) continue;
    const idx = m.index ?? 0;
    const before = html.slice(Math.max(0, idx - 320), idx);
    if (/a-text-strike|List:|Was:|Typical:|Savings/i.test(before)) continue;
    const normalized = price.replace(/\s/g, '');
    if (normalized !== '$0.00') return { price: normalized, listPrice: '' };
  }

  const whole = html.match(
    /id="corePriceDisplay_desktop_feature_div"[\s\S]{0,1200}?class="a-price-whole"[^>]*>([\d,]+)/i,
  );
  const frac = html.match(
    /id="corePriceDisplay_desktop_feature_div"[\s\S]{0,1200}?class="a-price-fraction"[^>]*>(\d{2})/i,
  );
  if (whole?.[1]) {
    return { price: `$${whole[1].replace(/,/g, '')}.${frac?.[1] ?? '00'}`, listPrice: '' };
  }

  const loose = html.match(/\$\s*[\d,]+\.\d{2}/);
  return { price: loose?.[0].replace(/\s/g, '') ?? '', listPrice: '' };
}

function extractBullets(html: string): string[] {
  const bullets: string[] = [];
  const block =
    html.match(/id="feature-bullets"[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i)?.[1] ?? '';
  for (const m of block.matchAll(/<span class="a-list-item">\s*([\s\S]*?)<\/span>/gi)) {
    const text = decodeHtml(m[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '');
    if (text.length > 8 && !/^see more/i.test(text)) bullets.push(text);
    if (bullets.length >= 8) break;
  }
  return bullets;
}

function extractBreadcrumbs(html: string): string[] {
  const crumbs: string[] = [];
  const block =
    html.match(/id="wayfinding-breadcrumbs_feature_div"[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i)?.[1] ??
    html.match(/class="a-breadcrumb"[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i)?.[1] ??
    '';
  for (const m of block.matchAll(/<a[^>]*>([^<]{2,80})<\/a>/gi)) {
    const t = decodeHtml(m[1]?.trim() ?? '');
    if (t && t !== '›') crumbs.push(t);
  }
  return crumbs.slice(0, 6);
}

export function parseAmazonProductHtml(html: string, asin: string): AmazonProductDetail | null {
  const titleRaw =
    html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1] ??
    html.match(/id="title"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1];
  const title = titleRaw ? decodeHtml(titleRaw.replace(/<[^>]+>/g, '').trim()) : '';
  if (title.length < 3) return null;

  const brandRaw =
    html.match(/id="bylineInfo"[^>]*>([^<]{2,120})</i)?.[1] ??
    html.match(/id="bylineInfo_feature_div"[\s\S]*?<a[^>]*>([^<]{2,120})</i)?.[1] ??
    '';
  const brand = decodeHtml(brandRaw.trim()).replace(/^Visit the\s+/i, '').replace(/\s+Store$/i, '');

  const { price, listPrice } = extractPrice(html);

  const ratingMatch =
    html.match(/([0-5]\.[0-9])\s+out of 5 stars/i) ??
    html.match(/data-hook="rating-out-of-text"[^>]*>\s*([0-5.]+)\s+out of/i);
  const rating = ratingMatch?.[1] ? parseFloat(ratingMatch[1]) : null;
  const ratingText = rating != null ? `${rating} out of 5 stars` : '';

  const reviewCountRaw =
    html.match(/id="acrCustomerReviewText"[^>]*>\s*([\d,]+)/i)?.[1] ??
    html.match(/([\d,]+)\s+(?:global\s+)?ratings/i)?.[1] ??
    '';
  const reviewCount = reviewCountRaw ? reviewCountRaw.replace(/,/g, '') : '';

  const images = extractImages(html);
  const bullets = extractBullets(html);
  const breadcrumbs = extractBreadcrumbs(html);

  const inStock = /In Stock|Only \d+ left in stock/i.test(html);
  const primeEligible = /a-icon-prime|primeEligible|FREE delivery/i.test(html);
  const boughtPastMonth =
    html.match(/([\d,.]+[KMB]?\+?)\s+bought in past month/i)?.[1] ?? '';
  const amazonChoice = /amazon'?s choice/i.test(html);

  return {
    asin,
    title,
    brand,
    price,
    listPrice,
    rating,
    ratingText,
    reviewCount,
    images,
    bullets,
    breadcrumbs,
    inStock: inStock || !/Currently unavailable/i.test(html),
    primeEligible,
    boughtPastMonth,
    amazonChoice,
  };
}

export async function getAmazonProductDetail(asin: string): Promise<AmazonProductDetailResult> {
  const normalized = asin.trim().toUpperCase();
  if (!/^[A-Z0-9]{10}$/.test(normalized)) {
    return { kind: 'unavailable', reason: 'invalid asin' };
  }

  const cookieResult = await readAmazonCookies();
  if (cookieResult.kind !== 'ok') {
    return { kind: 'unavailable', reason: cookieResult.reason };
  }
  const cookieHeader = composeCookieHeader(cookieResult.cookies, 'amazon.com');
  if (!cookieHeader) {
    return { kind: 'unavailable', reason: 'amazon cookie header empty' };
  }

  const url = `https://www.amazon.com/dp/${encodeURIComponent(normalized)}`;
  try {
    const res = await fetchWithSession(url, {
      method: 'GET',
      cookieHeader,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        Referer: 'https://www.amazon.com/',
      },
    });
    if (!res.ok) {
      return { kind: 'unavailable', reason: `amazon product HTTP ${res.status}` };
    }
    const html = await res.text();
    const product = parseAmazonProductHtml(html, normalized);
    if (!product) {
      return { kind: 'unavailable', reason: 'amazon product parsed empty' };
    }
    return { kind: 'ok', product };
  } catch (err) {
    return { kind: 'unavailable', reason: `amazon product fetch failed: ${(err as Error).message}` };
  }
}
