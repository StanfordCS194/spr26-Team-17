'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { applyPatch, type PageConfig, type Patch } from '@showcase/shared';

interface PageStoreValue {
  config: PageConfig;
  pageSlug: string;
  dispatch: (patch: Patch, options?: { persist?: boolean; rationale?: string }) => void;
  replace: (config: PageConfig) => void;
}

const PageStoreContext = createContext<PageStoreValue | null>(null);

export function PageStoreProvider({
  initialConfig,
  pageSlug,
  children,
}: {
  initialConfig: PageConfig;
  pageSlug: string;
  children: ReactNode;
}) {
  const [config, setConfig] = useState<PageConfig>(initialConfig);
  const dispatch = useCallback(
    (patch: Patch, options?: { persist?: boolean; rationale?: string }) => {
      setConfig((current) => applyPatch(current, patch));
      if (options?.persist) {
        // fire-and-forget; UI already updated optimistically
        fetch('/api/patch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: pageSlug, patch, rationale: options.rationale }),
        }).catch(() => {
          // best-effort persistence
        });
      }
    },
    [pageSlug],
  );
  const replace = useCallback((next: PageConfig) => setConfig(next), []);
  return (
    <PageStoreContext.Provider value={{ config, pageSlug, dispatch, replace }}>
      {children}
    </PageStoreContext.Provider>
  );
}

export function usePageStore(): PageStoreValue {
  const value = useContext(PageStoreContext);
  if (!value) {
    throw new Error('usePageStore must be used within a PageStoreProvider');
  }
  return value;
}
