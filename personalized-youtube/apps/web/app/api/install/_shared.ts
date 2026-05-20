import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Patch } from '@showcase/shared';

export const DEMO_SITE_ID = 'static-youtube-demo';
export const DEMO_SITE_FALLBACK_SLUG = 'youtube-clone';

// Localhost is allowed by default so the static demo can call these APIs in dev.
const DEFAULT_ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

// Builds CORS headers for installed customer sites that call our hosted APIs.
export function installCorsHeaders(req: NextRequest): HeadersInit {
  const origin = req.headers.get('origin');
  const configured = (process.env.INSTALL_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const allowed = new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]);
  const allowOrigin = origin && allowed.has(origin) ? origin : 'http://localhost:3000';
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

// Handles CORS preflight requests for every install API route.
export function optionsResponse(req: NextRequest) {
  return new Response(null, { status: 204, headers: installCorsHeaders(req) });
}

// JSON response helper that always includes install CORS headers.
export function installJson(req: NextRequest, body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...installCorsHeaders(req),
      ...(init?.headers ?? {}),
    },
  });
}

// Maps a public install siteId to the internal site row/config in Supabase.
export async function resolveInstallSite(siteId: string) {
  const db = supabaseAdmin();
  const slug = siteId === DEMO_SITE_ID ? DEMO_SITE_FALLBACK_SLUG : siteId;
  const { data: site, error } = await db
    .from('sites')
    .select('id, slug, base_config')
    .eq('slug', slug)
    .single();
  if (error || !site) return { db, site: null, slug };
  return { db, site, slug };
}

// Creates or updates an anonymous visitor row before saving preferences/history.
export async function ensureInstallVisitor(visitorId: string) {
  const db = supabaseAdmin();
  await db.from('visitors').upsert(
    { id: visitorId, last_seen: new Date().toISOString() },
    { onConflict: 'id' },
  );
}

// Request body shape shared by direct patch persistence endpoints.
export interface InstallPatchBody {
  siteId?: string;
  visitorId?: string;
  patch?: Patch;
  rationale?: string;
}
