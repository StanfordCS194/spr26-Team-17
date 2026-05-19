import type { NextRequest } from 'next/server';
import { installJson, optionsResponse, resolveInstallSite } from '../_shared';

export const runtime = 'nodejs';

export function OPTIONS(req: NextRequest) {
  return optionsResponse(req);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { siteId?: string; visitorId?: string };
  if (!body.visitorId) return installJson(req, { error: 'visitorId required' }, { status: 400 });
  const { db, site, slug } = await resolveInstallSite(body.siteId ?? 'youtube-clone');
  if (!site) return installJson(req, { error: `site not found: ${slug}` }, { status: 404 });
  await db.from('preferences').delete().eq('visitor_id', body.visitorId).eq('site_id', site.id);
  return installJson(req, { ok: true, siteId: body.siteId ?? 'youtube-clone', resolvedSlug: slug });
}
