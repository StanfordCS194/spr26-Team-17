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

/** Keep one URL per product image; prefer the largest variant. */
export function dedupeAmazonImages(urls: string[]): string[] {
  const byId = new Map<string, string>();
  for (const url of urls) {
    if (!url?.includes('media-amazon.com')) continue;
    const id = amazonImageAssetId(url) ?? url;
    const existing = byId.get(id);
    if (!existing || imageResolutionScore(url) > imageResolutionScore(existing)) {
      byId.set(id, url);
    }
  }
  return [...byId.values()];
}

export function parseAmazonPriceUsd(price: string): number {
  const n = parseFloat(price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
