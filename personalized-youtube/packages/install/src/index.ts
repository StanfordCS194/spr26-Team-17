import { scanHostPage, type ScanResult, type ShowcaseSelectors } from './scanner';

export interface ShowcaseInstallConfig {
  siteId: string;
  apiBaseUrl?: string;
  debug?: boolean;
  selectors?: Partial<ShowcaseSelectors>;
}

export interface ShowcaseInstallInstance {
  scan(): ScanResult;
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
  log(config, 'initialized', { config, scan: initialScan });
  return {
    scan,
    destroy() {
      log(config, 'destroyed');
    },
  };
}

export const ShowcasePersonalize = { init, scanHostPage };

declare global {
  interface Window {
    ShowcasePersonalize?: typeof ShowcasePersonalize;
  }
}

if (typeof window !== 'undefined') {
  window.ShowcasePersonalize = ShowcasePersonalize;
}

export default ShowcasePersonalize;
export { scanHostPage };
export type { ScanResult, ShowcaseSelectors };
