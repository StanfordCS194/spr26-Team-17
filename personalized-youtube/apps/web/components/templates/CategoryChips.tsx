'use client';

import type { PageConfig, Section, Video } from '@showcase/shared';
import {
  AMAZON_CHIP_QUERIES,
  applyBrandSearch,
  applyVideosToGrid,
  filterVideosForInstagramChip,
  ROW_SECTIONS_TO_HIDE,
  showRowSections,
} from '@/lib/feed-interaction';
import { getSiteBrand } from '@/lib/site-brand';
import { usePageStore } from '@/lib/store';

const CHIP_FILTER: Record<string, { tags?: string[]; sortRecent?: boolean }> = {
  All: {},
  Music: { tags: ['music'] },
  Gaming: { tags: ['gaming'] },
  Live: { tags: ['live'] },
  News: { tags: ['news'] },
  Cooking: { tags: ['cooking'] },
  Comedy: { tags: ['comedy'] },
  'Recently uploaded': { sortRecent: true },
};

export function CategoryChips({ section, config }: { section: Section; config: PageConfig }) {
  const {
    dispatch,
    setYtContinuation,
    youtubeMode,
    liveFeedMode,
    ytChips,
    ytContinuation,
    enterSearch,
    exitSearch,
  } = usePageStore();
  if (section.type !== 'CategoryChips') return null;
  const { active, chips } = section.props;
  const brand = getSiteBrand(config.slug);
  const chipParamsByText = new Map(ytChips.map((c) => [c.text, c.params] as const));

  function setRowsVisible(visible: boolean): void {
    for (const s of config.sections) {
      if (ROW_SECTIONS_TO_HIDE.includes(s.type)) {
        dispatch({ op: 'update_section', sectionId: s.id, patch: { visible } });
      }
    }
  }

  const onClick = (chip: string) => {
    dispatch(
      { op: 'update_section', sectionId: section.id, patch: { active: chip } },
      { persist: true, rationale: `chip ${chip} clicked` },
    );

    // YouTube live: browse API with chip params token.
    if (brand === 'youtube' && youtubeMode) {
      const params = chipParamsByText.get(chip) ?? null;
      const qs = new URLSearchParams({ id: 'FEwhat_to_watch' });
      if (chip !== 'All' && typeof params === 'string' && params.length > 0) {
        qs.set('params', params);
      }
      void fetch(`/api/yt/browse?${qs.toString()}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { ok?: boolean; videos?: Video[]; continuation?: string | null } | null) => {
          if (!data?.ok || !Array.isArray(data.videos) || data.videos.length === 0) return;
          applyVideosToGrid(dispatch, config, data.videos, 4);
          setYtContinuation(
            typeof data.continuation === 'string' && data.continuation.length > 0 ? data.continuation : null,
          );
          dispatch({ op: 'set_filter', filter: { requireTags: [] } });
          setRowsVisible(chip === 'All');
        })
        .catch(() => {});
      return;
    }

    // Amazon live: each chip runs an Amazon search query.
    if (brand === 'amazon' && liveFeedMode) {
      const query = AMAZON_CHIP_QUERIES[chip] ?? chip;
      if (chip === 'All') {
        exitSearch();
      }
      void applyBrandSearch({
        brand: 'amazon',
        query,
        config,
        ytContinuation,
        dispatch,
        enterSearch,
        setYtContinuation,
        hideRows: chip !== 'All',
      }).then((ok) => {
        if (chip === 'All' && ok) showRowSections(dispatch, config);
      });
      return;
    }

    // Instagram live: All refreshes timeline; Reels/Photos filter client-side after fetch.
    if (brand === 'instagram' && liveFeedMode) {
      if (chip === 'All' || chip === 'Following') {
        exitSearch();
        void applyBrandSearch({
          brand: 'instagram',
          query: '',
          config,
          ytContinuation,
          dispatch,
          enterSearch,
          setYtContinuation,
        }).then(() => showRowSections(dispatch, config));
        return;
      }
      void applyBrandSearch({
        brand: 'instagram',
        query: chip === 'Reels' ? 'reels' : chip.toLowerCase(),
        config,
        ytContinuation,
        dispatch,
        enterSearch,
        setYtContinuation,
      }).then((ok) => {
        if (!ok) return;
        const grid = config.sections.find((s) => s.type === 'VideoGrid');
        if (!grid || grid.type !== 'VideoGrid') return;
        const filtered = filterVideosForInstagramChip(grid.props.videos, chip);
        if (filtered.length > 0) {
          dispatch({ op: 'update_section', sectionId: grid.id, patch: { videos: filtered } });
        }
      });
      return;
    }

    // Mock mode: tag-filter the local catalog.
    if (chip === 'All') {
      dispatch({ op: 'set_filter', filter: { requireTags: [] } }, { persist: true });
      dispatch({ op: 'set_sort', sort: { by: 'recommended', order: 'desc' } }, { persist: true });
      return;
    }
    const def = CHIP_FILTER[chip] ?? {};
    if (brand === 'instagram') {
      const grid = config.sections.find((s) => s.type === 'VideoGrid');
      if (grid && grid.type === 'VideoGrid') {
        const filtered = filterVideosForInstagramChip(grid.props.videos, chip);
        dispatch({ op: 'update_section', sectionId: grid.id, patch: { videos: filtered } });
      }
      return;
    }
    if (def.tags) {
      dispatch({ op: 'set_filter', filter: { requireTags: def.tags } }, { persist: true });
    }
    if (def.sortRecent) {
      dispatch(
        { op: 'set_sort', sort: { by: 'recent', order: 'desc' } },
        { persist: true, rationale: 'recently uploaded chip' },
      );
    }
  };

  return (
    <div
      className={`sticky z-20 flex gap-3 overflow-x-auto border-b border-[color:var(--border)] px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        brand === 'amazon' ? 'top-[6.5rem] bg-white' : brand === 'instagram' ? 'top-[60px] bg-white' : 'top-14 bg-[color:var(--surface)]'
      }`}
      style={brand === 'youtube' ? { backdropFilter: `blur(var(--surface-blur))`, WebkitBackdropFilter: `blur(var(--surface-blur))` } : undefined}
    >
      {chips.map((chip) => {
        const isActive = chip === active;
        return (
          <button
            key={chip}
            onClick={() => onClick(chip)}
            className={`shrink-0 rounded-full px-3 py-1 text-sm transition-colors ${
              brand === 'amazon'
                ? isActive
                  ? 'bg-[#232f3e] text-white'
                  : 'border border-[#d5d9d9] bg-white text-[#0f1111] hover:bg-[#f7fafa]'
                : brand === 'instagram'
                  ? isActive
                    ? 'bg-[color:var(--fg)] text-[color:var(--bg)]'
                    : 'bg-[color:var(--muted)] text-[color:var(--fg)]'
                  : isActive
                    ? 'bg-[color:var(--fg)] text-[color:var(--bg)]'
                    : 'bg-[color:var(--muted)] text-[color:var(--fg)] hover:bg-[color:var(--border)]'
            }`}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}
