import type { PageConfig, Patch } from '@showcase/shared';
import type { NavKey } from '@/lib/store';

/** Live handle to whichever showcase page is mounted (YouTube / Amazon / IG). */
export interface PageBridgeContext {
  pageSlug: string;
  config: PageConfig;
  dispatch: (patch: Patch, options?: { persist?: boolean; rationale?: string; trace?: boolean }) => void;
  replace: (config: PageConfig) => void;
  watchingId: string | null;
  watchingTitle: string | null;
  youtubeMode: boolean;
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
