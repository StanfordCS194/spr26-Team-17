# Intercept adapters (Amazon + Instagram)

No third-party SDKs. We replay browser requests with Chrome cookies (same pattern as YouTube InnerTube).

## Routes

| URL | Supabase slug | Live source |
|-----|---------------|-------------|
| `/` | `youtube-clone` | `SHOWCASE_FEED_SOURCE=youtube` |
| `/amazon` | `amazon-storefront` | Always `amazon` unless `FEED_ADAPTER=mock` |
| `/instagram` | `instagram-feed` | Always `instagram` unless `FEED_ADAPTER=mock` |
| `/slack` | `slack-workspace` | Always `slack` unless `FEED_ADAPTER=mock` |

## Setup

1. Log in on **amazon.com**, **instagram.com**, and **app.slack.com** in Chrome (same profile as `CHROME_COOKIE_PATH`).
2. `pnpm seed:sites` — upsert base configs for the new slugs.
3. Set `SLACK_XOXC` in `.env` (see [`slack.md`](./slack.md)), or run `pnpm launch:slack` to auto-detect from Chrome.
4. `pnpm check:feeds` — smoke-test cookie + fetch + parse.
5. `pnpm launch:slack` → opens `/slack` in **your** Chrome profile (recommended for teammates).

## What we intercept

### Amazon

- **Capture:** DevTools → Network → search on amazon.com → document `GET /s?k=…`
- **Code:** `lib/amazon/client.ts` replays that URL, parses `data-asin` tiles from HTML.
- **Env:** `AMAZON_SEARCH_QUERY` (default `best sellers`).

### Instagram

- **Capture:** DevTools → `feed/timeline` XHR on instagram.com
- **Code:** `lib/instagram/client.ts` → `GET /api/v1/feed/timeline/` with `sessionid`, `csrftoken`, `X-IG-App-ID`.
- **Requires:** `sessionid` + `csrftoken` cookies.

### Slack

- **Capture:** DevTools → Network → any `slack.com/api/…` request → copy `Authorization: Bearer xoxc-…` and `d` cookie.
- **Code:** `lib/slack/client.ts` → `conversations.list`, `conversations.history`, `search.messages`.
- **Requires:** `SLACK_XOXC` in `.env` + Chrome `d` cookie from app.slack.com.

## Chat site switcher

The personalize panel has **YouTube | Amazon | Instagram | Slack** pills, or ask in chat (e.g. “open Amazon”) — Claude can call `switch_site`.

## Fallback

If cookies or parsing fail, Amazon and Instagram adapters fall back to `lib/mock-data/amazon-products.json` and `instagram-feed.json`.

**Slack does not fall back to mock data.** When intercept auth is missing or fails, the UI shows an empty feed and a setup banner — run `pnpm slack:setup` locally with your Chrome profile and `SLACK_XOXC`.

## Security (matches InnerTube)

All intercept adapters share `lib/innertube/chrome-cookies.ts`:

- **Read-only** snapshot of Chrome’s cookie DB; never write back.
- **Never log cookie values** — count-only lines (`loaded N cookies for amazon.com`).
- **Cookies are the server operator’s**, not the website visitor’s. Visitors cannot inject their own Amazon/IG session.
- **No upstream bodies in API errors** — `/api/amazon/*`, `/api/instagram/*`, and `/api/slack/*` sanitize reasons via `lib/intercept/security.ts`.
- **Input bounds** — search queries ≤256 chars, continuation tokens ≤4096 chars (same as `/api/yt/more`).

TOS posture: same as YouTube intercept — educational showcase on the operator’s machine with their own logged-in Chrome profile; not a production multi-tenant service.

Full audit and deploy checklist: [`security.md`](./security.md).

For the drop-in install path (no source code access), see [`install-framework.md`](./install-framework.md) and [`install-archetypes.md`](./install-archetypes.md).

## Updating when sites change

1. Re-capture request in DevTools (URL, headers, body).
2. Update the client file; keep the mapper defensive (never throw on unknown JSON).
