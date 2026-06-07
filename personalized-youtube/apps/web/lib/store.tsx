'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { applyPatch, type PageConfig, type Patch } from '@showcase/shared';
import { registerPageBridge, unregisterPageBridge } from '@/lib/page-bridge';
import {
  EMPTY_CHANGE_HISTORY,
  commitHistory,
  redoHistory,
  undoHistory,
  type ChangeReceipt,
  type ChangeHistoryState,
} from '@/lib/change-history';

export interface YtChipEntry {
  text: string;
  params: string | null;
}

export type NavKey =
  | 'Home'
  | 'Shorts'
  | 'Subscriptions'
  | 'You'
  | 'Library'
  | 'History'
  | 'Deals'
  | 'Lists'
  | 'Account'
  | 'Search'
  | 'Reels'
  | 'Shop'
  | 'Profile';

// Pre-search snapshot of the home page. We capture the whole config (not just
// the videos) because search mutates several sections at once — grid videos,
// row visibility, filter state — and restoring piecemeal would have to know
// every section the search touches.
export interface HomeSnapshot {
  config: PageConfig;
  ytContinuation: string | null;
}

interface PendingChange {
  id: string;
  label: string;
  patchCount: number;
  before: PageConfig;
}

import type { SlackBootstrapMeta } from '@/lib/slack/client';

function compactSnapshot(config: PageConfig): PageConfig {
  return {
    ...config,
    sections: config.sections.map((section) => {
      if (section.type === 'VideoGrid') {
        return { ...section, props: { ...section.props, videos: [] } };
      }
      if (section.type === 'RecommendedRow') {
        return { ...section, props: { ...section.props, videos: [] } };
      }
      if (section.type === 'ContinueWatchingRow') {
        return { ...section, props: { ...section.props, videos: [] } };
      }
      if (section.type === 'ShortsRow') {
        return { ...section, props: { ...section.props, shorts: [] } };
      }
      return section;
    }),
  };
}

interface PageStoreValue {
  config: PageConfig;
  pageSlug: string;
  dispatch: (patch: Patch, options?: { persist?: boolean; rationale?: string; trace?: boolean }) => void;
  replace: (config: PageConfig, options?: { clearHistory?: boolean }) => void;
  beginChangeSet: (label: string) => string;
  endChangeSet: (id: string) => ChangeReceipt | null;
  undoChange: (id?: string) => boolean;
  redoChange: (id?: string) => boolean;
  latestUndoId: string | null;
  latestRedoId: string | null;
  magicPointerActive: boolean;
  setMagicPointerActive: (active: boolean) => void;
  // YouTube-source extras: continuation token for infinite scroll, mutable
  // so the grid can update it after each /api/yt/more page lands.
  ytContinuation: string | null;
  setYtContinuation: (token: string | null) => void;
  // Real chip metadata extracted from the home browse response. Map text → params token.
  ytChips: YtChipEntry[];
  // Whether the YouTube data adapter is active (legacy name; prefer liveFeedMode).
  youtubeMode: boolean;
  // Live intercept feed for the current site (YouTube, Amazon, Instagram, or Slack).
  liveFeedMode: boolean;
  slackMeta: SlackBootstrapMeta | null;
  // Currently-watched video for the in-app embed overlay; null when closed.
  watchingId: string | null;
  watchingTitle: string | null;
  watchingThumbnail: string | null;
  watchingPrice: string | null;
  setWatching: (
    id: string | null,
    title?: string | null,
    meta?: { thumbnail?: string; price?: string },
  ) => void;
  // Sidebar navigation: which top-level nav item is active and (when in
  // Subscriptions mode) which channel is selected. Local-only state, doesn't
  // round-trip through the patch system since it doesn't change PageConfig.
  activeNav: NavKey;
  selectedChannel: string | null;
  setActiveNav: (key: NavKey, channel?: string | null) => void;
  // Search mode: when non-null, the page is showing search results.
  // enterSearch captures a one-shot snapshot of the home state on first
  // entry; exitSearch restores that snapshot (logo click / back button).
  searchQuery: string | null;
  enterSearch: (query: string, snapshot: HomeSnapshot) => void;
  exitSearch: () => void;
}

