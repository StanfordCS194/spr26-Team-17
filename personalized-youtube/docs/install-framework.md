# Showcase Install Framework

The install framework lets a YouTube-like static page add Showcase personalization with a browser script. The company keeps its own HTML/CSS; Showcase scans known page regions, mounts a floating chat panel, streams AI-generated patches from the hosted backend, and applies supported changes to the existing DOM.

## Quick Start

Add the browser bundle and initialize it with a site id plus selectors:

```html
<script src="https://your-showcase-host.com/showcase-install.iife.js"></script>
<script>
  ShowcasePersonalize.init({
    siteId: "acme-youtube",
    apiBaseUrl: "https://your-showcase-host.com",
    selectors: {
      root: "[data-showcase-root]",
      topbar: "[data-showcase-section='topbar']",
      sidebar: "[data-showcase-section='sidebar']",
      chips: "[data-showcase-section='chips']",
      videoGrid: "[data-showcase-section='video-grid']",
      videoCard: "[data-showcase-video-card]",
      videoTitle: "[data-showcase-video-title]",
      videoChannel: "[data-showcase-video-channel]",
      videoThumbnail: "[data-showcase-video-thumbnail]"
    }
  });
</script>
```

For local development, see `apps/web/public/install-demo/index.html`.

## Required Markup Contract

V1 is designed for YouTube-like static pages. The page can use any visual styling, but it must expose stable selectors for:

- Root container
- Topbar
- Sidebar
- Category chips
- Main video grid
- Video cards
- Video title
- Video channel
- Video thumbnail

Recommended attributes:

```html
<body data-showcase-root>
  <header data-showcase-section="topbar">...</header>
  <aside data-showcase-section="sidebar">...</aside>
  <nav data-showcase-section="chips">
    <button data-showcase-chip>NBA</button>
  </nav>
  <section data-showcase-section="video-grid">
    <article data-showcase-video-card data-showcase-tags="nba sports">
      <img data-showcase-video-thumbnail src="..." />
      <h3 data-showcase-video-title>NBA spacing explained</h3>
      <span data-showcase-video-channel>Film Room</span>
    </article>
  </section>
</body>
```

## Supported V1 Behavior

The install runtime supports these patch types:

- `update_theme`: light/dark mode, accent color, font scale, simple backgrounds
- `update_section`: hide/show sections and apply simple density/layout markers
- `set_filter`: hide/show visible video cards based on title, channel, and tags
- `remove_section`: hide a known section
- `reorder_sections`: move known section nodes within their parent

Unsupported in v1:

- Full content replacement
- Arbitrary site auto-detection
- Self-hosted backend
- Adding new rendered section types to the host page
- Deep integration with custom business logic

## Hosted Backend

The script calls hosted install endpoints:

- `POST /api/install/session`
- `GET /api/install/page?siteId=...&visitorId=...`
- `POST /api/install/chat`
- `POST /api/install/patch`
- `POST /api/install/reset`

Visitor identity is anonymous and stored in `localStorage` under the site id. Preferences persist server-side until reset.

## Troubleshooting

- **No chat appears**: confirm the script URL loads and `ShowcasePersonalize.init(...)` runs after the page markup exists.
- **No cards detected**: check `videoCard`, `videoTitle`, `videoChannel`, and `videoThumbnail` selectors.
- **Filtering hides too much**: add `data-showcase-tags` to each card with stable topic words.
- **CORS blocked**: add the company origin to `INSTALL_ALLOWED_ORIGINS`.
- **Patches do not persist**: verify `/api/install/session` returns a visitor id and `/api/install/page` returns a `patches` array.
- **Reset does not clear the page**: reset clears server preferences and reloads the page; make sure the static page itself does not hard-code the changed state.

## Why YouTube-Like Only

Showcase currently understands video-site concepts: cards, channels, thumbnails, chips, topbar, sidebar, sections, filters, and themes. Requiring a YouTube-like contract makes the first install version reliable. Arbitrary sites can be supported later with a richer mapping layer or setup wizard.
