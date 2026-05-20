// Instagram — intercept-style client (no instagram-private-api package).
//
// Replays the web app's timeline XHR:
//   GET https://www.instagram.com/api/v1/feed/timeline/…
// Auth: Chrome cookies (sessionid, csrftoken, ds_user_id). Capture reference in
// DevTools while logged in on instagram.com → filter "timeline".

import type { Video } from '@showcase/shared';
import {
  composeCookieHeader,
  readInstagramCookies,
} from '../innertube/chrome-cookies';
import { cookieValue, fetchWithSession } from '../intercept/browser-fetch';

export type InstagramFeedResult =
  | { kind: 'ok'; videos: Video[] }
  | { kind: 'unavailable'; reason: string };

// Web app id observed on instagram.com (stable for years; update if capture differs).
const IG_APP_ID = '936619743392459';

const TIMELINE_URL =
  'https://www.instagram.com/api/v1/feed/timeline/?feed_view_info=&is_pull_to_refresh=0&is_prefetch=0&pagination_timeline=true';

function relativeAgo(unixSec: number): string {
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - unixSec);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function pickThumbnail(media: Record<string, unknown>): string {
  const iv2 = media.image_versions2 as { candidates?: { url?: string }[] } | undefined;
  if (iv2?.candidates?.[0]?.url) return iv2.candidates[0].url;
  const carousel = media.carousel_media as { image_versions2?: { candidates?: { url?: string }[] } }[] | undefined;
  if (carousel?.[0]?.image_versions2?.candidates?.[0]?.url) {
    return carousel[0].image_versions2.candidates[0].url;
  }
  return '';
}

function mediaToVideo(media: Record<string, unknown>): Video | null {
  const pk = String(media.pk ?? media.id ?? '');
  const code = String(media.code ?? pk);
  if (!pk && !code) return null;

  const captionObj = media.caption as { text?: string } | null | undefined;
  const caption = typeof captionObj?.text === 'string' ? captionObj.text : '';
  const title =
    caption.split('\n')[0]?.trim().slice(0, 120) ||
    (media.media_type === 2 ? 'Video post' : 'Photo post');

  const user = media.user as { username?: string; profile_pic_url?: string; is_verified?: boolean } | undefined;
  const username = user?.username ?? 'instagram';

  const likeCount = typeof media.like_count === 'number' ? media.like_count : 0;
  const takenAt = typeof media.taken_at === 'number' ? media.taken_at : 0;
  const isVideo = media.media_type === 2;
  const duration =
    isVideo && typeof media.video_duration === 'number'
      ? `${Math.round(media.video_duration)}s`
      : 'Post';

  return {
    id: code || pk,
    title,
    channel: {
      name: username,
      avatar: user?.profile_pic_url ?? 'https://www.instagram.com/favicon.ico',
      verified: user?.is_verified === true,
      subscriberCount: 0,
    },
    thumbnail: pickThumbnail(media),
    duration,
    views: likeCount,
    postedAgo: takenAt > 0 ? relativeAgo(takenAt) : '',
    tags: ['instagram', isVideo ? 'video' : 'photo'],
    description: caption.slice(0, 500),
    category: 'social',
  };
}

export function parseInstagramTimelineJson(body: unknown): Video[] {
  const out: Video[] = [];
  if (typeof body !== 'object' || body === null) return out;
  const feedItems = (body as { feed_items?: unknown[] }).feed_items;
  if (!Array.isArray(feedItems)) return out;

  for (const item of feedItems) {
    if (typeof item !== 'object' || item === null) continue;
    const row = item as Record<string, unknown>;
    const media = (row.media_or_ad ?? row.explore_story ?? row.ad) as Record<string, unknown> | undefined;
    if (!media || typeof media !== 'object') continue;
    const video = mediaToVideo(media);
    if (video) out.push(video);
    if (out.length >= 48) break;
  }
  return out;
}

export async function getInstagramTimelineFeed(): Promise<InstagramFeedResult> {
  const cookieResult = await readInstagramCookies();
  if (cookieResult.kind !== 'ok') {
    return { kind: 'unavailable', reason: cookieResult.reason };
  }

  const cookies = cookieResult.cookies;
  const cookieHeader = composeCookieHeader(cookies, 'instagram.com');
  const csrf = cookieValue(cookies, 'csrftoken');
  const sessionId = cookieValue(cookies, 'sessionid');

  if (!cookieHeader || !sessionId) {
    return {
      kind: 'unavailable',
      reason: 'instagram sessionid missing (log in at instagram.com in Chrome)',
    };
  }
  if (!csrf) {
    return {
      kind: 'unavailable',
      reason: 'instagram csrftoken missing',
    };
  }

  let res: Response;
  try {
    res = await fetchWithSession(TIMELINE_URL, {
      method: 'GET',
      cookieHeader,
      headers: {
        Accept: '*/*',
        Referer: 'https://www.instagram.com/',
        'X-IG-App-ID': IG_APP_ID,
        'X-CSRFToken': csrf,
        'X-Requested-With': 'XMLHttpRequest',
        'X-ASBD-ID': '359341',
        'X-IG-WWW-Claim': '0',
      },
    });
  } catch (err) {
    return { kind: 'unavailable', reason: `instagram fetch failed: ${(err as Error).message}` };
  }

  if (!res.ok) {
    const snippet = (await res.text()).slice(0, 200);
    return {
      kind: 'unavailable',
      reason: `instagram HTTP ${res.status}: ${snippet}`,
    };
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return { kind: 'unavailable', reason: 'instagram response not JSON' };
  }

  const videos = parseInstagramTimelineJson(json);
  if (videos.length === 0) {
    const status = (json as { status?: string }).status;
    const message = (json as { message?: string }).message;
    return {
      kind: 'unavailable',
      reason: `instagram timeline empty (status=${status ?? '?'} ${message ?? ''})`.trim(),
    };
  }

  console.log(`[instagram] timeline: ${videos.length} posts`);
  return { kind: 'ok', videos };
}
