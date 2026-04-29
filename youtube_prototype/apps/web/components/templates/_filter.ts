import type { PageConfig, Video } from '@showcase/shared';

/**
 * Word-boundary fuzzy match: `'photography'` matches a tag of `'underwater photography'`
 * (because the tag splits into `['underwater', 'photography']`).
 * This makes filters resilient to compound tags Claude tends to emit.
 */
function tagMatches(filterTag: string, videoTags: string[]): boolean {
  const f = filterTag.toLowerCase().trim();
  if (!f) return true;
  return videoTags.some((vt) => {
    const v = vt.toLowerCase().trim();
    if (v === f) return true;
    if (v.includes(f) || f.includes(v)) return true;
    const words = v.split(/[\s\-_/,]+/);
    return words.includes(f);
  });
}

function channelMatches(filterChannel: string, videoChannel: string): boolean {
  return filterChannel.toLowerCase().trim() === videoChannel.toLowerCase().trim()
    || videoChannel.toLowerCase().includes(filterChannel.toLowerCase().trim());
}

export function applyFeedFilter(videos: Video[], config: PageConfig): Video[] {
  const { filter, sort } = config;
  let out = videos;

  if (filter.requireTags.length > 0) {
    out = out.filter((v) => filter.requireTags.every((t) => tagMatches(t, v.tags)));
  }
  if (filter.exclude.length > 0) {
    out = out.filter((v) => !filter.exclude.some((t) => tagMatches(t, v.tags)));
  }
  if (filter.blockChannels.length > 0) {
    out = out.filter((v) => !filter.blockChannels.some((c) => channelMatches(c, v.channel.name)));
  }
  if (filter.include.length > 0) {
    out = out.filter(
      (v) => filter.include.some((t) => tagMatches(t, v.tags) || v.category === t),
    );
  }
  if (filter.minDurationSeconds || filter.maxDurationSeconds) {
    out = out.filter((v) => {
      const secs = parseDuration(v.duration);
      if (filter.minDurationSeconds && secs < filter.minDurationSeconds) return false;
      if (filter.maxDurationSeconds && secs > filter.maxDurationSeconds) return false;
      return true;
    });
  }
  if (filter.minSubscriberCount || filter.maxSubscriberCount) {
    out = out.filter((v) => {
      const subs = v.channel.subscriberCount ?? 0;
      if (filter.minSubscriberCount && subs < filter.minSubscriberCount) return false;
      if (filter.maxSubscriberCount && subs > filter.maxSubscriberCount) return false;
      return true;
    });
  }

  switch (sort.by) {
    case 'recent':
      out = [...out].reverse();
      break;
    case 'popular':
      out = [...out].sort((a, b) => (sort.order === 'asc' ? a.views - b.views : b.views - a.views));
      break;
    case 'duration':
      out = [...out].sort((a, b) => {
        const da = parseDuration(a.duration);
        const db = parseDuration(b.duration);
        return sort.order === 'asc' ? da - db : db - da;
      });
      break;
  }

  return out;
}

function parseDuration(s: string): number {
  const parts = s.split(':').map(Number);
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  if (parts.length === 3) return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
  return 0;
}
