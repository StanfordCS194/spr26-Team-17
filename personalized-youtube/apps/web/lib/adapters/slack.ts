import { getSlackWorkspaceFeed } from '../slack/client';
import type { FeedAdapter } from './index';

export const slackAdapter: FeedAdapter = {
  async getFeed() {
    const result = await getSlackWorkspaceFeed();
    if (result.kind !== 'ok') {
      throw new Error(`slack adapter unavailable: ${result.reason}`);
    }
    return {
      videos: result.videos,
      categories: ['All', 'Unreads', 'Channels', 'DMs', 'Threads'],
      continuation: result.continuation,
      slackMeta: result.meta,
    };
  },
};
