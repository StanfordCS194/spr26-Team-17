import { scanHostPage, type ScanResult, type ShowcaseSelectors, type SiteArchetype } from './scanner';
import { applyDomPatch } from './patch-runtime';
import { applyArchetypeTheme, ARCHETYPE_THEMES } from './archetype-themes';
import { auditInstallSetup, type AuditReport } from './setup-audit';
import { ensureInstallSession, loadInstallPatches, resetInstallPreferences } from './api';
import { mountInstallChat } from './chat-ui';
import type { Patch } from '@showcase/shared';

export interface ShowcaseInstallConfig {
  siteId: string;
  apiBaseUrl?: string;
  debug?: boolean;
  archetype?: SiteArchetype;
  selectors?: Partial<ShowcaseSelectors>;
}

export interface ShowcaseInstallInstance {
  scan(): ScanResult;
  applyPatch(patch: Patch): void;
  auditSetup(): AuditReport;
  reset(): Promise<void>;
  destroy(): void;
}

// Only logs when the company enables debug mode during installation.
function log(config: ShowcaseInstallConfig, message: string, data?: unknown) {
  if (!config.debug) return;
  console.info(`[Showcase] ${message}`, data ?? '');
}

// Main SDK entrypoint. A host page calls this after loading the browser script.
export function init(config: ShowcaseInstallConfig): ShowcaseInstallInstance {
  if (!config.siteId) {
    throw new Error('ShowcasePersonalize.init requires a siteId');
  }

  // Scan is intentionally repeatable because patches can change the DOM shape.
  const archetype = config.archetype ?? 'youtube';
  const scan = () => scanHostPage(config.selectors, document, archetype);
  const initialScan = scan();
  let currentScan = initialScan;
  const apiBaseUrl = config.apiBaseUrl ?? window.location.origin;

  applyArchetypeTheme(currentScan.bindings.root, archetype);

  const auditSetup = () => auditInstallSetup(config.selectors, document, archetype);
  if (config.debug) {
    const report = auditSetup();
    log(config, report.summary, report);
    if (!report.ready) {
      console.warn('[Showcase] Install setup audit found issues:', report.issues);
    }
  }

  // Create or reuse an anonymous visitor id so preferences can persist.
  const visitorIdPromise = ensureInstallSession(apiBaseUrl, config.siteId);
  void visitorIdPromise
    .then((visitorId) => log(config, 'session ready', { visitorId }))
    .catch((error) => log(config, 'session failed', error));

  // Apply a DOM patch, then rescan so future patches target current elements.
  const applyPatch = (patch: Patch) => {
    applyDomPatch(patch, currentScan.bindings);
    currentScan = scan();
  };

  // On page load, replay saved preferences for this visitor and site.
  void visitorIdPromise
    .then((visitorId) => loadInstallPatches(apiBaseUrl, config.siteId, visitorId))
    .then((patches) => {
      for (const patch of patches) applyPatch(patch as Patch);
      log(config, 'applied stored patches', { count: patches.length });
    })
    .catch((error) => log(config, 'stored patch load failed', error));

  // Reset clears saved preferences on our backend, then reloads the host page.
  const reset = async () => {
    const visitorId = await visitorIdPromise;
    await resetInstallPreferences(apiBaseUrl, config.siteId, visitorId);
    window.location.reload();
  };

  // Mount the floating chat widget into a Shadow DOM container.
  const chat = mountInstallChat({ config, visitorIdPromise, scan, applyPatch, reset });
  log(config, 'initialized', { config, scan: initialScan });

  // Expose debug tools globally so manual browser-console testing is easy.
  if (typeof window !== 'undefined') {
    window.ShowcasePersonalize = {
      ...ShowcasePersonalize,
      __debug: { applyPatch, scan, reset, auditSetup },
    };
  }
  return {
    scan,
    applyPatch,
    auditSetup,
    reset,
    // Remove the widget when an embedding site needs to unmount the SDK.
    destroy() {
      chat.destroy();
      log(config, 'destroyed');
    },
  };
}

export const ShowcasePersonalize = { init, scanHostPage, applyDomPatch, auditInstallSetup, applyArchetypeTheme, ARCHETYPE_THEMES };

declare global {
  interface Window {
    ShowcasePersonalize?: typeof ShowcasePersonalize & {
      __debug?: {
        applyPatch(patch: Patch): void;
        scan(): ScanResult;
        reset(): Promise<void>;
        auditSetup(): AuditReport;
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
export { auditInstallSetup };
export { applyArchetypeTheme, ARCHETYPE_THEMES } from './archetype-themes';
export type { ScanResult, ShowcaseSelectors, SiteArchetype, AuditReport };
