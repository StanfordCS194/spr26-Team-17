'use client';

import type { PageConfig, Section } from '@showcase/shared';
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

export function CategoryChips({ section }: { section: Section; config: PageConfig }) {
  const { dispatch } = usePageStore();
  if (section.type !== 'CategoryChips') return null;
  const { active, chips } = section.props;

  const onClick = (chip: string) => {
    const def = CHIP_FILTER[chip] ?? {};

    // Update which chip looks active
    dispatch(
      { op: 'update_section', sectionId: section.id, patch: { active: chip } },
      { persist: true, rationale: `chip ${chip} clicked` },
    );

    if (chip === 'All') {
      // clear category filter while preserving any user-set excludes / blocks
      dispatch({ op: 'set_filter', filter: { requireTags: [] } }, { persist: true });
      dispatch(
        { op: 'set_sort', sort: { by: 'recommended', order: 'desc' } },
        { persist: true },
      );
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
    <div className="sticky top-14 z-20 flex gap-3 overflow-x-auto border-b border-[color:var(--border)] bg-[color:var(--bg)] px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((chip) => {
        const isActive = chip === active;
        return (
          <button
            key={chip}
            onClick={() => onClick(chip)}
            className={`shrink-0 rounded-md px-3 py-1 text-sm transition-colors ${
              isActive
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
