import type { PageConfig, Patch } from '@showcase/shared';

/** Live handle to whichever showcase page is mounted (YouTube / Amazon / IG). */
export interface PageBridgeContext {
  pageSlug: string;
  config: PageConfig;
  dispatch: (patch: Patch, options?: { persist?: boolean; rationale?: string; trace?: boolean }) => void;
  replace: (config: PageConfig) => void;
  watchingId: string | null;
  watchingTitle: string | null;
  watchingThumbnail: string | null;
  watchingPrice: string | null;
  youtubeMode: boolean;
  liveFeedMode: boolean;
}

let activePage: PageBridgeContext | null = null;

export function registerPageBridge(ctx: PageBridgeContext): void {
  activePage = ctx;
}

export function unregisterPageBridge(pageSlug: string): void {
  if (activePage?.pageSlug === pageSlug) activePage = null;
}

export function getPageBridge(): PageBridgeContext | null {
  return activePage;
}
