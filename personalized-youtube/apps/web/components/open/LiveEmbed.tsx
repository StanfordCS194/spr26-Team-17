'use client';

import type { PageConfig } from '@showcase/shared';
import { PageStoreProvider } from '@/lib/store';
import { ChatPanel } from '@/components/chat/ChatPanel';

// Approach A — render the LIVE site inside an iframe so the tab literally IS the
// real website. Highest fidelity, but the AI can't restyle a cross-origin page,
// and only works when the site allows being embedded (no X-Frame-Options / CSP
// frame-ancestors block). Used by the hybrid renderer when `embeddable`.
export function LiveEmbed({
  url,
  slug,
  siteName,
  favicon,
  accent,
  config,
}: {
  url: string;
  slug: string;
  siteName: string;
  favicon: string;
  accent: string;
  config: PageConfig;
}) {
  return (
    <PageStoreProvider initialConfig={config} initialLiveFeedMode={false} pageSlug={slug}>
      <div className="flex h-screen flex-col bg-[color:var(--bg)]" style={{ ['--accent' as string]: accent }}>
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-[color:var(--border)] bg-[color:var(--surface)] px-3">
          <span className="grid h-6 w-6 place-items-center overflow-hidden rounded bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={favicon} alt="" className="h-full w-full object-contain" />
          </span>
          <span className="truncate text-sm font-semibold">{siteName}</span>
          <span className="ml-1 truncate text-xs text-[color:var(--muted-fg)]">{url}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto rounded-full border border-[color:var(--border)] px-3 py-1 text-xs hover:bg-[color:var(--muted)]"
          >
            Open original ↗
          </a>
        </header>
        <iframe
          src={url}
          title={siteName}
          className="min-h-0 w-full flex-1 border-0 bg-white"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
      <ChatPanel />
    </PageStoreProvider>
  );
}
