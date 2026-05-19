import { scanHostPage, type ScanResult, type ShowcaseSelectors } from './scanner';
import { applyDomPatch } from './patch-runtime';
import { ensureInstallSession, loadInstallPatches, resetInstallPreferences } from './api';
import { mountInstallChat } from './chat-ui';
import type { Patch } from '@showcase/shared';

export interface ShowcaseInstallConfig {
  siteId: string;
  apiBaseUrl?: string;
  debug?: boolean;
  selectors?: Partial<ShowcaseSelectors>;
}

export interface ShowcaseInstallInstance {
  scan(): ScanResult;
  applyPatch(patch: Patch): void;
  reset(): Promise<void>;
  destroy(): void;
}

function log(config: ShowcaseInstallConfig, message: string, data?: unknown) {
  if (!config.debug) return;
  console.info(`[Showcase] ${message}`, data ?? '');
}

export function init(config: ShowcaseInstallConfig): ShowcaseInstallInstance {
  if (!config.siteId) {
    throw new Error('ShowcasePersonalize.init requires a siteId');
  }
  const scan = () => scanHostPage(config.selectors);
  const initialScan = scan();
  let currentScan = initialScan;
  const apiBaseUrl = config.apiBaseUrl ?? window.location.origin;
  const visitorIdPromise = ensureInstallSession(apiBaseUrl, config.siteId);
  void visitorIdPromise
    .then((visitorId) => log(config, 'session ready', { visitorId }))
    .catch((error) => log(config, 'session failed', error));
  const applyPatch = (patch: Patch) => {
    applyDomPatch(patch, currentScan.bindings);
    currentScan = scan();
  };
  void visitorIdPromise
    .then((visitorId) => loadInstallPatches(apiBaseUrl, config.siteId, visitorId))
    .then((patches) => {
      for (const patch of patches) applyPatch(patch as Patch);
      log(config, 'applied stored patches', { count: patches.length });
    })
    .catch((error) => log(config, 'stored patch load failed', error));
  const reset = async () => {
    const visitorId = await visitorIdPromise;
    await resetInstallPreferences(apiBaseUrl, config.siteId, visitorId);
    window.location.reload();
  };
  const chat = mountInstallChat({ config, visitorIdPromise, scan, applyPatch, reset });
  log(config, 'initialized', { config, scan: initialScan });
  if (typeof window !== 'undefined') {
    window.ShowcasePersonalize = {
      ...ShowcasePersonalize,
      __debug: { applyPatch, scan, reset },
    };
  }
  return {
    scan,
    applyPatch,
    reset,
    destroy() {
      chat.destroy();
      log(config, 'destroyed');
    },
  };
}

export const ShowcasePersonalize = { init, scanHostPage, applyDomPatch };

declare global {
  interface Window {
    ShowcasePersonalize?: typeof ShowcasePersonalize & {
      __debug?: {
        applyPatch(patch: Patch): void;
        scan(): ScanResult;
        reset(): Promise<void>;
      };
    };
  }
}

if (typeof window !== 'undefined') {
  window.ShowcasePersonalize = ShowcasePersonalize;
}

export default ShowcasePersonalize;
export { scanHostPage };
export { applyDomPatch };
export type { ScanResult, ShowcaseSelectors };
