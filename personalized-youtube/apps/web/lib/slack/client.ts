// Slack — intercept-style client (no Slack SDK).
//
// Replays the web app's session API:
//   GET https://slack.com/api/conversations.history?channel=…
// Auth: SLACK_XOXC (or SLACK_XOXP) + Chrome `d` cookie (xoxd) from app.slack.com.
// Capture xoxc in DevTools → Console:
//   JSON.parse(localStorage.localConfig_v2).teams[document.location.pathname.match(/^\/client\/([A-Z0-9]+)/)[1]].token
//
// Tolerance contract (matches lib/instagram/client.ts):
//   - Returns discriminated unions; no throws from public functions.
//   - Cookie/token values are never logged.
//   - Upstream error bodies are not forwarded in reason strings.

import type { Video } from '@showcase/shared';
import { composeCookieHeader, readSlackCookies } from '../innertube/chrome-cookies';
import { cookieValue, fetchWithSession } from '../intercept/browser-fetch';
import { INTERCEPT_QUERY_MAX_LEN } from '../intercept/api-response';
import {
  isSlackChannelId,
  isSlackListCursor,
  isSlackThreadTs,
  isSlackUserId,
  parseSlackHistoryContinuation,
} from '../intercept/slack-input';
import { isSlackInterceptRuntimeAllowed, slackInterceptBlockedReason } from '../intercept/slack-guard';
import { logInterceptFailure } from '../intercept/security';
import { readSlackXoxcFromChrome } from './chrome-xoxc';

const HISTORY_PAGE_SIZE = 200;
const SLACK_API_METHODS = new Set([
  'auth.test',
  'users.list',
  'users.info',
  'conversations.list',
  'conversations.history',
  'conversations.replies',
  'search.messages',
]);
const LIST_PAGE_SIZE = 200;
const MAX_LIST_PAGES = 25;
const SEARCH_RESULT_CAP = 100;
const MISSING_USER_CAP = 80;
const USER_INFO_CONCURRENCY = 6;

export type SlackSidebarItem = { id: string; label: string; unread: number };

export type SlackBootstrapMeta = {
  workspaceName: string;
  channels: SlackSidebarItem[];
  dms: SlackSidebarItem[];
  defaultChannelId: string;
  defaultChannelLabel: string;
  /** Channel label (# name) → topic/purpose text */
  channelTopics: Record<string, string>;
};

export type SlackFeedResult =
  | {
      kind: 'ok';
      videos: Video[];
      continuation: string | null;
      meta?: SlackBootstrapMeta;
    }
  | { kind: 'unavailable'; reason: string };

type SlackUser = {
  id: string;
  name: string;
  real_name?: string;
  profile?: { image_48?: string; display_name?: string };
};

type SlackChannel = {
  id: string;
  name?: string;
  is_channel?: boolean;
  is_group?: boolean;
  is_im?: boolean;
  is_mpim?: boolean;
  user?: string;
  unread_count_display?: number;
  topic?: { value?: string };
  purpose?: { value?: string };
};

type SessionCache = {
  loadedAt: number;
  workspaceName: string;
  users: Map<string, SlackUser>;
  channels: SlackChannel[];
};

let workspaceCache: SessionCache | null = null;
const CACHE_MS = 30_000;

function guardSlackRuntime():
  | { kind: 'unavailable'; reason: string }
  | null {
  if (!isSlackInterceptRuntimeAllowed()) {
    return { kind: 'unavailable', reason: slackInterceptBlockedReason() };
  }
  return null;
}

async function ensureWorkspaceCache(): Promise<
  | { kind: 'ok'; workspaceName: string; users: Map<string, SlackUser>; channels: SlackChannel[] }
  | { kind: 'unavailable'; reason: string }
> {
  if (workspaceCache && Date.now() - workspaceCache.loadedAt < CACHE_MS) {
    return {
      kind: 'ok',
      workspaceName: workspaceCache.workspaceName,
      users: workspaceCache.users,
      channels: workspaceCache.channels,
    };
  }

  const session = await slackSession();
  if (session.kind !== 'ok') return session;

  const [workspaceName, channels, users] = await Promise.all([
    loadWorkspaceName(),
    loadChannels(),
    loadUsers(),
  ]);

  await loadMissingUsers(channels, users);

  workspaceCache = { loadedAt: Date.now(), workspaceName, users, channels };
  return { kind: 'ok', workspaceName, users, channels };
}

