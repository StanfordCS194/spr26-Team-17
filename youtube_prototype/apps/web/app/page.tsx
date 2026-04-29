import { cookies } from 'next/headers';
import { getRenderedConfig } from '@/lib/queries/page';
import { PageStoreProvider } from '@/lib/store';
import { PageRoot } from '@/components/site/PageRoot';

export default async function Home() {
  const cookieStore = await cookies();
  const visitorId = cookieStore.get('visitor_id')?.value;
  const config = await getRenderedConfig({ slug: 'youtube-clone', visitorId });

  return (
    <PageStoreProvider initialConfig={config} pageSlug="youtube-clone">
      <PageRoot pageSlug="youtube-clone" />
    </PageStoreProvider>
  );
}
