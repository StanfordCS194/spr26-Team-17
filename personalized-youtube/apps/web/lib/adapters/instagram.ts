import { getInstagramTimelineFeed } from '../instagram/client';
import type { FeedAdapter } from './index';

export const instagramAdapter: FeedAdapter = {
  async getFeed() {
    const result = await getInstagramTimelineFeed();
    if (result.kind !== 'ok') {
      throw new Error(`instagram adapter unavailable: ${result.reason}`);
    }
    return { videos: result.videos, categories: ['All', 'Following', 'Photos', 'Reels'] };
  },
};
