/**
 * Upsert amazon-storefront + instagram-feed site rows (mock base_config).
 * Run: node --env-file=.env --import tsx scripts/seed-extra-sites.ts
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { PageConfigSchema, type PageConfig, type Video } from '@showcase/shared';

async function loadMock(file: string): Promise<Video[]> {
  const raw = await readFile(join(__dirname, `../apps/web/lib/mock-data/${file}`), 'utf-8');
  return (JSON.parse(raw) as { videos: Video[] }).videos;
}

function shell(
  id: string,
  slug: string,
  title: string,
  accent: string,
  logoText: string,
  chips: string[],
  videos: Video[],
): PageConfig {
  return PageConfigSchema.parse({
    id,
    slug,
    theme: {
      mode: 'light',
      accent,
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
      {
        id: 'topBar',
        type: 'TopBar',
        props: {
          logoText,
          searchPlaceholder: 'Search',
          compactSearch: false,
          showProfileChip: true,
        },
      },
      {
        id: 'sidebar',
        type: 'Sidebar',
        props: {
          collapsed: false,
          position: 'left',
          pinnedItems: ['Home', 'Deals', 'Lists', 'Account'],
          showSubscriptions: false,
        },
      },
      {
        id: 'categoryChips',
        type: 'CategoryChips',
        props: { active: 'All', chips },
      },
      {
        id: 'videoGrid',
        type: 'VideoGrid',
        props: { columns: 4, density: 'cozy', videos: videos.slice(0, 48) },
      },
    ],
    filter: { include: [], exclude: [], requireTags: [], blockChannels: [] },
    sort: { by: 'recommended', order: 'desc' },
    meta: { title, favicon: '/favicon.ico' },
  });
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('Supabase env vars missing');

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const amazonVideos = await loadMock('amazon-products.json');
  const igVideos = await loadMock('instagram-feed.json');

  const sites = [
    {
      slug: 'amazon-storefront',
      base_config: shell(
        'amazon-storefront',
        'amazon-storefront',
        'Amazon',
        '#FF9900',
        'amazon',
        ['All', 'Deals', 'Best Sellers', 'Electronics'],
        amazonVideos,
      ),
    },
    {
      slug: 'instagram-feed',
      base_config: shell(
        'instagram-feed',
        'instagram-feed',
        'Instagram',
        '#E1306C',
        'Instagram',
        ['All', 'Following', 'Reels', 'Photos'],
        igVideos,
      ),
    },
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
