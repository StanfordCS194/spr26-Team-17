import { scanHostPage, type ScanResult, type ShowcaseSelectors } from './scanner';
import { applyDomPatch } from './patch-runtime';
import { ensureInstallSession } from './api';
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
  void ensureInstallSession(apiBaseUrl, config.siteId)
    .then((visitorId) => log(config, 'session ready', { visitorId }))
    .catch((error) => log(config, 'session failed', error));
  const applyPatch = (patch: Patch) => {
    applyDomPatch(patch, currentScan.bindings);
    currentScan = scan();
  };
  log(config, 'initialized', { config, scan: initialScan });
  if (typeof window !== 'undefined') {
    window.ShowcasePersonalize = {
      ...ShowcasePersonalize,
      __debug: { applyPatch, scan },
    };
  }
  return {
    scan,
    applyPatch,
    destroy() {
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
