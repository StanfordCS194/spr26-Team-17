/** Amazon media URLs share an asset id under /images/I/{id}. */
export function amazonImageAssetId(url: string): string | null {
  const m = url.match(/\/images\/I\/([^./?]+)/i);
  return m?.[1] ?? null;
}

function imageResolutionScore(url: string): number {
  const sl = url.match(/\._AC_SL(\d+)_\./i)?.[1];
  if (sl) return parseInt(sl, 10);
  const us = url.match(/\._AC_US(\d+)_\./i)?.[1];
  if (us) return parseInt(us, 10);
  if (url.includes('hiRes')) return 800;
  return 200;
}

/** Keep one URL per product image; prefer the largest Amazon variant. Non-Amazon URLs pass through. */
export function dedupeAmazonImages(urls: string[]): string[] {
  const amazonById = new Map<string, string>();
  const other: string[] = [];
  const seenOther = new Set<string>();

  for (const url of urls) {
    if (!url?.trim()) continue;
    if (url.includes('media-amazon.com')) {
      const id = amazonImageAssetId(url) ?? url;
      const existing = amazonById.get(id);
      if (!existing || imageResolutionScore(url) > imageResolutionScore(existing)) {
        amazonById.set(id, url);
      }
    } else if (!seenOther.has(url)) {
      seenOther.add(url);
      other.push(url);
    }
  }

  // Prefer real Amazon product art when available; keep mock/http fallbacks otherwise.
  const amazon = [...amazonById.values()];
  return amazon.length > 0 ? amazon : other;
}

export function isUsableProductImage(url: string | undefined): boolean {
  if (!url?.trim()) return false;
  if (url.includes('media-amazon.com')) return true;
  return /^https?:\/\//i.test(url);
}

export function parseAmazonPriceUsd(price: string): number {
  const n = parseFloat(price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
