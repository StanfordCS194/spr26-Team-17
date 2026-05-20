import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SHOWCASE_SITES } from '@showcase/shared';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SLUG_TO_LABEL = Object.fromEntries(SHOWCASE_SITES.map((s) => [s.slug, s.label]));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  const scope = url.searchParams.get('scope') ?? (slug ? 'site' : 'session');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10) || 50, 200);

  const cookieStore = await cookies();
  const visitorId = cookieStore.get('visitor_id')?.value;
  if (!visitorId) return NextResponse.json({ messages: [] });

  const db = supabaseAdmin();

  let query = db
    .from('chat_turns')
    .select('user_message, assistant_message, tool_uses, created_at, site_id, sites!inner(slug)')
    .eq('visitor_id', visitorId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (scope === 'site' && slug) {
    const { data: site } = await db.from('sites').select('id').eq('slug', slug).single();
    if (!site) return NextResponse.json({ messages: [] });
    query = query.eq('site_id', site.id);
  }

  const { data: turns } = await query;

  const ordered = (turns ?? []).slice().reverse();
  const messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    siteSlug?: string;
    siteLabel?: string;
    toolUses?: Array<{ name: string }>;
  }> = [];

  for (const t of ordered) {
    const siteRow = t.sites as { slug?: string } | { slug?: string }[] | null;
    const siteSlug = Array.isArray(siteRow) ? siteRow[0]?.slug : siteRow?.slug;
    const siteLabel = siteSlug ? SLUG_TO_LABEL[siteSlug] : undefined;
    const meta = siteSlug ? { siteSlug, siteLabel } : {};

    messages.push({ role: 'user', content: t.user_message, ...meta });
    const toolUses = Array.isArray(t.tool_uses)
      ? (t.tool_uses as Array<{ name: string }>).map((u) => ({ name: u.name }))
      : undefined;
    if (t.assistant_message || (toolUses && toolUses.length > 0)) {
      messages.push({
        role: 'assistant',
        content: t.assistant_message ?? '',
        ...meta,
        ...(toolUses && toolUses.length > 0 ? { toolUses } : {}),
      });
    }
  }

  return NextResponse.json({ messages });
}
