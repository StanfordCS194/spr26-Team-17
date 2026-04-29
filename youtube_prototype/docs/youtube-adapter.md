# YouTube Adapter (v0.5, Week 2)

**Status**: Not yet built. Owned by `youtube-adapter` subagent. Activated when `FEED_ADAPTER=youtube`.

This document captures the CDP-based interception mechanics that the Electron sidecar uses to fetch real YouTube data without using the Data API. It will be filled in during Week-2 build.

## Architecture

```
┌────────────────────────────────────┐    HTTP    ┌─────────────────┐
│ apps/desktop (Electron)            │ ◄──────── │ apps/web        │
│                                    │  fetch    │ adapters/       │
│  BrowserWindow                     │           │  youtube.ts     │
│   partition: persist:yt:default    │           └─────────────────┘
│   loaded: youtube.com              │
│                                    │
│  CDP debugger (1.3)                │
│   Network.enable                   │
│   match /youtubei/v1/(browse|next) │
│                                    │
│  Capture:                          │
│   - context (clientName/Version)   │
│   - continuation token             │
│   - X-Goog-* headers               │
│                                    │
│  Compose Cookie from               │
│   session.cookies.get({...})       │
│                                    │
│  Re-issue via fetch()              │
│                                    │
│  youtubei-mapper.ts:               │
│   richItemRenderer    → VideoCard  │
│   reelItemRenderer    → ShortCard  │
│   continuation tokens → pagination │
│                                    │
│  ipc-server.ts                     │
│   GET /getFeed                     │
│   GET /getMore?token=...           │
└────────────────────────────────────┘
```

## Capture mechanics (planned)

1. Open `BrowserWindow` with `webPreferences.partition: 'persist:yt:default'`. User logs in once via the Electron window; session persists.
2. `wc.debugger.attach('1.3')`; `wc.debugger.sendCommand('Network.enable')`.
3. Navigate to `https://www.youtube.com/`. The page fires its own `youtubei/v1/browse` POSTs.
4. Listen for `Network.requestWillBeSent`; predicate: `params.request.url.includes('/youtubei/v1/')`.
5. From the captured request, extract:
   - URL + method (always POST for browse)
   - Body's `context` object (`client.clientName`, `client.clientVersion`, `client.visitorData`)
   - `continuation` token if it's a paginated call
   - `X-Goog-AuthUser`, `X-Goog-Visitor-Id`, `X-YouTube-Client-Name`, `X-YouTube-Client-Version`
   - `Authorization` header if present
6. **Manually compose `Cookie` header** from `session.cookies.get({ domain: '.youtube.com' })` — CDP-captured headers don't include `Cookie` (Chromium adds it lower in the stack).
7. Re-issue via `fetch()` with captured config + composed cookie.

## Mapping: youtubei response → PageConfig

The home feed lives at:
```
contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.richGridRenderer.contents
```

Each item is a `richItemRenderer.content.{videoRenderer,reelItemRenderer,...}`. Map:

```ts
videoRenderer => VideoCard {
  id:         videoRenderer.videoId,
  title:      videoRenderer.title.runs[0].text,
  channel: {
    name:           videoRenderer.ownerText.runs[0].text,
    avatar:         videoRenderer.channelThumbnailSupportedRenderers
                      .channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].url,
    verified:       (videoRenderer.ownerBadges?.length ?? 0) > 0,
    subscriberCount: '?',  // not in response; fetch via separate channel call
  },
  thumbnail:  videoRenderer.thumbnail.thumbnails.at(-1).url,
  duration:   videoRenderer.lengthText.simpleText,         // 'M:SS' or 'H:MM:SS'
  views:      parseViewCount(videoRenderer.viewCountText.simpleText),
  postedAgo:  videoRenderer.publishedTimeText.simpleText,  // '3 days ago'
  tags:       inferTagsFromTitle(videoRenderer.title.runs[0].text),
}

reelItemRenderer => ShortCard { ... }
```

Pagination token:
```
continuationItemRenderer.continuationEndpoint.continuationCommand.token
```

## Brittleness mitigation

- **Re-capture on every Electron boot**. Don't hardcode `clientVersion` — it rotates.
- **Tolerant mapper**: missing fields default to empty string / 0. Never throw on shape drift.
- **Health check**: on boot, fetch one feed. If <5 results map cleanly, surface a "YouTube layout changed; mapper needs update" error to the user.

## Re-capture procedure (when Google rotates the response shape)

1. Open Electron with debug mode on.
2. Inspect `Network.responseReceivedExtraInfo` for the latest browse call.
3. Compare new response shape against `youtubei-mapper.ts` field paths.
4. Update mapper; add a fixture under `apps/desktop/__fixtures__/` with the new response.
5. Re-run `pnpm test --filter desktop`.

## TOS posture

This is the same pattern a browser extension uses to filter your feed in real-time. For showcase / educational use on the user's own machine with their own logged-in account, this is a reasonable posture. For productionization, switch to the YouTube Data API and accept its quotas. Recorded in `docs/decisions.md`.
