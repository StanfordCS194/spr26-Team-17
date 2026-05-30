import Link from 'next/link';
import { redirect } from 'next/navigation';
import { normalizeOpenUrl, openSitePath } from '@showcase/shared';

function firstParam(raw: string | string[] | undefined): string {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw[0] ?? '';
  return '';
}

// Legacy `/open?u=<url>` entrypoint. Opened sites now live at `/open/<segment>`
// (a distinct path per site, so the router never serves a cached sibling).
// Redirect any lingering query-style links to the canonical path.
export default async function LegacyOpenSitePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const url = normalizeOpenUrl(firstParam(params['u']));

  if (url) redirect(openSitePath(url));

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
