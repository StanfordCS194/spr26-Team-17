# Intercept adapters (Amazon + Instagram)

No third-party SDKs. We replay browser requests with Chrome cookies (same pattern as YouTube InnerTube).

## Routes

| URL | Supabase slug | Live source |
|-----|---------------|-------------|
| `/` | `youtube-clone` | `SHOWCASE_FEED_SOURCE=youtube` |
| `/amazon` | `amazon-storefront` | Always `amazon` unless `FEED_ADAPTER=mock` |
| `/instagram` | `instagram-feed` | Always `instagram` unless `FEED_ADAPTER=mock` |

## Setup

1. Log in on **amazon.com** and **instagram.com** in Chrome (same profile as `CHROME_COOKIE_PATH`).
2. `pnpm seed:sites` — upsert base configs for the two new slugs.
3. `pnpm check:feeds` — smoke-test cookie + fetch + parse.
4. `pnpm --filter @showcase/web dev` → open `/amazon` and `/instagram`.

## What we intercept

### Amazon

- **Capture:** DevTools → Network → search on amazon.com → document `GET /s?k=…`
- **Code:** `lib/amazon/client.ts` replays that URL, parses `data-asin` tiles from HTML.
- **Env:** `AMAZON_SEARCH_QUERY` (default `best sellers`).

### Instagram

- **Capture:** DevTools → `feed/timeline` XHR on instagram.com
- **Code:** `lib/instagram/client.ts` → `GET /api/v1/feed/timeline/` with `sessionid`, `csrftoken`, `X-IG-App-ID`.
- **Requires:** `sessionid` + `csrftoken` cookies.

## Fallback

If cookies or parsing fail, adapters fall back to `lib/mock-data/amazon-products.json` / `instagram-feed.json`.

## Updating when sites change

1. Re-capture request in DevTools (URL, headers, body).
2. Update the client file; keep the mapper defensive (never throw on unknown JSON).
