import type { Video, Short } from '@showcase/shared';
import { createMockAdapter, mockAdapter } from './mock';
import { getFeed as getYoutubeFeed } from './youtube';
import { amazonAdapter } from './amazon';
import { instagramAdapter } from './instagram';
import { slackAdapter } from './slack';
import type { FeedSource } from './feed-source';
import type { YtChip } from '../innertube/client';
import type { SlackBootstrapMeta } from '../slack/client';

export type { FeedSource } from './feed-source';
export { resolveFeedSource, isLiveFeedSource } from './feed-source';

export interface FeedAdapter {
  getFeed(): Promise<{
    videos: Video[];
    categories: string[];
    shorts?: Short[];
    chips?: YtChip[];
    continuation?: string | null;
    slackMeta?: SlackBootstrapMeta;
  }>;
  requestMoreContent?(category: string, count: number, style?: string): Promise<Video[]>;
}

function mockAdapterForSite(siteSlug: string): FeedAdapter {
  return createMockAdapter(siteSlug);
}

export function getAdapter(source: FeedSource, siteSlug = 'youtube-clone'): FeedAdapter {
  const fallback = mockAdapterForSite(siteSlug);

  if (source === 'mock') return fallback;

  if (source === 'amazon') {
    return {
      async getFeed() {
        try {
          return await amazonAdapter.getFeed();
        } catch (err) {
          console.warn(`[adapters] amazon fell back to mock: ${(err as Error).message}`);
          return fallback.getFeed();
        }
      },
    };
  }

  if (source === 'instagram') {
    return {
      async getFeed() {
        try {
          return await instagramAdapter.getFeed();
        } catch (err) {
          console.warn(`[adapters] instagram fell back to mock: ${(err as Error).message}`);
          return fallback.getFeed();
        }
      },
    };
  }

  if (source === 'slack') {
    return {
      async getFeed() {
        try {
          return await slackAdapter.getFeed();
        } catch (err) {
          console.warn(`[adapters] slack fell back to mock: ${(err as Error).message}`);
          return fallback.getFeed();
        }
      },
    };
  }

  // youtube
  return {
    async getFeed() {
      const result = await getYoutubeFeed();
      if (result.kind !== 'ok') {
        console.warn(`[adapters] youtube fell back to mock: ${result.reason}`);
        return fallback.getFeed();
      }
      return {
        videos: result.videos,
        categories: [],
        shorts: result.shorts,
        chips: result.chips,
        continuation: result.continuation,
      };
    },
    requestMoreContent: mockAdapter.requestMoreContent?.bind(mockAdapter),
  };
}
