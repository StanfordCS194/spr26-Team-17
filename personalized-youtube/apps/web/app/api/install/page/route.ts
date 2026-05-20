import type { NextRequest } from 'next/server';
import { applyPatches, PageConfigSchema, type Patch } from '@showcase/shared';
import { installJson, optionsResponse, resolveInstallSite, ensureInstallVisitor } from '../_shared';

export const runtime = 'nodejs';

// Responds to browser CORS preflight requests from installed sites.
export function OPTIONS(req: NextRequest) {
  return optionsResponse(req);
}

// Returns the base page config plus any saved patches for this visitor.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const siteId = url.searchParams.get('siteId') ?? 'youtube-clone';
  const visitorId = url.searchParams.get('visitorId');
  const { db, site, slug } = await resolveInstallSite(siteId);
  if (!site) return installJson(req, { error: `site not found: ${slug}` }, { status: 404 });

  let config = PageConfigSchema.parse(site.base_config);
  let patches: Patch[] = [];

  // If the caller supplies a visitor id, replay their stored preferences.
  if (visitorId) {
    await ensureInstallVisitor(visitorId);
    const { data } = await db
      .from('preferences')
      .select('patch')
      .eq('visitor_id', visitorId)
      .eq('site_id', site.id)
      .order('created_at', { ascending: true });
    patches = (data ?? []).map((row) => row.patch as Patch);
    config = applyPatches(config, patches);
  }

  return installJson(req, { siteId, resolvedSlug: slug, config, patches });
}
