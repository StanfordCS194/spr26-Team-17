import type { NextRequest } from 'next/server';
import { installJson, optionsResponse, resolveInstallSite, ensureInstallVisitor, type InstallPatchBody } from '../_shared';

export const runtime = 'nodejs';

// Responds to browser CORS preflight requests from installed sites.
export function OPTIONS(req: NextRequest) {
  return optionsResponse(req);
}

// Persists one patch generated for an installed static site.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as InstallPatchBody;
  if (!body.patch) return installJson(req, { error: 'patch required' }, { status: 400 });
  if (!body.visitorId) return installJson(req, { error: 'visitorId required' }, { status: 400 });

  const siteId = body.siteId ?? 'youtube-clone';
  const { db, site, slug } = await resolveInstallSite(siteId);
  if (!site) return installJson(req, { error: `site not found: ${slug}` }, { status: 404 });

  await ensureInstallVisitor(body.visitorId);
  await db.from('preferences').insert({
    visitor_id: body.visitorId,
    site_id: site.id,
    patch: body.patch,
    rationale: body.rationale ?? null,
    message_id: null,
  });

  return installJson(req, { ok: true, siteId, resolvedSlug: slug });
}
