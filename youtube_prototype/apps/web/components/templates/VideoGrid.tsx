'use client';

import type { PageConfig, Section } from '@showcase/shared';
import { VideoCard } from './VideoCard';
import { applyFeedFilter } from './_filter';
import { usePageStore } from '@/lib/store';

const COLUMN_CLASSES = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
} as const;

const DENSITY = {
  compact: { gap: 'gap-3', padY: 'py-1' },
  cozy: { gap: 'gap-5', padY: 'py-2' },
  comfortable: { gap: 'gap-7', padY: 'py-3' },
} as const;

export function VideoGrid({ section, config }: { section: Section; config: PageConfig }) {
  const { dispatch } = usePageStore();
  if (section.type !== 'VideoGrid') return null;
  const { columns, density, videos } = section.props;
  const d = DENSITY[density];
  const filtered = applyFeedFilter(videos, config);

  if (filtered.length === 0) {
    const hasFilters =
      config.filter.requireTags.length > 0 ||
      config.filter.exclude.length > 0 ||
      config.filter.blockChannels.length > 0 ||
      config.filter.include.length > 0 ||
      !!config.filter.minDurationSeconds ||
      !!config.filter.maxDurationSeconds ||
      !!config.filter.minSubscriberCount ||
      !!config.filter.maxSubscriberCount;

    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--muted)]">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current text-[color:var(--muted-fg)]">
            <path d="M10 4a6 6 0 1 0 3.7 10.7l5.3 5.3 1.4-1.4-5.3-5.3A6 6 0 0 0 10 4zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
          </svg>
        </div>
        <p className="text-lg font-medium">No videos match your filters.</p>
        <p className="max-w-md text-sm text-[color:var(--muted-fg)]">
          Try a broader filter, ask the chat for more content, or clear filters.
        </p>
        {hasFilters && (
          <button
            onClick={() =>
              dispatch(
                {
                  op: 'set_filter',
                  filter: {
                    requireTags: [],
                    exclude: [],
                    blockChannels: [],
                    include: [],
                    minDurationSeconds: undefined,
                    maxDurationSeconds: undefined,
                    minSubscriberCount: undefined,
                    maxSubscriberCount: undefined,
                  },
                },
                { persist: true, rationale: 'cleared via empty-state action' },
              )
            }
            className="mt-2 rounded-full border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-1.5 text-sm hover:bg-[color:var(--muted)]"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`grid ${COLUMN_CLASSES[columns]} ${d.gap} px-6 ${d.padY}`}>
      {filtered.map((v) => (
        <VideoCard key={v.id} video={v} config={config} />
      ))}
    </div>
  );
}
