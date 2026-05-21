import { applyPatches, PageConfigSchema, type PageConfig, type Patch, type Short, type Video } from '@showcase/shared';
import { supabaseAdmin } from '../supabase';
import { getAdapter, isLiveFeedSource, resolveFeedSource } from '../adapters';
import type { SlackBootstrapMeta } from '../slack/client';

interface GetRenderedConfigArgs {
  slug: string;
  visitorId?: string;
}

function mergeGeneratedVideos(config: PageConfig, generated: Video[]): PageConfig {
  if (generated.length === 0) return config;
  const sections = config.sections.map((s) => {
    if (s.type !== 'VideoGrid') return s;
    const existing = ((s.props as { videos?: Video[] }).videos ?? []) as Video[];
    const seenIds = new Set(existing.map((v) => v.id));
    const merged = [...existing, ...generated.filter((v) => !seenIds.has(v.id))];
    return { ...s, props: { ...s.props, videos: merged } };
  });
  return { ...config, sections };
}

// When the youtube adapter is active, distribute real videos across every
// section that holds a video list. Keeps the YouTube clone shell (TopBar,
// Sidebar, chips, etc.) intact — only the feed payloads change so the entire
// visible page reflects the real account, not just the main grid.
function replaceFeedVideos(
  config: PageConfig,
  videos: Video[],
  shorts: Short[],
  chips?: Array<{ text: string; isSelected?: boolean }>,
): PageConfig {
  if (videos.length === 0) return config;
  // Distribute the real feed so each row holds DISTINCT videos:
  //   ContinueWatching = first 6
  //   Recommended      = next 6
  //   VideoGrid        = remainder (or full feed if too few for the rows)
  // ShortsRow gets real shorts when available; otherwise left untouched so
  // the original mock shorts remain visible (so the "hide shorts" demo still works).
  const hasContinue = config.sections.some((s) => s.type === 'ContinueWatchingRow');
  const hasRecommended = config.sections.some((s) => s.type === 'RecommendedRow');
  const continueSlice = hasContinue ? videos.slice(0, 6) : [];
  const recommendedSlice = hasRecommended ? videos.slice(6, 12) : [];
  const gridSlice =
    hasContinue || hasRecommended
      ? videos.length > 12
        ? videos.slice(12)
        : videos
      : videos;
  // Build the active chip list: prefer the real YouTube labels (which are
  // personalized to the account) when available; always include "All" first.
  const realChipList = Array.isArray(chips) && chips.length > 0
    ? ['All', ...chips.filter((c) => c.text !== 'All').map((c) => c.text)]
    : null;
  const activeChip = chips?.find((c) => c.isSelected)?.text ?? 'All';

  const sections = config.sections.map((s) => {
    if (s.type === 'VideoGrid') {
      return { ...s, props: { ...s.props, videos: gridSlice } };
    }
    if (s.type === 'RecommendedRow') {
      return { ...s, props: { ...s.props, videos: recommendedSlice } };
    }
    if (s.type === 'ContinueWatchingRow') {
      return { ...s, props: { ...s.props, videos: continueSlice } };
    }
    if (s.type === 'ShortsRow' && shorts.length > 0) {
      return { ...s, props: { ...s.props, shorts } };
    }
    if (s.type === 'CategoryChips' && realChipList) {
      return { ...s, props: { ...s.props, chips: realChipList, active: activeChip } };
    }
    return s;
  });
  return { ...config, sections };
}

export interface YtChipMeta {
  text: string;
  params: string | null;
}

export async function getRenderedPage(
  { slug, visitorId }: GetRenderedConfigArgs,
): Promise<{
  config: PageConfig;
  ytContinuation: string | null;
  ytChips: YtChipMeta[];
  slackMeta: SlackBootstrapMeta | null;
}> {
  const db = supabaseAdmin();

  const { data: site, error: siteErr } = await db
    .from('sites')
    .select('id, base_config')
    .eq('slug', slug)
    .single();
  if (siteErr || !site) throw new Error(`Site not found: ${slug} — run \`pnpm seed\` first.`);

  // Re-parse through the schema so newer fields with .default() get filled in
  // for rows seeded before the schema grew.
  let config = PageConfigSchema.parse(site.base_config) as PageConfig;
  let ytContinuation: string | null = null;
  let ytChips: YtChipMeta[] = [];
  let slackMeta: SlackBootstrapMeta | null = null;

  const source = resolveFeedSource(slug);
  console.log('[page] slug=', slug, 'feed source =', source);
  if (isLiveFeedSource(source)) {
    try {
      const feed = await getAdapter(source, slug).getFeed();
      if (feed.videos.length > 0) {
        config = replaceFeedVideos(config, feed.videos, feed.shorts ?? [], feed.chips);
        const maybeCont = (feed as { continuation?: unknown }).continuation;
        if (typeof maybeCont === 'string' && maybeCont.length > 0) ytContinuation = maybeCont;
        if (Array.isArray(feed.chips)) {
          ytChips = feed.chips.map((c) => ({ text: c.text, params: c.params }));
        }
        if (feed.slackMeta) slackMeta = feed.slackMeta;
      }
    } catch (err) {
      console.warn(`[page] ${source} adapter threw; using db catalog`, err);
    }
  } else {
    const { data: generated } = await db
      .from('generated_videos')
      .select('data')
      .eq('site_id', site.id)
      .order('created_at', { ascending: true });
    config = mergeGeneratedVideos(config, (generated ?? []).map((r) => r.data as Video));
  }

  if (!visitorId) return { config, ytContinuation, ytChips, slackMeta };

  await db.from('visitors').upsert(
    { id: visitorId, last_seen: new Date().toISOString() },
    { onConflict: 'id' },
  );

  const { data: prefs } = await db
    .from('preferences')
    .select('patch')
    .eq('visitor_id', visitorId)
    .eq('site_id', site.id)
    .order('created_at', { ascending: true });

  const patches = (prefs ?? []).map((p) => p.patch as Patch);
  return { config: applyPatches(config, patches), ytContinuation, ytChips, slackMeta };
}

// Backward-compat shim: existing callers (api/page, api/chat) only need the
// PageConfig and were unaware of YouTube continuation tokens.
export async function getRenderedConfig(args: GetRenderedConfigArgs): Promise<PageConfig> {
  const { config } = await getRenderedPage(args);
  return config;
}
