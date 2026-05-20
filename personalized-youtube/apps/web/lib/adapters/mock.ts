import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Video } from '@showcase/shared';
import type { FeedAdapter } from './index';

const catalogFiles: Record<string, string> = {
  'youtube-clone': 'videos.json',
  'amazon-storefront': 'amazon-products.json',
  'instagram-feed': 'instagram-feed.json',
};

const cache = new Map<string, { videos: Video[]; categories: string[] }>();

async function loadCatalog(siteSlug = 'youtube-clone') {
  const cached = cache.get(siteSlug);
  if (cached) return cached;

  const file = catalogFiles[siteSlug] ?? 'videos.json';
  const path = join(process.cwd(), 'lib/mock-data', file);
  const raw = await readFile(path, 'utf-8');
  const data = JSON.parse(raw) as { videos: Video[]; categories: string[] };
  cache.set(siteSlug, data);
  return data;
}

export function createMockAdapter(siteSlug = 'youtube-clone'): FeedAdapter {
  return {
    async getFeed() {
      return loadCatalog(siteSlug);
    },
  };
}

/** Default YouTube mock catalog. */
export const mockAdapter = createMockAdapter('youtube-clone');

export function clearMockCache() {
  cache.clear();
}
