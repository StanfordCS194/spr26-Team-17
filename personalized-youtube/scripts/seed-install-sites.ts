/**
 * Upsert Supabase site rows for install demo siteIds.
 * Run: node --env-file=.env --import tsx scripts/seed-install-sites.ts
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { PageConfigSchema, type PageConfig, type Video } from '@showcase/shared';

async function loadMock(file: string): Promise<Video[]> {
  const raw = await readFile(join(__dirname, `../apps/web/lib/mock-data/${file}`), 'utf-8');
  return (JSON.parse(raw) as { videos: Video[] }).videos;
}

function installDemoConfig(args: {
  slug: string;
  title: string;
  accent: string;
  videos: Video[];
  logoText: string;
}): PageConfig {
  return PageConfigSchema.parse({
    id: args.slug,
    slug: args.slug,
    theme: {
      mode: 'light',
      accent: args.accent,
      fontScale: '1',
      fontFamily: 'sans',
      radius: 'md',
      background: { kind: 'solid' },
      videoCardDefaults: {},
    },
    sections: [
      {
        id: 'topbar',
        type: 'TopBar',
        props: {
          logoText: args.logoText,
          searchPlaceholder: 'Search',
          compactSearch: false,
          showProfileChip: true,
        },
      },
      {
        id: 'video-grid',
        type: 'VideoGrid',
        props: { columns: 4, density: 'cozy', layout: 'grid', videos: args.videos.slice(0, 24) },
      },
    ],
    filter: {},
    sort: {},
    meta: { title: args.title, favicon: '/favicon.ico' },
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
    {
      slug: 'amazon-demo',
      base_config: installDemoConfig({
        slug: 'amazon-demo',
        title: 'Amazon Install Demo',
        accent: '#FF9900',
        logoText: 'amazon',
        videos: amazonVideos,
      }),
    },
    {
      slug: 'instagram-demo',
      base_config: installDemoConfig({
        slug: 'instagram-demo',
        title: 'Instagram Install Demo',
        accent: '#E1306C',
        logoText: 'Instagram',
        videos: igVideos,
      }),
    },
    {
      slug: 'slack-demo',
      base_config: installDemoConfig({
        slug: 'slack-demo',
        title: 'Slack Install Demo',
        accent: '#611F69',
        logoText: 'Slack',
        videos: slackVideos,
      }),
    },
  ];

  for (const site of sites) {
    await db.from('sites').upsert(
      { slug: site.slug, base_config: site.base_config, updated_at: new Date().toISOString() },
      { onConflict: 'slug' },
    );
    console.log(`Upserted install site slug=${site.slug}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
