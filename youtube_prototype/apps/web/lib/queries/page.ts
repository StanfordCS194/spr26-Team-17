import { applyPatches, type PageConfig, type Patch, type Video } from '@showcase/shared';
import { supabaseAdmin } from '../supabase';

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

export async function getRenderedConfig({ slug, visitorId }: GetRenderedConfigArgs): Promise<PageConfig> {
  const db = supabaseAdmin();

  const { data: site, error: siteErr } = await db
    .from('sites')
    .select('id, base_config')
    .eq('slug', slug)
    .single();
  if (siteErr || !site) throw new Error(`Site not found: ${slug} — run \`pnpm seed\` first.`);

  let config = site.base_config as PageConfig;

  const { data: generated } = await db
    .from('generated_videos')
    .select('data')
    .eq('site_id', site.id)
    .order('created_at', { ascending: true });
  config = mergeGeneratedVideos(config, (generated ?? []).map((r) => r.data as Video));

  if (!visitorId) return config;

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
  return applyPatches(config, patches);
}
