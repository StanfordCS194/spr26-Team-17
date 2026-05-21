import type { Video } from '@showcase/shared';
import { isSlackChannelId } from '@/lib/intercept/slack-input';
import slackFeed from '@/lib/mock-data/slack-feed.json';

export type SlackReply = { author: string; time: string; text: string; avatar?: string };

/** @deprecated import from `@/lib/intercept/slack-input` */
export function isSlackApiChannelId(id: string): boolean {
  return isSlackChannelId(id);
}

export function slackChannelIdFromVideo(video: Video): string | null {
  const tag = video.tags.find((t) => t.startsWith('slackcid:'));
  return tag ? tag.slice(9) : null;
}

export function slackMessageTsFromVideo(video: Video): string | null {
  const tag = video.tags.find((t) => t.startsWith('slackts:'));
  if (tag) return tag.slice(8);
  const m = video.id.match(/^slack(\d{10,13})$/);
  if (!m?.[1]) return null;
  const raw = m[1];
  if (raw.length <= 10) return `${raw}.000000`;
  return `${raw.slice(0, 10)}.${raw.slice(10)}`;
}

/** Only use avatar URLs from Slack (or other real sources) — never pravatar placeholders. */
export function slackAvatarSrc(url: string | undefined | null): string | undefined {
  if (!url?.trim()) return undefined;
  if (url.includes('pravatar.cc')) return undefined;
  return url;
}

export const SLACK_WORKSPACE_NAME = 'Stanford CS194W';
export const SLACK_DEFAULT_CHANNEL = '# cs194w-team';

export const SLACK_CHANNEL_TOPICS: Record<string, string> = {
  '# cs194w-team': 'Team coordination for CS194W showcase — demos, PRs, TA walkthroughs',
  '# eng': 'Engineering — intercept adapters, security, deploy',
  '# design': 'UI mocks and brand chrome',
  '# standup': 'Daily standup notes',
  '# announcements': 'Course staff announcements',
};

/** Full mock catalog — source of truth for chip/sidebar reset. */
export const SLACK_CATALOG: Video[] = slackFeed.videos as Video[];

export const SLACK_SIDEBAR_CHANNELS = [
  { id: 'cs194w', label: '# cs194w-team', unread: 3 },
  { id: 'eng', label: '# eng', unread: 0 },
  { id: 'design', label: '# design', unread: 0 },
  { id: 'standup', label: '# standup', unread: 2 },
  { id: 'announcements', label: '# announcements', unread: 0 },
] as const;

export const SLACK_SIDEBAR_DMS = [
  { id: 'ein', label: 'Ein Jun', unread: 0 },
  { id: 'akira', label: 'Akira Tran', unread: 1 },
  { id: 'umut', label: 'Umut Eren', unread: 0 },
] as const;

/** @deprecated use SLACK_SIDEBAR_CHANNELS */
export const SLACK_CHANNELS = [
  { id: 'cs194w', label: '# cs194w-team', kind: 'channel' as const, unread: 3 },
  { id: 'eng', label: '# eng', kind: 'channel' as const },
  { id: 'design', label: '# design', kind: 'channel' as const },
  { id: 'standup', label: '# standup', kind: 'channel' as const, unread: 2 },
  { id: 'announcements', label: '# announcements', kind: 'channel' as const },
];

export function slackAuthor(video: Video): string {
  const tag = video.tags.find((t) => t.startsWith('author:'));
  if (tag) return tag.slice(7);
  return video.channel.name.replace(/^# /, '');
}

export function slackChannelLabel(video: Video): string {
  const tag = video.tags.find((t) => t.startsWith('slackch:'));
  if (tag) return tag.slice(8);
  if (video.tags.includes('dm')) return video.channel.name;
  return video.channel.name;
}

export function slackIsDm(video: Video): boolean {
  return video.tags.includes('dm');
}

export function slackIsThread(video: Video): boolean {
  return video.tags.includes('thread');
}

export function slackIsUnread(video: Video): boolean {
  return video.postedAgo === 'unread';
}

export function slackUnreadCount(video: Video): number {
  return slackIsUnread(video) && video.views > 0 ? video.views : 0;
}

const REPLY_MARKER = '\n[replies]\n';

export function slackBodyText(video: Video): string {
  const raw = video.description.trim();
  if (!raw) return '';
  const idx = raw.indexOf(REPLY_MARKER);
  return idx === -1 ? raw : raw.slice(0, idx).trim();
}

export function parseSlackReplies(video: Video): SlackReply[] {
  const raw = video.description;
  const idx = raw.indexOf(REPLY_MARKER);
  if (idx === -1) return [];
  return raw
    .slice(idx + REPLY_MARKER.length)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [author, time, ...rest] = line.split('|');
      return { author: author ?? 'Teammate', time: time ?? '', text: rest.join('|') };
    });
}

export function filterVideosForSlackChip(videos: Video[], chip: string): Video[] {
  if (chip === 'All') return videos;
  if (chip === 'Unreads') return videos.filter((v) => slackIsUnread(v));
  if (chip === 'Channels') return videos.filter((v) => v.tags.includes('channel') && !slackIsThread(v));
  if (chip === 'DMs') return videos.filter((v) => slackIsDm(v));
  if (chip === 'Threads') return videos.filter((v) => slackIsThread(v));
  return videos;
}

export function filterVideosForSlackChannel(videos: Video[], channel: string | null): Video[] {
  if (!channel || channel === 'Home' || channel === 'Threads') return videos;
  if (channel === 'Direct messages' || channel === 'DMs') {
    return videos.filter((v) => slackIsDm(v));
  }
  // DM peer by person name
  if (!channel.startsWith('#')) {
    return videos.filter(
      (v) => slackIsDm(v) && (slackChannelLabel(v) === channel || slackAuthor(v) === channel || v.channel.name === channel),
    );
  }
  return videos.filter(
    (v) => slackChannelLabel(v) === channel || v.channel.name === channel,
  );
}

export function filterVideosForSlackSearch(videos: Video[], query: string): Video[] {
  const q = query.trim().toLowerCase();
  if (!q) return videos;
  return videos.filter((v) => {
    const hay = [
      v.title,
      slackAuthor(v),
      slackChannelLabel(v),
      slackBodyText(v),
    ]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}
