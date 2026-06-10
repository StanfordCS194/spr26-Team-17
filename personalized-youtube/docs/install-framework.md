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

For Amazon, Instagram, and Slack mapping guides, see [`install-archetypes.md`](./install-archetypes.md).

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

## Site Archetypes

The `archetype` option selects a built-in selector preset for a known site category. This lets a customer site omit most of the `selectors` object — only pass overrides for values that differ from the preset defaults.

Currently supported archetypes: `youtube` (default), `amazon`, `instagram`, `slack`.

### Amazon Storefront Demo

A live Amazon-like product grid demo is available at:

- **Static file:** `/install-demo/amazon.html`
- **Next.js route:** `/install-demo/amazon`

The page looks like an Amazon search-results storefront — sticky header with search, left-nav department filters, category chips, and a 4-column product grid with 14 realistic product cards including star ratings, prices, badges, and delivery info.

#### Markup contract for Amazon-like sites

Add these attributes to your product cards. The `archetype: "amazon"` preset configures all item-level selectors automatically.

```html
<body data-showcase-root>
  <header data-showcase-section="topbar">...</header>
  <aside data-showcase-section="sidebar">...</aside>

  <nav data-showcase-section="chips">
    <button data-showcase-chip>Electronics</button>
    <button data-showcase-chip>Kitchen</button>
  </nav>

  <section data-showcase-section="product-grid">
    <article data-showcase-item-card data-showcase-tags="electronics headphones wireless">
      <img data-showcase-item-image src="..." alt="..." />
      <h3 data-showcase-item-title>Sony WH-1000XM5 Headphones</h3>
      <p  data-showcase-item-subtitle>by Sony</p>
      <p  data-showcase-item-price>$279.99</p>
      <p  data-showcase-item-meta>FREE delivery Mon, Jun 2</p>
    </article>
  </section>
</body>
```

#### Initializing with the amazon archetype (recommended)

```html
<script src="https://your-showcase-host.com/showcase-install.iife.js"></script>
<script>
  ShowcasePersonalize.init({
    siteId: "amazon-demo",
    apiBaseUrl: "https://your-showcase-host.com",
    archetype: "amazon",
    selectors: {
      // Only override what differs from the preset defaults.
      // Example: if your product grid uses "product-grid" instead of "video-grid":
      videoGrid: "[data-showcase-section='product-grid']",
    },
  });
</script>
```

#### What `archetype: "amazon"` configures automatically

| Selector key | Default value set by archetype |
|---|---|
| `itemCard` | `[data-showcase-item-card]` |
| `itemTitle` | `[data-showcase-item-title]` |
| `itemSubtitle` | `[data-showcase-item-subtitle]` (maps to `channel.name` internally) |
| `itemImage` | `[data-showcase-item-image]` |
| `itemPrice` | `[data-showcase-item-price]` (included in item description) |
| `itemMeta` | `[data-showcase-item-meta]` (included in item description) |

Section-level selectors (`topbar`, `sidebar`, `chips`, `videoGrid`) still use the shared YouTube-like defaults and can be overridden individually.

#### Explicit selectors approach (alternative, no archetype needed)

```js
ShowcasePersonalize.init({
  siteId: "amazon-demo",
  apiBaseUrl: "https://your-showcase-host.com",
  selectors: {
    root:        "[data-showcase-root]",
    topbar:      "[data-showcase-section='topbar']",
    sidebar:     "[data-showcase-section='sidebar']",
    chips:       "[data-showcase-section='chips']",
    videoGrid:   "[data-showcase-section='product-grid']",
    videoCard:   "[data-showcase-item-card]",
    videoTitle:  "[data-showcase-item-title]",
    videoChannel:"[data-showcase-item-subtitle]",
    videoThumbnail: "[data-showcase-item-image]",
  },
});
```

Both approaches produce the same scan result. The `archetype` approach is shorter; the explicit approach is useful when you want full control or when your attribute names diverge significantly from the preset.

### Setup audit (debug)

When `debug: true`, the SDK runs `auditSetup()` on init and logs missing regions or cards. You can also call it manually:

```js
const install = ShowcasePersonalize.init({ siteId: "amazon-demo", archetype: "amazon", debug: true });
console.log(install.auditSetup());
// or: ShowcasePersonalize.__debug.auditSetup()
```

Seed install demo site rows before testing chat persistence:

```bash
pnpm seed:install
```

### All install demos

| Demo | URL | siteId | archetype |
|------|-----|--------|-----------|
| YouTube | `/install-demo` | `static-youtube-demo` | `youtube` |
| Amazon | `/install-demo/amazon` | `amazon-demo` | `amazon` |
| Instagram | `/install-demo/instagram` | `instagram-demo` | `instagram` |
| Slack | `/install-demo/slack` | `slack-demo` | `slack` |

See [`install-archetypes.md`](./install-archetypes.md) for per-site markup contracts.

## Archetype Coverage

The install runtime still maps every site onto the shared `PageConfig` / `Video[]` pipeline internally, but the `archetype` presets and [`install-archetypes.md`](./install-archetypes.md) guide let Amazon-like storefronts, Instagram-like feeds, and Slack-like workspaces adopt the same drop-in script without rebuilding their UI in Showcase.

Unsupported in v1: arbitrary auto-detection, self-hosted backend, adding new rendered section types, or deep business-logic hooks. Sites outside the four archetypes can still integrate by passing explicit `selectors` overrides.
