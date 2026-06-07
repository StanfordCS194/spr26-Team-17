import { describe, expect, it } from 'vitest';
import { applyPatch, PageConfigSchema, type PageConfig } from '@showcase/shared';
import {
  EMPTY_CHANGE_HISTORY,
  commitHistory,
  redoHistory,
  undoHistory,
} from './change-history';

function config(title: string): PageConfig {
  return { meta: { title } } as PageConfig;
}

describe('change history', () => {
  it('undoes and redoes one grouped AI change', () => {
    const before = config('Before');
    const after = config('After');
    const committed = commitHistory(EMPTY_CHANGE_HISTORY, {
      id: 'change-1',
      label: 'Make it calmer',
      patchCount: 3,
      before,
      after,
    });

    const undone = undoHistory(committed, 'change-1');
    expect(undone.config).toBe(before);
    expect(undone.history.past).toHaveLength(0);
    expect(undone.history.future).toHaveLength(1);

    const redone = redoHistory(undone.history, 'change-1');
    expect(redone.config).toBe(after);
    expect(redone.history.past).toHaveLength(1);
    expect(redone.history.future).toHaveLength(0);
  });

  it('restores personalization without replacing a refreshed live feed', () => {
    const before = PageConfigSchema.parse({
      id: 'page',
      slug: 'youtube-clone',
      theme: { mode: 'light', accent: '#FF0000' },
      sections: [
        {
          id: 'videoGrid',
          type: 'VideoGrid',
          props: {
            videos: [
              {
                id: 'old',
                title: 'Old feed',
                channel: { name: 'Channel', avatar: '' },
                thumbnail: '',
                duration: '10:00',
                views: 1,
                postedAgo: 'today',
                category: 'test',
              },
            ],
          },
        },
      ],
    });
    const live = PageConfigSchema.parse({
      ...before,
      theme: { ...before.theme, mode: 'dark', accent: '#00FF00' },
      sections: before.sections.map((section) =>
        section.type === 'VideoGrid'
          ? {
              ...section,
              props: {
                ...section.props,
                videos: [{ ...section.props.videos[0]!, id: 'fresh', title: 'Fresh feed' }],
              },
            }
          : section,
      ),
    });

    const restored = applyPatch(live, { op: 'replace_config', config: before });
    const grid = restored.sections.find((section) => section.type === 'VideoGrid');

    expect(restored.theme.mode).toBe('light');
    expect(grid?.type === 'VideoGrid' ? grid.props.videos[0]?.id : null).toBe('fresh');
  });

  it('only acts on the latest available receipt', () => {
    const first = commitHistory(EMPTY_CHANGE_HISTORY, {
      id: 'first',
      label: 'First',
      patchCount: 1,
      before: config('A'),
      after: config('B'),
    });
    const second = commitHistory(first, {
      id: 'second',
      label: 'Second',
      patchCount: 1,
      before: config('B'),
      after: config('C'),
    });

    expect(undoHistory(second, 'first').config).toBeNull();
    expect(undoHistory(second, 'second').config?.meta.title).toBe('B');
  });
});
