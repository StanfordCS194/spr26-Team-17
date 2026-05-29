import Link from 'next/link';
import { encodeOpenSiteSlug, normalizeOpenUrl } from '@showcase/shared';
import { PageStoreProvider } from '@/lib/store';
import { PageRoot } from '@/components/site/PageRoot';
import { getOpenSiteConfig } from '@/lib/open-site/config';

function firstParam(raw: string | string[] | undefined): string {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw[0] ?? '';
  return '';
}

export default async function OpenSitePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const url = normalizeOpenUrl(firstParam(params['u']));

  if (!url) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg p-8 text-center text-fg">
        <div className="max-w-md space-y-3">
          <h1 className="text-lg font-semibold">Couldn&apos;t open that link</h1>
          <p className="text-sm text-[color:var(--muted-fg)]">
            The URL was missing or not a valid public website. Ask the assistant to open a full
            address like <code>example.com</code>.
          </p>
          <Link href="/" className="inline-block text-sm underline">
            Back to YouTube
          </Link>
        </div>
      </main>
    );
  }

  const slug = encodeOpenSiteSlug(url);
  const config = await getOpenSiteConfig(url, slug);

  return (
    <PageStoreProvider
      initialConfig={config}
      initialLiveFeedMode={false}
      pageSlug={slug}
    >
      <PageRoot pageSlug={slug} />
    </PageStoreProvider>
  );
}