function userAvatarUrl(user: SlackUser | undefined): string {
  return user?.profile?.image_48?.trim() ?? '';
}

let resolvedToken: string | null | undefined;

/** Reset in-memory session cache (setup scripts when switching Chrome profiles). */
export function resetSlackClientCache(): void {
  resolvedToken = undefined;
  workspaceCache = null;
}

async function resolveSlackToken(): Promise<string | null> {
  const env = process.env.SLACK_XOXC?.trim() || process.env.SLACK_XOXP?.trim();
  if (env) {
    resolvedToken = env;
    return env;
  }
  if (resolvedToken !== undefined) return resolvedToken;
  resolvedToken = await readSlackXoxcFromChrome();
  return resolvedToken;
}

function apiNextCursor(json: unknown): string | null {
  const c = (json as { response_metadata?: { next_cursor?: string } }).response_metadata?.next_cursor?.trim();
  return c || null;
}

function formatSlackTs(ts: string): string {
  const ms = Math.floor(parseFloat(ts) * 1000);
  if (!Number.isFinite(ms)) return '';
  const d = new Date(ms);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function userDisplayName(user: SlackUser | undefined, fallback = 'Member'): string {
  if (!user) {
    return isSlackUserId(fallback) ? 'Direct message' : fallback;
  }
  return user.profile?.display_name?.trim() || user.real_name?.trim() || user.name || fallback;
}

function channelLabel(channel: SlackChannel, users: Map<string, SlackUser>): string {
  if (channel.is_im) {
    const peer = users.get(channel.user ?? '');
    return userDisplayName(peer, channel.user ?? 'Direct message');
  }
  if (channel.is_mpim) return channel.name?.replace(/^mpdm-/, '').replace(/-\d+$/, '').replace(/-/g, ', ') ?? 'Group DM';
  const name = channel.name?.trim() || channel.id;
  return `# ${name}`;
}

function messageId(ts: string): string {
  return `slack${ts.replace('.', '')}`;
}

function parseUsers(body: unknown): Map<string, SlackUser> {
  const map = new Map<string, SlackUser>();
  if (typeof body !== 'object' || body === null) return map;
  const members = (body as { members?: unknown[] }).members;
  if (!Array.isArray(members)) return map;
  for (const row of members) {
    if (typeof row !== 'object' || row === null) continue;
    const u = row as SlackUser;
    if (typeof u.id === 'string') map.set(u.id, u);
  }
  return map;
}

function parseChannels(body: unknown): SlackChannel[] {
  if (typeof body !== 'object' || body === null) return [];
  const channels = (body as { channels?: unknown[] }).channels;
  if (!Array.isArray(channels)) return [];
  return channels.filter((c): c is SlackChannel => typeof c === 'object' && c !== null && typeof (c as SlackChannel).id === 'string');
}

function parseMessages(body: unknown): { messages: Record<string, unknown>[]; nextCursor: string | null } {
  if (typeof body !== 'object' || body === null) return { messages: [], nextCursor: null };
  const obj = body as {
    messages?: unknown[];
    response_metadata?: { next_cursor?: string };
  };
  const messages = Array.isArray(obj.messages)
    ? obj.messages.filter((m): m is Record<string, unknown> => typeof m === 'object' && m !== null)
    : [];
  const cursor = obj.response_metadata?.next_cursor?.trim();
  return { messages, nextCursor: cursor || null };
}

function messageToVideo(
  msg: Record<string, unknown>,
  channel: SlackChannel,
  users: Map<string, SlackUser>,
): Video | null {
  const subtype = typeof msg.subtype === 'string' ? msg.subtype : '';
  if (subtype && subtype !== 'thread_broadcast') return null;

  const ts = typeof msg.ts === 'string' ? msg.ts : '';
  const text = typeof msg.text === 'string' ? msg.text.trim() : '';
  if (!ts || !text) return null;

  const userId = typeof msg.user === 'string' ? msg.user : '';
  const author =
    typeof msg.username === 'string' && msg.username.trim()
      ? msg.username.trim()
      : userDisplayName(users.get(userId));
  const label = channelLabel(channel, users);
  const avatar = userAvatarUrl(users.get(userId));
  const replyCount = typeof msg.reply_count === 'number' ? msg.reply_count : 0;
  const threadTs = typeof msg.thread_ts === 'string' ? msg.thread_ts : null;
  const isThreadRoot = replyCount > 0 || (threadTs !== null && threadTs === ts);

  const tags = [
    'slack',
    channel.is_im || channel.is_mpim ? 'dm' : 'channel',
    `author:${author}`,
    `slackch:${label}`,
    `slackcid:${channel.id}`,
    `slackts:${ts}`,
  ];
  if (isThreadRoot) tags.push('thread');

  return {
    id: messageId(ts),
    title: text.split('\n')[0]?.slice(0, 160) || 'Message',
    channel: { name: label, avatar, verified: false, subscriberCount: 0 },
    thumbnail: avatar,
    duration: formatSlackTs(ts),
    views: replyCount,
    postedAgo: '',
    tags,
    description: text.slice(0, 2000),
    category: 'utility',
  };
}

async function slackSession(): Promise<
  | { kind: 'ok'; token: string; cookieHeader: string }
  | { kind: 'unavailable'; reason: string }
> {
  const token = await resolveSlackToken();
  if (!token) {
    return {
      kind: 'unavailable',
      reason:
        'Slack session missing — log in at app.slack.com in Chrome (Profile 1), then add SLACK_XOXC to .env or re-run pnpm slack:setup',
    };
  }

  const needsCookie = token.startsWith('xoxc-');
  const cookieResult = await readSlackCookies();
  if (cookieResult.kind !== 'ok') {
    if (needsCookie) return { kind: 'unavailable', reason: cookieResult.reason };
    return { kind: 'ok', token, cookieHeader: '' };
  }

  const cookies = cookieResult.cookies;
  const cookieHeader = composeCookieHeader(cookies, 'slack.com');
  if (needsCookie) {
    const d = cookieValue(cookies, 'd');
    if (!d) {
      return { kind: 'unavailable', reason: 'slack d cookie missing (log in at app.slack.com in Chrome)' };
    }
  }
  return { kind: 'ok', token, cookieHeader };
}

async function slackApi(
  method: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<{ ok: true; json: unknown } | { ok: false; reason: string }> {
  if (!SLACK_API_METHODS.has(method)) {
    logInterceptFailure('slack', `blocked api method: ${method}`);
    return { ok: false, reason: 'slack api method not allowed' };
  }

  const session = await slackSession();
  if (session.kind !== 'ok') return { ok: false, reason: session.reason };

  const cursor = params.cursor;
  if (cursor !== undefined && cursor !== '' && !isSlackListCursor(String(cursor))) {
    return { ok: false, reason: 'invalid slack cursor' };
  }

  const url = new URL(`https://slack.com/api/${method}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }

  try {
    const res = await fetchWithSession(url.toString(), {
      method: 'GET',
      cookieHeader: session.cookieHeader,
      headers: {
        Authorization: `Bearer ${session.token}`,
        Accept: 'application/json',
      },
    });
    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      logInterceptFailure('slack', `HTTP ${res.status}: non-JSON body`);
      return { ok: false, reason: `slack HTTP ${res.status}` };
    }
    if (!res.ok) {
      logInterceptFailure('slack', `HTTP ${res.status}`);
      return { ok: false, reason: `slack HTTP ${res.status}` };
    }
    const ok = (json as { ok?: boolean }).ok;
    if (!ok) {
      const err = (json as { error?: string }).error ?? 'unknown';
      logInterceptFailure('slack', `api error: ${err}`);
      return { ok: false, reason: `slack api ${err}` };
    }
    return { ok: true, json };
  } catch (err) {
    logInterceptFailure('slack', `fetch failed: ${(err as Error).message}`);
    return { ok: false, reason: 'slack fetch failed' };
  }
}

async function loadUsers(): Promise<Map<string, SlackUser>> {
  const map = new Map<string, SlackUser>();
  let cursor: string | undefined;

  for (let page = 0; page < MAX_LIST_PAGES; page++) {
    const res = await slackApi('users.list', { limit: LIST_PAGE_SIZE, cursor });
    if (!res.ok) break;
    for (const [id, user] of parseUsers(res.json)) map.set(id, user);
    const next = apiNextCursor(res.json);
    if (!next) break;
    cursor = next;
  }

  return map;
}

/** Resolve user profiles missing from users.list (guests, Slack Connect, message authors). */
async function loadMissingUserIds(userIds: string[], users: Map<string, SlackUser>): Promise<void> {
  const toFetch = userIds
    .filter((id) => isSlackUserId(id) && !users.has(id))
    .filter((id, i, arr) => arr.indexOf(id) === i)
    .slice(0, MISSING_USER_CAP);
  if (toFetch.length === 0) return;

  const before = users.size;
  let idx = 0;
  async function worker(): Promise<void> {
    while (idx < toFetch.length) {
      const userId = toFetch[idx++]!;
      const res = await slackApi('users.info', { user: userId });
      if (!res.ok) continue;
      const user = (res.json as { user?: SlackUser }).user;
      if (user && typeof user.id === 'string') users.set(user.id, user);
    }
  }

  const workers = Math.min(USER_INFO_CONCURRENCY, toFetch.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  const resolved = users.size - before;
  if (resolved > 0) console.log(`[slack] resolved ${resolved} missing user profiles`);
}

async function loadMissingUsers(channels: SlackChannel[], users: Map<string, SlackUser>): Promise<void> {
  const missing: string[] = [];
  for (const ch of channels) {
    if (!ch.is_im || typeof ch.user !== 'string') continue;
    const id = ch.user.trim();
    if (id) missing.push(id);
  }
  await loadMissingUserIds(missing, users);
}

async function loadWorkspaceName(): Promise<string> {
  const res = await slackApi('auth.test');
  if (!res.ok) return 'Slack';
  const team = (res.json as { team?: string }).team;
  return typeof team === 'string' && team.trim() ? team.trim() : 'Slack';
}

async function loadChannels(): Promise<SlackChannel[]> {
  const out: SlackChannel[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_LIST_PAGES; page++) {
    const res = await slackApi('conversations.list', {
      types: 'public_channel,private_channel,mpim,im',
      exclude_archived: true,
      limit: LIST_PAGE_SIZE,
      cursor,
    });
    if (!res.ok) break;
    out.push(...parseChannels(res.json));
    const next = apiNextCursor(res.json);
    if (!next) break;
    cursor = next;
  }

  return out;
}

function pickDefaultChannel(
  channels: SlackChannel[],
  users: Map<string, SlackUser>,
): { channel: SlackChannel; label: string } | null {
  const envId = process.env.SLACK_DEFAULT_CHANNEL_ID?.trim();
  const envName = process.env.SLACK_DEFAULT_CHANNEL?.trim()?.replace(/^#\s*/, '').toLowerCase();

  if (envId && isSlackChannelId(envId)) {
    const hit = channels.find((c) => c.id === envId);
    if (hit) return { channel: hit, label: channelLabel(hit, users) };
  }

  const publicChannels = channels.filter((c) => c.is_channel && !c.is_im && !c.is_mpim);
  if (envName) {
    const named = publicChannels.find((c) => c.name?.toLowerCase() === envName);
    if (named) return { channel: named, label: channelLabel(named, users) };
  }

  const general = publicChannels.find((c) => c.name === 'general');
  if (general) return { channel: general, label: channelLabel(general, users) };

  const first = publicChannels[0] ?? channels[0];
  if (!first) return null;
  return { channel: first, label: channelLabel(first, users) };
}

function buildBootstrapMeta(
  workspaceName: string,
  channels: SlackChannel[],
  users: Map<string, SlackUser>,
  defaultChannel: SlackChannel,
  defaultLabel: string,
): SlackBootstrapMeta {
  const sidebarChannels: SlackSidebarItem[] = [];
  const dms: SlackSidebarItem[] = [];
  const channelTopics: Record<string, string> = {};

  for (const ch of channels) {
    const label = channelLabel(ch, users);
    const topicText = ch.topic?.value?.trim() || ch.purpose?.value?.trim() || '';
    if (topicText) channelTopics[label] = topicText;
    const item = {
      id: ch.id,
      label,
      unread: typeof ch.unread_count_display === 'number' ? ch.unread_count_display : 0,
    };
    if (ch.is_im || ch.is_mpim) dms.push(item);
    else sidebarChannels.push(item);
  }

  sidebarChannels.sort((a, b) => a.label.localeCompare(b.label));
  dms.sort((a, b) => a.label.localeCompare(b.label));

  return {
    workspaceName,
    channels: sidebarChannels,
    dms,
    defaultChannelId: defaultChannel.id,
    defaultChannelLabel: defaultLabel,
    channelTopics,
  };
}

export async function getSlackBootstrap(): Promise<
  | { kind: 'ok'; meta: SlackBootstrapMeta }
  | { kind: 'unavailable'; reason: string }
> {
  const blocked = guardSlackRuntime();
  if (blocked) return blocked;

  const cached = await ensureWorkspaceCache();
  if (cached.kind !== 'ok') return cached;

  const picked = pickDefaultChannel(cached.channels, cached.users);
  if (!picked) {
    return { kind: 'unavailable', reason: 'slack returned no channels' };
  }

  return {
    kind: 'ok',
    meta: buildBootstrapMeta(
      cached.workspaceName,
      cached.channels,
      cached.users,
      picked.channel,
      picked.label,
    ),
  };
}

export type SlackRepliesResult =
  | { kind: 'ok'; replies: Array<{ author: string; time: string; text: string; avatar?: string }> }
  | { kind: 'unavailable'; reason: string };

export async function getSlackThreadReplies(
  channelId: string,
  threadTs: string,
): Promise<SlackRepliesResult> {
  const blocked = guardSlackRuntime();
  if (blocked) return blocked;

  const id = channelId.trim();
  const ts = threadTs.trim();
  if (!isSlackChannelId(id)) {
    return { kind: 'unavailable', reason: 'invalid slack channel id' };
  }
  if (!isSlackThreadTs(ts)) {
    return { kind: 'unavailable', reason: 'invalid slack thread timestamp' };
  }

  const cached = await ensureWorkspaceCache();
  if (cached.kind !== 'ok') return cached;

  const res = await slackApi('conversations.replies', {
    channel: id,
    ts,
    limit: HISTORY_PAGE_SIZE,
  });
  if (!res.ok) return { kind: 'unavailable', reason: res.reason };

  const { messages } = parseMessages(res.json);
  const replies: Array<{ author: string; time: string; text: string; avatar?: string }> = [];

  for (const msg of messages) {
    const msgTs = typeof msg.ts === 'string' ? msg.ts : '';
    if (msgTs === ts) continue;

    const subtype = typeof msg.subtype === 'string' ? msg.subtype : '';
    if (subtype && subtype !== 'thread_broadcast') continue;

    const text = typeof msg.text === 'string' ? msg.text.trim() : '';
    if (!text) continue;

    const userId = typeof msg.user === 'string' ? msg.user : '';
    const author =
      typeof msg.username === 'string' && msg.username.trim()
        ? msg.username.trim()
        : userDisplayName(cached.users.get(userId));
    const avatar = userAvatarUrl(cached.users.get(userId));

    replies.push({
      author,
      time: msgTs ? formatSlackTs(msgTs) : '',
      text,
      avatar: avatar || undefined,
    });
    if (replies.length >= 40) break;
  }

  console.log(`[slack] thread: ${replies.length} replies`);
  return { kind: 'ok', replies };
}

export async function getSlackChannelHistory(
  channelId: string,
  cursor?: string,
): Promise<SlackFeedResult> {
  const blocked = guardSlackRuntime();
  if (blocked) return blocked;

  const id = channelId.trim();
  if (!isSlackChannelId(id)) {
    return { kind: 'unavailable', reason: 'invalid slack channel id' };
  }

  const pageCursor = cursor?.trim();
  if (pageCursor && !isSlackListCursor(pageCursor)) {
    return { kind: 'unavailable', reason: 'invalid slack cursor' };
  }

  const cached = await ensureWorkspaceCache();
  if (cached.kind !== 'ok') return cached;

  const channel = cached.channels.find((c) => c.id === id);
  if (!channel) {
    return { kind: 'unavailable', reason: 'slack channel not found' };
  }

  const res = await slackApi('conversations.history', {
    channel: id,
    limit: HISTORY_PAGE_SIZE,
    cursor: pageCursor || undefined,
  });
  if (!res.ok) return { kind: 'unavailable', reason: res.reason };

  const { messages, nextCursor } = parseMessages(res.json);

  const authorIds: string[] = [];
  for (const msg of messages) {
    if (typeof msg.user === 'string') authorIds.push(msg.user);
  }
  await loadMissingUserIds(authorIds, cached.users);

  const videos: Video[] = [];
  for (const msg of messages) {
    const video = messageToVideo(msg, channel, cached.users);
    if (video) videos.push(video);
  }
  videos.reverse();

  if (videos.length === 0 && !cursor) {
    return { kind: 'unavailable', reason: 'slack channel history empty' };
  }

  const continuation = nextCursor
    ? Buffer.from(JSON.stringify({ channel: id, cursor: nextCursor }), 'utf8').toString('base64url')
    : null;

  console.log(`[slack] history: ${videos.length} messages${pageCursor ? ' (page)' : ''}`);
  return { kind: 'ok', videos, continuation };
}

export async function getSlackWorkspaceFeed(): Promise<SlackFeedResult> {
  const boot = await getSlackBootstrap();
  if (boot.kind !== 'ok') return boot;

  const history = await getSlackChannelHistory(boot.meta.defaultChannelId);
  if (history.kind !== 'ok') return history;

  return {
    kind: 'ok',
    videos: history.videos,
    continuation: history.continuation,
    meta: boot.meta,
  };
}

export async function getSlackSearchFeed(query: string): Promise<SlackFeedResult> {
  const blocked = guardSlackRuntime();
  if (blocked) return blocked;

  const q = query.trim();
  if (!q) return getSlackWorkspaceFeed();
  if (q.length > INTERCEPT_QUERY_MAX_LEN) {
    return { kind: 'unavailable', reason: 'invalid query' };
  }

  const res = await slackApi('search.messages', {
    query: q,
    count: 100,
    sort: 'timestamp',
    sort_dir: 'desc',
  });
  if (!res.ok) {
    return { kind: 'unavailable', reason: res.reason };
  }

  const cached = await ensureWorkspaceCache();
  const users = cached.kind === 'ok' ? cached.users : await loadUsers();
  const matches = (res.json as { messages?: { matches?: Record<string, unknown>[] } }).messages?.matches;
  if (!Array.isArray(matches) || matches.length === 0) {
    return { kind: 'unavailable', reason: 'slack search returned no matches' };
  }

  const videos: Video[] = [];
  for (const match of matches) {
    const chObj = match.channel;
    const channelId =
      typeof chObj === 'object' && chObj !== null && typeof (chObj as { id?: string }).id === 'string'
        ? (chObj as { id: string }).id
        : typeof chObj === 'string'
          ? chObj
          : '';
    const channelName =
      typeof chObj === 'object' && chObj !== null && typeof (chObj as { name?: string }).name === 'string'
        ? (chObj as { name: string }).name
        : undefined;
    const channel: SlackChannel = {
      id: channelId || 'search',
      name: channelName,
      is_channel: true,
    };
    const video = messageToVideo(match, channel, users);
    if (video) videos.push(video);
    if (videos.length >= SEARCH_RESULT_CAP) break;
  }

  console.log(`[slack] search: ${videos.length} messages`);
  return { kind: 'ok', videos, continuation: null };
}

export async function getSlackHistoryMore(token: string): Promise<SlackFeedResult> {
  const blocked = guardSlackRuntime();
  if (blocked) return blocked;

  if (!token.trim() || token.length > 4096) {
    return { kind: 'unavailable', reason: 'invalid slack continuation token' };
  }

  const parsed = parseSlackHistoryContinuation(token);
  if (!parsed) {
    return { kind: 'unavailable', reason: 'invalid slack continuation token' };
  }
  return getSlackChannelHistory(parsed.channel, parsed.cursor);
}
