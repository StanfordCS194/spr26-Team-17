import type { PageConfig, Patch, Video } from '@showcase/shared';
import type { SiteBrand } from '@/lib/site-brand';
import type { HomeSnapshot } from '@/lib/store';

export const ROW_SECTIONS_TO_HIDE: ReadonlyArray<string> = [
  'ContinueWatchingRow',
  'RecommendedRow',
  'ShortsRow',
];

export const AMAZON_CHIP_QUERIES: Record<string, string> = {
  All: 'best sellers',
  'Best Sellers': 'best sellers',
  Electronics: 'electronics best sellers',
  Home: 'home kitchen',
  Books: 'books bestsellers',
  Fashion: 'fashion',
  Deals: "today's deals",
};

export const INSTAGRAM_CHIP_FILTERS: Record<string, { tags?: string[]; media?: 'video' | 'photo' }> = {
  All: {},
  Reels: { media: 'video' },
  Photos: { media: 'photo' },
  Following: {},
};

export {
  filterVideosForSlackChip,
  filterVideosForSlackChannel,
  filterVideosForSlackSearch,
  SLACK_CATALOG,
} from '@/lib/slack/message';

export function searchApiPath(brand: SiteBrand, query: string): string {
  const q = encodeURIComponent(query);
  if (brand === 'amazon') return `/api/amazon/search?q=${q}`;
  if (brand === 'instagram') return `/api/instagram/search?q=${q}`;
  if (brand === 'slack') return `/api/slack/search?q=${q}`;
  return `/api/yt/search?q=${q}`;
}

export async function fetchBrandSearch(
  brand: SiteBrand,
  query: string,
): Promise<{ videos: Video[]; continuation: string | null }> {
  const res = await fetch(searchApiPath(brand, query));
  if (!res.ok) return { videos: [], continuation: null };
  const data = (await res.json()) as {
    ok?: boolean;
    videos?: Video[];
    continuation?: string | null;
  };
  if (!data.ok || !Array.isArray(data.videos) || data.videos.length === 0) {
    return { videos: [], continuation: null };
  }
  const continuation =
    typeof data.continuation === 'string' && data.continuation.length > 0
      ? data.continuation
      : null;
  return { videos: data.videos, continuation };
}

export function feedMoreApiPath(brand: SiteBrand): string {
  if (brand === 'amazon') return '/api/amazon/more';
  if (brand === 'instagram') return '/api/instagram/more';
  if (brand === 'slack') return '/api/slack/more';
  return '/api/yt/more';
}

export function hideRowSections(
  dispatch: (patch: Patch, options?: { persist?: boolean }) => void,
  config: PageConfig,
): void {
  for (const s of config.sections) {
    if (ROW_SECTIONS_TO_HIDE.includes(s.type)) {
      dispatch({ op: 'remove_section', sectionId: s.id });
    }
  }
}

export function showRowSections(
  dispatch: (patch: Patch, options?: { persist?: boolean }) => void,
  config: PageConfig,
): void {
  for (const s of config.sections) {
    if (ROW_SECTIONS_TO_HIDE.includes(s.type)) {
      dispatch({ op: 'update_section', sectionId: s.id, patch: { visible: true } });
    }
  }
}

export function applyVideosToGrid(
  dispatch: (patch: Patch, options?: { persist?: boolean }) => void,
  config: PageConfig,
  videos: Video[],
  columns = 4,
): void {
  const grid = config.sections.find((s) => s.type === 'VideoGrid');
  if (grid) {
    dispatch({ op: 'update_section', sectionId: grid.id, patch: { videos } });
    return;
  }
  for (const r of config.sections.filter((s) => s.type === 'MoodBoard')) {
    dispatch({ op: 'remove_section', sectionId: r.id });
  }
  dispatch({
    op: 'add_section',
    sectionType: 'VideoGrid',
    props: { videos, columns, density: 'cozy' },
    position: { after: 'categoryChips' },
  });
}

export type SearchApplyArgs = {
  brand: SiteBrand;
  query: string;
  config: PageConfig;
  ytContinuation: string | null;
  dispatch: (patch: Patch, options?: { persist?: boolean; rationale?: string }) => void;
  enterSearch: (query: string, snapshot: HomeSnapshot) => void;
  setYtContinuation: (token: string | null) => void;
  hideRows?: boolean;
};

export async function applyBrandSearch({
  brand,
  query,
  config,
  ytContinuation,
  dispatch,
  enterSearch,
  setYtContinuation,
  hideRows = true,
}: SearchApplyArgs): Promise<boolean> {
  const { videos, continuation } = await fetchBrandSearch(brand, query);
  if (videos.length === 0) return false;

  enterSearch(query, { config, ytContinuation });
  const columns =
    brand === 'amazon' ? 5 : brand === 'instagram' ? 3 : brand === 'slack' ? 2 : 4;
  applyVideosToGrid(dispatch, config, videos, columns);
  setYtContinuation(continuation);
  dispatch({ op: 'set_filter', filter: { requireTags: [] } });
  if (hideRows) hideRowSections(dispatch, config);
  return true;
}

export function filterVideosForInstagramChip(videos: Video[], chip: string): Video[] {
  const def = INSTAGRAM_CHIP_FILTERS[chip];
  if (!def || chip === 'All' || chip === 'Following') return videos;
  if (def.media === 'video') {
    return videos.filter((v) => v.tags.includes('video') || (v.duration !== 'Post' && v.duration.endsWith('s')));
  }
  if (def.media === 'photo') {
    return videos.filter((v) => v.tags.includes('photo') || v.duration === 'Post');
  }
  if (def.tags) {
    return videos.filter((v) => def.tags!.some((t) => v.tags.includes(t)));
  }
  return videos;
}