const PageStoreContext = createContext<PageStoreValue | null>(null);

export function PageStoreProvider({
  initialConfig,
  initialYtContinuation = null,
  initialYtChips = [],
  initialYoutubeMode = false,
  initialLiveFeedMode = false,
  initialSlackMeta = null,
  initialWatchingId = null,
  pageSlug,
  children,
}: {
  initialConfig: PageConfig;
  initialYtContinuation?: string | null;
  initialYtChips?: YtChipEntry[];
  initialYoutubeMode?: boolean;
  initialLiveFeedMode?: boolean;
  initialSlackMeta?: SlackBootstrapMeta | null;
  initialWatchingId?: string | null;
  pageSlug: string;
  children: ReactNode;
}) {
  const [config, setConfig] = useState<PageConfig>(initialConfig);
  const configRef = useRef<PageConfig>(initialConfig);
  const pendingChangeRef = useRef<PendingChange | null>(null);
  const historyRef = useRef<ChangeHistoryState>(EMPTY_CHANGE_HISTORY);
  const [, setHistoryVersion] = useState(0);
  const [magicPointerActive, setMagicPointerActive] = useState(false);
  const [ytContinuation, setYtContinuation] = useState<string | null>(initialYtContinuation);
  const [watchingId, setWatchingId] = useState<string | null>(initialWatchingId);
  const [watchingTitle, setWatchingTitle] = useState<string | null>(null);
  const [watchingThumbnail, setWatchingThumbnail] = useState<string | null>(null);
  const [watchingPrice, setWatchingPrice] = useState<string | null>(null);
  const [activeNav, setActiveNavState] = useState<NavKey>('Home');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [homeSnapshot, setHomeSnapshot] = useState<HomeSnapshot | null>(null);
  const enterSearch = useCallback((query: string, snapshot: HomeSnapshot) => {
    setSearchQuery(query);
    // Only snapshot on first entry; back-to-back searches preserve the
    // original home state so logo-click always lands on the real home.
    setHomeSnapshot((prev) => prev ?? snapshot);
  }, []);
  const exitSearch = useCallback(() => {
    setHomeSnapshot((snap) => {
      if (snap) {
        configRef.current = snap.config;
        setConfig(snap.config);
        setYtContinuation(snap.ytContinuation);
      }
      return null;
    });
    setSearchQuery(null);
  }, []);
  const setActiveNav = useCallback((key: NavKey, channel?: string | null) => {
    setActiveNavState(key);
    setSelectedChannel(typeof channel === 'string' ? channel : null);
  }, []);
  const setWatching = useCallback(
    (id: string | null, title?: string | null, meta?: { thumbnail?: string; price?: string }) => {
      setWatchingId(id);
      setWatchingTitle(typeof title === 'string' ? title : null);
      if (!id) {
        setWatchingThumbnail(null);
        setWatchingPrice(null);
        return;
      }
      setWatchingThumbnail(meta?.thumbnail?.trim() || null);
      setWatchingPrice(meta?.price?.trim() || null);
    },
    [],
  );
  const youtubeMode = initialYoutubeMode;
  const liveFeedMode = initialLiveFeedMode;
  const setCurrentConfig = useCallback((next: PageConfig) => {
    configRef.current = next;
    setConfig(next);
  }, []);

  const persistSnapshot = useCallback(
    (next: PageConfig, rationale: string) => {
      fetch('/api/patch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: pageSlug,
          patch: { op: 'replace_config', config: compactSnapshot(next) } satisfies Patch,
          rationale,
        }),
      }).catch(() => {
        // Undo remains useful in-session when persistence is unavailable.
      });
    },
    [pageSlug],
  );

  const updateHistory = useCallback((next: ChangeHistoryState) => {
    historyRef.current = next;
    setHistoryVersion((version) => version + 1);
  }, []);

  const dispatch = useCallback(
    (patch: Patch, options?: { persist?: boolean; rationale?: string; trace?: boolean }) => {
      const current = configRef.current;
      const next = applyPatch(current, patch);
      configRef.current = next;
      setConfig(next);
      if (pendingChangeRef.current) pendingChangeRef.current.patchCount += 1;
      if (options?.trace) {
        console.groupCollapsed(
          `%c[store] applyPatch · ${patch.op}`,
          'color:#a855f7;font-weight:bold',
        );
        console.log('patch:', patch);
        console.log('config before:', current);
        console.log('config after:', next);
        console.groupEnd();
      }
      if (options?.persist) {
        if (options?.trace) {
          console.log(
            '%c[store] persist →',
            'color:#f59e0b;font-weight:bold',
            '/api/patch',
            { slug: pageSlug, patch, rationale: options.rationale },
          );
        }
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
  const replace = useCallback(
    (next: PageConfig, options?: { clearHistory?: boolean }) => {
      setCurrentConfig(next);
      if (options?.clearHistory) {
        pendingChangeRef.current = null;
        updateHistory(EMPTY_CHANGE_HISTORY);
      }
    },
    [setCurrentConfig, updateHistory],
  );

  const beginChangeSet = useCallback((label: string): string => {
    if (pendingChangeRef.current) return pendingChangeRef.current.id;
    const id = `change_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    pendingChangeRef.current = {
      id,
      label,
      patchCount: 0,
      before: configRef.current,
    };
    return id;
  }, []);

  const endChangeSet = useCallback(
    (id: string): ChangeReceipt | null => {
      const pending = pendingChangeRef.current;
      if (!pending || pending.id !== id) return null;
      pendingChangeRef.current = null;
      if (pending.patchCount === 0) return null;
      updateHistory(
        commitHistory(historyRef.current, {
          ...pending,
          after: configRef.current,
        }),
      );
      return { id: pending.id, label: pending.label, patchCount: pending.patchCount };
    },
    [updateHistory],
  );

  const undoChange = useCallback(
    (id?: string): boolean => {
      const result = undoHistory(historyRef.current, id);
      if (!result.config) return false;
      updateHistory(result.history);
      setCurrentConfig(result.config);
      persistSnapshot(result.config, 'Undo personalization change');
      return true;
    },
    [persistSnapshot, setCurrentConfig, updateHistory],
  );

  const redoChange = useCallback(
    (id?: string): boolean => {
      const result = redoHistory(historyRef.current, id);
      if (!result.config) return false;
      updateHistory(result.history);
      setCurrentConfig(result.config);
      persistSnapshot(result.config, 'Redo personalization change');
      return true;
    },
    [persistSnapshot, setCurrentConfig, updateHistory],
  );

  const latestUndoId = historyRef.current.past.at(-1)?.id ?? null;
  const latestRedoId = historyRef.current.future.at(-1)?.id ?? null;

  // Keep the global chat bridge in sync every render (not only in useEffect).
  // Chat lives outside PageStoreProvider; registering here ensures patches
  // from SSE always reach the mounted page's dispatch.
  registerPageBridge({
    pageSlug,
    config,
    dispatch,
    replace,
    beginChangeSet,
    endChangeSet,
    watchingId,
    watchingTitle,
    watchingThumbnail,
    watchingPrice,
    youtubeMode,
    liveFeedMode,
  });
  useEffect(() => () => unregisterPageBridge(pageSlug), [pageSlug]);

  return (
    <PageStoreContext.Provider
      value={{
        config,
        pageSlug,
        dispatch,
        replace,
        beginChangeSet,
        endChangeSet,
        undoChange,
        redoChange,
        latestUndoId,
        latestRedoId,
        magicPointerActive,
        setMagicPointerActive,
        ytContinuation,
        setYtContinuation,
        ytChips: initialYtChips,
        youtubeMode,
        liveFeedMode,
        slackMeta: initialSlackMeta,
        watchingId,
        watchingTitle,
        watchingThumbnail,
        watchingPrice,
        setWatching,
        activeNav,
        selectedChannel,
        setActiveNav,
        searchQuery,
        enterSearch,
        exitSearch,
      }}
    >
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
