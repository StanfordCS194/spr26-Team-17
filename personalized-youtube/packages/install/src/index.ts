export interface ShowcaseInstallConfig {
  siteId: string;
  apiBaseUrl?: string;
  debug?: boolean;
}

export interface ShowcaseInstallInstance {
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
  log(config, 'initialized', config);
  return {
    destroy() {
      log(config, 'destroyed');
    },
  };
}

export const ShowcasePersonalize = { init };

declare global {
  interface Window {
    ShowcasePersonalize?: typeof ShowcasePersonalize;
  }
}

if (typeof window !== 'undefined') {
  window.ShowcasePersonalize = ShowcasePersonalize;
}

export default ShowcasePersonalize;
