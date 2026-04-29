import type { Video } from '@showcase/shared';
import { mockAdapter } from './mock';

export interface FeedAdapter {
  getFeed(): Promise<{ videos: Video[]; categories: string[] }>;
  requestMoreContent?(category: string, count: number, style?: string): Promise<Video[]>;
}

export function getAdapter(): FeedAdapter {
  const which = process.env.FEED_ADAPTER ?? 'mock';
  switch (which) {
    case 'mock':
      return mockAdapter;
    case 'youtube':
      throw new Error('youtube adapter not built yet — Week 2 deliverable. See docs/youtube-adapter.md');
    default:
      throw new Error(`Unknown FEED_ADAPTER: ${which}`);
  }
}
