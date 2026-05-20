import { cookies } from 'next/headers';
import { getRenderedPage } from '@/lib/queries/page';
import { PageStoreProvider } from '@/lib/store';
import { PageRoot } from '@/components/site/PageRoot';
import { resolveFeedSource } from '@/lib/adapters/feed-source';

const SLUG = 'instagram-feed';

function parseWatchingId(raw: string | string[] | undefined): string | null {
  const v = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;
  return typeof v === 'string' && /^[A-Za-z0-9_-]{5,40}$/.test(v) ? v : null;
}

export default async function InstagramPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get('visitor_id')?.value;
  const { config, ytContinuation, ytChips } = await getRenderedPage({ slug: SLUG, visitorId });
  const source = resolveFeedSource(SLUG);
  const params = (await searchParams) ?? {};

  return (
    <PageStoreProvider
      initialConfig={config}
      initialYtContinuation={ytContinuation}
      initialYtChips={ytChips}
      initialYoutubeMode={source === 'youtube'}
      initialWatchingId={parseWatchingId(params['v'])}
      pageSlug={SLUG}
    >
      <PageRoot pageSlug={SLUG} />
    </PageStoreProvider>
  );
}
