/**
 * Lightweight seed for the youtube-clone site row — NO Anthropic calls.
 * Builds the base PageConfig from the existing mock catalog (videos.json) and
 * upserts the `sites` row. Use this to un-break `/` without regenerating the
 * catalog via `pnpm seed`. Idempotent (upsert on slug).
 *
 * Run: node --env-file=.env --import tsx scripts/seed-youtube-site.ts
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { PageConfigSchema, type PageConfig, type Video } from '@showcase/shared';

const SITE_SLUG = 'youtube-clone';

function makeBaseConfig(videos: Video[]): PageConfig {
  return PageConfigSchema.parse({
    id: 'youtube-clone',
    slug: SITE_SLUG,
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
      {
        id: 'topBar',
        type: 'TopBar',
        props: { logoText: 'YouTube', searchPlaceholder: 'Search', compactSearch: false, showProfileChip: true },
      },
      {
        id: 'sidebar',
        type: 'Sidebar',
        props: {
          collapsed: false,
          position: 'left',
          pinnedItems: ['Home', 'Shorts', 'Subscriptions', 'You'],
          showSubscriptions: true,
        },
      },
      {
        id: 'categoryChips',
        type: 'CategoryChips',
        props: {
          active: 'All',
          chips: ['All', 'Music', 'Gaming', 'Live', 'News', 'Cooking', 'Comedy', 'Recently uploaded'],
        },
      },
      {
        id: 'videoGrid',
        type: 'VideoGrid',
        props: { columns: 4, density: 'cozy', videos: videos.slice(0, 60) },
      },
    ],
    filter: { include: [], exclude: [], requireTags: [], blockChannels: [] },
    sort: { by: 'recommended', order: 'desc' },
    meta: { title: 'YouTube', favicon: '/favicon.ico' },
  });
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('Supabase env vars missing');

  const catalogPath = join(__dirname, '../apps/web/lib/mock-data/videos.json');
  const raw = await readFile(catalogPath, 'utf-8');
  const videos = (JSON.parse(raw) as { videos: Video[] }).videos ?? [];
  if (videos.length === 0) throw new Error('videos.json has no videos — run `pnpm seed` to generate the catalog');

  const baseConfig = makeBaseConfig(videos);
  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { error } = await db.from('sites').upsert(
    { slug: SITE_SLUG, base_config: baseConfig, updated_at: new Date().toISOString() },
    { onConflict: 'slug' },
  );
  if (error) throw new Error(`upsert failed: ${error.message}`);
  console.log(`Upserted site row for slug=${SITE_SLUG} (${videos.length} videos in catalog)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
