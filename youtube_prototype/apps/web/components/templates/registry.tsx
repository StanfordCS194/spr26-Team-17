import type { PageConfig, Section } from '@showcase/shared';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { CategoryChips } from './CategoryChips';
import { VideoGrid } from './VideoGrid';
import { FilterSummary } from './FilterSummary';
import { RecommendedRow } from './RecommendedRow';
import { ShortsRow } from './ShortsRow';
import { ContinueWatchingRow } from './ContinueWatchingRow';
import { CustomNote } from './CustomNote';

export interface TemplateEntry {
  Component: (props: { section: Section; config: PageConfig }) => React.ReactNode;
  claudeToolHint: string;
}

export const REGISTRY: Record<string, TemplateEntry> = {
  TopBar: {
    Component: TopBar,
    claudeToolHint:
      'Top navigation bar with logo, search, profile chip. Use to change search-bar size, logo text, or profile visibility.',
  },
  Sidebar: {
    Component: Sidebar,
    claudeToolHint:
      'Left navigation sidebar with category links. Use to collapse/expand or change pinned items.',
  },
  CategoryChips: {
    Component: CategoryChips,
    claudeToolHint:
      'Horizontal scrolling chips above the feed for filtering by topic (All, Music, Gaming, etc.). Use to change which chip is active or which chips appear.',
  },
  VideoGrid: {
    Component: VideoGrid,
    claudeToolHint:
      'The main video card grid. Use to change column count (2-5), density (compact|cozy|comfortable), or to inject video filtering by editing this section.',
  },
  FilterSummary: {
    Component: FilterSummary,
    claudeToolHint:
      'Pills row showing what filters/sort are currently active. Auto-derives content from the page-level filter and sort state. You normally do not edit this directly — it updates when set_filter / set_sort fires.',
  },
  RecommendedRow: {
    Component: RecommendedRow,
    claudeToolHint:
      'Horizontal carousel of recommended videos. Edit headline ("Recommended for you", "Picked for jazz fans", etc.) or remove the section entirely.',
  },
  ShortsRow: {
    Component: ShortsRow,
    claudeToolHint:
      'Vertical-aspect short-form video shelf. Set visible=false (or remove_section) to hide entirely; or change headline.',
  },
  ContinueWatchingRow: {
    Component: ContinueWatchingRow,
    claudeToolHint:
      'Resume-where-you-left-off shelf. Hide via visible=false when the visitor wants a fresh-start feel.',
  },
  CustomNote: {
    Component: CustomNote,
    claudeToolHint:
      'A pinned text note on the page. Use when the visitor asks to remember something ("Note to self: rewatch this Sunday"). Set text and visible=true.',
  },
};

export function renderSection(section: Section, config: PageConfig): React.ReactNode {
  const entry = REGISTRY[section.type];
  if (!entry) return null;
  const { Component } = entry;
  return <Component section={section} config={config} />;
}
