// Builds a personalizable PageConfig for an arbitrarily-opened URL.
//
// Strategy (per product decision): blend BOTH paths —
//   1. Public server-side fetch of the URL → real cards (titles + images).
//   2. Pad with the mock catalog so the grid always looks full, even when the
//      page is sparse or ingestion degrades.
// No DB row is required; dynamic tabs are built on demand and cached briefly.

import {
  PageConfigSchema,
  openSiteLabel,
  type PageConfig,
  type Video,
} from '@showcase/shared';
import { createMockAdapter } from '../adapters/mock';
import { ingestPublicPage } from '../ingest/public-page';

const TARGET_GRID = 36;
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { config: PageConfig; ts: number }>();

function hashId(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return `web_${(h >>> 0).toString(36)}`;
}

function cardsToVideos(
  siteName: string,
  favicon: string,
  cards: Array<{ title: string; thumbnail: string; href: string; description: string }>,
): Video[] {
  const out: Video[] = [];
  const seen = new Set<string>();
  for (const card of cards) {
    if (!card.title.trim()) continue;
    const id = hashId(card.href || card.title);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      title: card.title,
      channel: {
        name: siteName,
        avatar: favicon || '/favicon.ico',
        verified: false,
        subscriberCount: 0,
      },
      thumbnail: card.thumbnail || '',
      duration: 'Web',
      views: 0,
      postedAgo: '',
      tags: ['web', 'opened-site'],
      description: card.description ?? '',
      category: 'web',
    });
  }
  return out;
}

async function padVideos(real: Video[]): Promise<Video[]> {
  if (real.length >= TARGET_GRID) return real.slice(0, TARGET_GRID);
  const seen = new Set(real.map((v) => v.id));
  try {
    const { videos } = await createMockAdapter('youtube-clone').getFeed();
    const padded = [...real];
    for (const v of videos) {
      if (padded.length >= TARGET_GRID) break;
      const id = `pad_${v.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      padded.push({ ...v, id });
    }
    return padded;
  } catch {
    return real;
  }
}

function buildConfig(slug: string, siteTitle: string, videos: Video[]): PageConfig {
  return PageConfigSchema.parse({
    id: slug,
    slug,
    theme: {
      mode: 'light',
      accent: '#6366F1',
      fontScale: '1',
      fontFamily: 'sans',
      radius: 'lg',
      background: { kind: 'solid' },
      videoCardDefaults: {
        aspectRatio: '16:9',
        thumbnailScale: 1,
        titleWeight: 600,
        channelNameWeight: 400,
        showDescription: false,
        showViewCount: false,
        showPostedAgo: false,
        showDuration: false,
        cardLayout: 'vertical',
        hoverEffect: 'lift',
      },
    },
    sections: [
      {
        id: 'topBar',
        type: 'TopBar',
        props: {
          logoText: siteTitle.slice(0, 40) || 'Opened site',
          searchPlaceholder: 'Search',
          compactSearch: false,
          showProfileChip: true,
        },
      },
      {
        id: 'categoryChips',
        type: 'CategoryChips',
        props: { active: 'All', chips: ['All', 'Latest', 'Popular', 'Saved'] },
      },
      {
        id: 'videoGrid',
        type: 'VideoGrid',
        props: { columns: 4, density: 'cozy', layout: 'grid', videos },
      },
    ],
    filter: { include: [], exclude: [], requireTags: [], blockChannels: [] },
    sort: { by: 'recommended', order: 'desc' },
    meta: { title: siteTitle.slice(0, 60) || 'Opened site', favicon: '/favicon.ico' },
  });
}

/** Build (or return cached) PageConfig for a dynamically-opened URL + its slug. */
export async function getOpenSiteConfig(url: string, slug: string): Promise<PageConfig> {
  const cached = cache.get(slug);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.config;

  const ingest = await ingestPublicPage(url);
  let siteTitle = openSiteLabel(url);
  let real: Video[] = [];
  if (ingest.kind === 'ok') {
    siteTitle = ingest.title || ingest.siteName || siteTitle;
    real = cardsToVideos(ingest.siteName || siteTitle, ingest.favicon, ingest.cards);
  } else {
    console.warn(`[open-site] ingest unavailable for ${slug}: ${ingest.reason} — using mock catalog`);
  }

  const videos = await padVideos(real);
  const config = buildConfig(slug, siteTitle, videos);
  cache.set(slug, { config, ts: Date.now() });
  return config;
}
