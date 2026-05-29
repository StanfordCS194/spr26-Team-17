// DB-less fallback page configs.
//
// The showcase normally loads each site's base_config from Supabase. When the
// database is unreachable or unseeded, we still want every route to render —
// so we build an equivalent base PageConfig from the local mock catalog
// (lib/mock-data/*.json). This mirrors the seeders (scripts/seed*.ts) so the
// fallback looks the same as a freshly-seeded site.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PageConfigSchema, type PageConfig, type Short, type Video } from '@showcase/shared';

const catalogFiles: Record<string, string> = {
  'youtube-clone': 'videos.json',
  'amazon-storefront': 'amazon-products.json',
  'instagram-feed': 'instagram-feed.json',
  'slack-workspace': 'slack-feed.json',
};

async function loadVideos(slug: string): Promise<Video[]> {
  const file = catalogFiles[slug] ?? 'videos.json';
  try {
    const raw = await readFile(join(process.cwd(), 'lib/mock-data', file), 'utf-8');
    return (JSON.parse(raw) as { videos: Video[] }).videos ?? [];
  } catch {
    return [];
  }
}

function storiesFromVideos(videos: Video[]): Short[] {
  return videos.slice(0, 10).map((v) => ({
    id: v.id,
    title: v.title,
    thumbnail: v.thumbnail,
    views: v.views,
    channel: v.channel,
  }));
}

function youtubeConfig(videos: Video[]): PageConfig {
  return PageConfigSchema.parse({
    id: 'youtube-clone',
    slug: 'youtube-clone',
    theme: {
      mode: 'light',
      accent: '#FF0000',
      fontScale: '1',
      radius: 'md',
      videoCardDefaults: {
        aspectRatio: '16:9',
        thumbnailScale: 1,
        titleWeight: 500,
        channelNameWeight: 400,
        showDescription: false,
        showViewCount: true,
        showPostedAgo: true,
        showDuration: true,
      },
    },
    sections: [
      { id: 'topBar', type: 'TopBar', props: { logoText: 'YouTube', searchPlaceholder: 'Search', compactSearch: false, showProfileChip: true } },
      { id: 'sidebar', type: 'Sidebar', props: { collapsed: false, position: 'left', pinnedItems: ['Home', 'Shorts', 'Subscriptions', 'You'], showSubscriptions: true } },
      { id: 'categoryChips', type: 'CategoryChips', props: { active: 'All', chips: ['All', 'Music', 'Gaming', 'Live', 'News', 'Cooking', 'Comedy', 'Recently uploaded'] } },
      { id: 'videoGrid', type: 'VideoGrid', props: { columns: 4, density: 'cozy', videos: videos.slice(0, 60) } },
    ],
    filter: { include: [], exclude: [], requireTags: [], blockChannels: [] },
    sort: { by: 'recommended', order: 'desc' },
    meta: { title: 'YouTube', favicon: '/favicon.ico' },
  });
}

function amazonConfig(videos: Video[]): PageConfig {
  return PageConfigSchema.parse({
    id: 'amazon-storefront',
    slug: 'amazon-storefront',
    theme: {
      mode: 'light',
      accent: '#FF9900',
      fontScale: '1',
      fontFamily: 'sans',
      radius: 'sm',
      background: { kind: 'solid' },
      videoCardDefaults: {
        aspectRatio: '1:1', thumbnailScale: 1, titleWeight: 400, channelNameWeight: 400,
        showDescription: false, showViewCount: false, showPostedAgo: true, showDuration: true,
        cardLayout: 'vertical', hoverEffect: 'none',
      },
    },
    sections: [
      { id: 'topBar', type: 'TopBar', props: { logoText: 'amazon', searchPlaceholder: 'Search Amazon', compactSearch: false, showProfileChip: true } },
      { id: 'sidebar', type: 'Sidebar', props: { collapsed: false, pinnedItems: ['Home', 'Deals', 'Lists', 'Account'], showSubscriptions: false } },
      { id: 'categoryChips', type: 'CategoryChips', props: { active: 'All', chips: ['All', 'Best Sellers', 'Electronics', 'Home', 'Books', 'Fashion'] } },
      { id: 'videoGrid', type: 'VideoGrid', props: { columns: 5, density: 'compact', layout: 'grid', videos: videos.slice(0, 48) } },
    ],
    filter: { include: [], exclude: [], requireTags: [], blockChannels: [] },
    sort: { by: 'recommended', order: 'desc' },
    meta: { title: 'Amazon.com', favicon: '/favicon.ico' },
  });
}

