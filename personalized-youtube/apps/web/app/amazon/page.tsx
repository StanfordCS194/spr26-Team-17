import { cookies } from 'next/headers';
import { getRenderedPage } from '@/lib/queries/page';
import { PageStoreProvider } from '@/lib/store';
import { PageRoot } from '@/components/site/PageRoot';
import { resolveFeedSource } from '@/lib/adapters/feed-source';

const SLUG = 'amazon-storefront';

export default async function AmazonPage() {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get('visitor_id')?.value;
  const { config, ytContinuation, ytChips } = await getRenderedPage({ slug: SLUG, visitorId });
  const source = resolveFeedSource(SLUG);

  return (
    <PageStoreProvider
      initialConfig={config}
      initialYtContinuation={ytContinuation}
      initialYtChips={ytChips}
      initialYoutubeMode={source === 'youtube'}
      pageSlug={SLUG}
    >
      <PageRoot pageSlug={SLUG} />
    </PageStoreProvider>
  );
}
