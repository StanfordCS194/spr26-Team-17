'use client';

import { useEffect, useState } from 'react';
import { isUsableProductImage } from '@/lib/amazon/image-utils';

function probeImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

async function fetchProductThumb(asin: string): Promise<string> {
  const r = await fetch(`/api/amazon/product?asin=${encodeURIComponent(asin)}`);
  if (!r.ok) return '';
  const data = (await r.json()) as { ok?: boolean; product?: { images?: string[] } };
  return data.ok && data.product?.images?.[0] ? data.product.images[0] : '';
}

/** Resolve a product thumbnail from the PDP scrape API when grid art is missing or broken. */
export function useAmazonProductThumb(asin: string, initial?: string): string {
  const seed = initial?.trim() ?? '';
  const [url, setUrl] = useState(() => (isUsableProductImage(seed) ? seed : ''));

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (isUsableProductImage(seed) && seed.includes('media-amazon.com')) {
        const ok = await probeImage(seed);
        if (cancelled) return;
        if (ok) {
          setUrl(seed);
          return;
        }
      } else if (isUsableProductImage(seed) && !seed.includes('media-amazon.com')) {
        setUrl(seed);
        return;
      }

      const fromApi = await fetchProductThumb(asin);
      if (cancelled) return;
      if (fromApi) {
        setUrl(fromApi);
        return;
      }
      if (isUsableProductImage(seed)) setUrl(seed);
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [asin, seed]);

  return url;
}
