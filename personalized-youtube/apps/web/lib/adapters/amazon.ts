import { getAmazonSearchFeed } from '../amazon/client';
import type { FeedAdapter } from './index';

export const amazonAdapter: FeedAdapter = {
  async getFeed() {
    const result = await getAmazonSearchFeed();
    if (result.kind !== 'ok') {
      throw new Error(`amazon adapter unavailable: ${result.reason}`);
    }
    return {
      videos: result.videos,
      categories: ['All', 'Deals', 'Best Sellers'],
      continuation: result.continuation,
    };
  },
};
