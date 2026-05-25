import { cookies } from 'next/headers';
import { getRenderedPage } from '@/lib/queries/page';
import { PageStoreProvider } from '@/lib/store';
import { PageRoot } from '@/components/site/PageRoot';
import { isLiveFeedSource, resolveFeedSource } from '@/lib/adapters/feed-source';

const SLUG = 'slack-workspace';

function parseWatchingId(raw: string | string[] | undefined): string | null {
  const v = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;
  return typeof v === 'string' && /^slack[A-Za-z0-9]{3,32}$/.test(v) ? v : null;
}

export default async function SlackPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get('visitor_id')?.value;
  const { config, ytContinuation, ytChips, slackMeta } = await getRenderedPage({ slug: SLUG, visitorId });
  const source = resolveFeedSource(SLUG);
  const live = isLiveFeedSource(source);
  const params = (await searchParams) ?? {};

  return (
    <PageStoreProvider
      initialConfig={config}
      initialYtContinuation={ytContinuation}
      initialYtChips={ytChips}
      initialYoutubeMode={false}
      initialLiveFeedMode={live}
      initialSlackMeta={slackMeta}
      initialWatchingId={parseWatchingId(params['v'])}
      pageSlug={SLUG}
    >
      <PageRoot pageSlug={SLUG} />
    </PageStoreProvider>
  );
}