function instagramConfig(videos: Video[]): PageConfig {
  return PageConfigSchema.parse({
    id: 'instagram-feed',
    slug: 'instagram-feed',
    theme: {
      mode: 'light',
      accent: '#E1306C',
      fontScale: '1',
      fontFamily: 'sans',
      radius: 'none',
      background: { kind: 'solid' },
      videoCardDefaults: {
        aspectRatio: '1:1', thumbnailScale: 1, titleWeight: 400, channelNameWeight: 400,
        showDescription: false, showViewCount: false, showPostedAgo: false, showDuration: false,
        cardLayout: 'vertical', hoverEffect: 'none', hideMeta: true,
      },
    },
    sections: [
      { id: 'topBar', type: 'TopBar', props: { logoText: 'Instagram', searchPlaceholder: 'Search', compactSearch: true, showProfileChip: true } },
      { id: 'categoryChips', type: 'CategoryChips', props: { active: 'All', chips: ['All', 'Following', 'Reels', 'Photos'] } },
      { id: 'storiesRow', type: 'ShortsRow', props: { visible: true, headline: 'Stories', shorts: storiesFromVideos(videos) } },
      { id: 'videoGrid', type: 'VideoGrid', props: { columns: 3, density: 'compact', layout: 'grid', videos: videos.slice(0, 27) } },
    ],
    filter: { include: [], exclude: [], requireTags: [], blockChannels: [] },
    sort: { by: 'recent', order: 'desc' },
    meta: { title: 'Instagram', favicon: '/favicon.ico' },
  });
}

function slackConfig(videos: Video[]): PageConfig {
  return PageConfigSchema.parse({
    id: 'slack-workspace',
    slug: 'slack-workspace',
    theme: {
      mode: 'light',
      accent: '#611F69',
      fontScale: '1',
      fontFamily: 'sans',
      radius: 'md',
      background: { kind: 'solid' },
      videoCardDefaults: {
        aspectRatio: '1:1', thumbnailScale: 1, titleWeight: 700, channelNameWeight: 400,
        showDescription: false, showViewCount: false, showPostedAgo: false, showDuration: true,
        cardLayout: 'horizontal', hoverEffect: 'none',
      },
    },
    sections: [
      { id: 'videoGrid', type: 'VideoGrid', props: { columns: 2, density: 'compact', layout: 'list', videos: videos.slice(0, 24) } },
    ],
    filter: { include: [], exclude: [], requireTags: [], blockChannels: [] },
    sort: { by: 'recent', order: 'desc' },
    meta: { title: 'Slack — CS194W', favicon: '/favicon.ico' },
  });
}

/** Build a base PageConfig for a known slug from the local mock catalog. */
export async function buildFallbackConfig(slug: string): Promise<PageConfig> {
  const videos = await loadVideos(slug);
  switch (slug) {
    case 'amazon-storefront':
      return amazonConfig(videos);
    case 'instagram-feed':
      return instagramConfig(videos);
    case 'slack-workspace':
      return slackConfig(videos);
    case 'youtube-clone':
    default:
      return youtubeConfig(videos);
  }
}

/** Slugs we can render without a database. */
export function hasFallbackConfig(slug: string): boolean {
  return slug in catalogFiles;
}
