import Link from 'next/link';
import { decodeOpenSiteSegment, segmentToSlug } from '@showcase/shared';
import { PageStoreProvider } from '@/lib/store';
import { PageRoot } from '@/components/site/PageRoot';
import { LiveEmbed } from '@/components/open/LiveEmbed';
import { getOpenSitePlan } from '@/lib/open-site/config';

type RenderMode = 'hybrid' | 'iframe' | 'archetype';

function parseMode(raw: string | string[] | undefined): RenderMode {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === 'iframe' || v === 'archetype' ? v : 'hybrid';
}

export default async function OpenSitePage({
  params,
  searchParams,
}: {
  params: Promise<{ site: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { site } = await params;
  const url = decodeOpenSiteSegment(site);

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

  const slug = segmentToSlug(site);
  const mode = parseMode((await searchParams)?.['mode']);
  const plan = await getOpenSitePlan(url, slug);

  // Hybrid (default): embed the live site when it allows framing and isn't a
  // login wall; otherwise fall back to the personalizable reconstruction (which
  // also renders the honest "no public content" state).
  const useIframe =
    mode === 'iframe' || (mode === 'hybrid' && plan.embeddable && !plan.loginWalled);

  if (useIframe) {
    return (
      <LiveEmbed
        url={plan.finalUrl}
        slug={slug}
        siteName={plan.siteName}
        favicon={plan.favicon}
        accent={plan.accent}
        config={plan.config}
      />
    );
  }

  return (
    <PageStoreProvider initialConfig={plan.config} initialLiveFeedMode={false} pageSlug={slug}>
      <PageRoot pageSlug={slug} />
    </PageStoreProvider>
  );
}
