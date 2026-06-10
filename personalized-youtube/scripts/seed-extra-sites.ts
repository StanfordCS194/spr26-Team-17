/**
 * Upsert amazon-storefront, instagram-feed, and slack-workspace site rows.
 * Run: node --env-file=.env --import tsx scripts/seed-extra-sites.ts
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { PageConfigSchema, type PageConfig, type Short, type Video } from '@showcase/shared';

async function loadMock(file: string): Promise<Video[]> {
  const raw = await readFile(join(__dirname, `../apps/web/lib/mock-data/${file}`), 'utf-8');
  return (JSON.parse(raw) as { videos: Video[] }).videos;
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
        aspectRatio: '1:1',
        thumbnailScale: 1,
        titleWeight: 400,
        channelNameWeight: 400,
        showDescription: false,
        showViewCount: false,
        showPostedAgo: true,
        showDuration: true,
        cardLayout: 'vertical',
        hoverEffect: 'none',
      },
    },
    sections: [
      {
        id: 'topBar',
        type: 'TopBar',
        props: {
          logoText: 'amazon',
          searchPlaceholder: 'Search Amazon',
          compactSearch: false,
          showProfileChip: true,
        },
      },
      {
        id: 'sidebar',
        type: 'Sidebar',
        props: {
          collapsed: false,
          pinnedItems: ['Home', 'Deals', 'Lists', 'Account'],
          showSubscriptions: false,
        },
      },
      {
        id: 'categoryChips',
        type: 'CategoryChips',
        props: {
          active: 'All',
          chips: ['All', 'Best Sellers', 'Electronics', 'Home', 'Books', 'Fashion'],
        },
      },
      {
        id: 'videoGrid',
        type: 'VideoGrid',
        props: { columns: 5, density: 'compact', layout: 'grid', videos: videos.slice(0, 48) },
      },
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
        aspectRatio: '1:1',
        thumbnailScale: 1,
        titleWeight: 400,
        channelNameWeight: 400,
        showDescription: false,
        showViewCount: false,
        showPostedAgo: false,
        showDuration: false,
        cardLayout: 'vertical',
        hoverEffect: 'none',
        hideMeta: true,
      },
    },
    sections: [
      {
        id: 'topBar',
        type: 'TopBar',
        props: {
          logoText: 'Instagram',
          searchPlaceholder: 'Search',
          compactSearch: true,
          showProfileChip: true,
        },
      },
      {
        id: 'categoryChips',
        type: 'CategoryChips',
        props: {
          active: 'All',
          chips: ['All', 'Following', 'Reels', 'Photos'],
        },
      },
      {
        id: 'storiesRow',
        type: 'ShortsRow',
        props: {
          visible: true,
          headline: 'Stories',
          shorts: storiesFromVideos(videos),
        },
      },
      {
        id: 'videoGrid',
        type: 'VideoGrid',
        props: { columns: 3, density: 'compact', layout: 'grid', videos: videos.slice(0, 27) },
      },
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
        aspectRatio: '1:1',
        thumbnailScale: 1,
        titleWeight: 700,
        channelNameWeight: 400,
        showDescription: false,
        showViewCount: false,
        showPostedAgo: false,
        showDuration: true,
        cardLayout: 'horizontal',
        hoverEffect: 'none',
      },
    },
    sections: [
      {
        id: 'videoGrid',
        type: 'VideoGrid',
        props: { columns: 2, density: 'compact', layout: 'list', videos: videos.slice(0, 24) },
      },
    ],
    filter: { include: [], exclude: [], requireTags: [], blockChannels: [] },
    sort: { by: 'recent', order: 'desc' },
    meta: { title: 'Slack — CS194W', favicon: '/favicon.ico' },
  });
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('Supabase env vars missing');

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const amazonVideos = await loadMock('amazon-products.json');
  const igVideos = await loadMock('instagram-feed.json');
  const slackVideos = await loadMock('slack-feed.json');

  const sites = [
    { slug: 'amazon-storefront', base_config: amazonConfig(amazonVideos) },
    { slug: 'instagram-feed', base_config: instagramConfig(igVideos) },
    { slug: 'slack-workspace', base_config: slackConfig(slackVideos) },
  ];

  for (const site of sites) {
    await db.from('sites').upsert(
      { slug: site.slug, base_config: site.base_config, updated_at: new Date().toISOString() },
      { onConflict: 'slug' },
    );
    console.log(`Upserted site slug=${site.slug}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
