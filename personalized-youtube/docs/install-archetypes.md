# Showcase Install Archetypes

This document maps the four prototype site patterns—YouTube, Amazon, Instagram, and Slack—onto the Showcase install framework contract defined in [`install-framework.md`](./install-framework.md). Use it as a migration guide when adapting the install script to a real company site.

---

## 1. Install Model vs Full Intercept Prototypes

### Full intercept prototype (this repo)

The prototype sites in `apps/web` (`/`, `/amazon`, `/instagram`, `/slack`) run entirely inside the Showcase Next.js app. They intercept real data from browser sessions (Amazon search HTML, Instagram timeline XHR, Slack API), convert it into a unified `Video[]` model, and render it through Showcase's own React component tree. The server holds the session cookies, applies AI patches server-side, and streams the final `PageConfig` to the browser.

This model gives the team full control over the DOM, component hierarchy, and data flow—ideal for building and demoing Showcase capabilities, but not how a real company integrates.

### Install framework (lightweight embed)

The install framework (`packages/install/`) is the zero-infrastructure path for existing sites. A company adds one `<script>` tag and a small `init()` call. The script:

1. **Scans** the company's existing DOM for stable selectors (`packages/install/src/scanner.ts`).
2. **Snapshots** the page into a `PageConfig` using the shared schema.
3. **Mounts** a floating chat panel (`ShowcaseChatLayer`).
4. **Streams patches** from the hosted Showcase backend (`/api/install/*`).
5. **Applies patches** directly to the existing DOM—no re-render, no React takeover.

The company keeps its own HTML, CSS, and server. Showcase only reads and lightly mutates the DOM it can find through the selector contract.

### Key differences

| Dimension | Full prototype | Install framework |
|-----------|---------------|-------------------|
| Rendering | Showcase owns the component tree | Company owns the HTML/CSS |
| Data | Server intercepts real feeds | Company's own data, already on page |
| DOM contract | Implicit (Showcase-rendered) | Explicit `data-showcase-*` attributes |
| Persistence | Server-side `PageConfig` | Server patches + `localStorage` visitor id |
| Patch surface | Any `PageConfig` mutation | Theme, filter, hide section, reorder |

---

## 2. Cross-Archetype Shared Concepts

Every archetype maps its layout onto the same five conceptual regions. These are the regions the scanner looks for in `scanHostPage()`.

| Region | Purpose | Default selector |
|--------|---------|-----------------|
| **root** | Outermost container; scanner entry point | `[data-showcase-root]` |
| **topbar** | Site-wide navigation header | `[data-showcase-section='topbar']` |
| **sidebar** | Persistent left panel (nav, filters, channels) | `[data-showcase-section='sidebar']` |
| **main feed** | Primary content area (grid, list, timeline) | `[data-showcase-section='video-grid']` |
| **item cards** | Individual content atoms within the main feed | `[data-showcase-video-card]` |

Within each card, the scanner reads three text fields:

| Field | Default selector | Purpose |
|-------|-----------------|---------|
| **title** | `[data-showcase-video-title]` | Primary content label; drives `set_filter` |
| **channel** | `[data-showcase-video-channel]` | Author / source label; drives `set_filter` |
| **thumbnail** | `[data-showcase-video-thumbnail]` | `src` attribute; passed to `PageConfig` |

Tags are derived automatically from title + channel words, or can be pinned with `data-showcase-tags="tag1 tag2"` for reliable filtering.

---

## 3. Archetypes

### 3.1 Feed-of-Cards — YouTube

**Pattern:** Horizontal topbar, collapsible left sidebar, horizontal category chip strip, responsive video card grid.

#### Required DOM regions

| Region | Element | Notes |
|--------|---------|-------|
| Root | `<body>` or outermost wrapper | Must contain all other regions |
| Topbar | `<header>` | Logo, search field, profile avatar |
| Sidebar | `<aside>` | Home, Shorts, Subscriptions links |
| Chips | `<nav>` (inside or below topbar) | Horizontally scrollable category pills |
| Video grid | `<section>` or `<main>` | The core content area |
| Video card | `<article>` repeated inside grid | One card per video |

#### Recommended `data-showcase-*` attributes

```html
<body data-showcase-root>
  <header data-showcase-section="topbar">
    <a href="/" data-showcase-logo>MyTube</a>
    <form data-showcase-search>
      <input type="search" placeholder="Search" />
    </form>
  </header>

  <div class="layout-row">
    <aside data-showcase-section="sidebar">
      <a href="/">Home</a>
      <a href="/shorts">Shorts</a>
      <a href="/subscriptions">Subscriptions</a>
    </aside>

    <div class="content-column">
      <nav data-showcase-section="chips">
        <button data-showcase-chip>All</button>
        <button data-showcase-chip>Gaming</button>
        <button data-showcase-chip>Music</button>
      </nav>

      <section data-showcase-section="video-grid">
        <article
          data-showcase-video-card
          data-showcase-video-id="abc123"
          data-showcase-tags="gaming fps shooter"
          data-showcase-views="1200000"
          data-showcase-duration="14:32"
          data-showcase-posted-ago="3 days ago"
          data-showcase-category="gaming"
        >
          <a href="/watch?v=abc123">
            <img data-showcase-video-thumbnail src="/thumb/abc123.jpg" alt="" />
            <h3 data-showcase-video-title>How to master FPS aiming</h3>
            <span data-showcase-video-channel>ProGamer Academy</span>
          </a>
        </article>
      </section>
    </div>
  </div>
</body>
```

#### Selector mapping table

| `ShowcaseSelectors` key | Recommended attribute | Notes |
|-------------------------|-----------------------|-------|
| `root` | `[data-showcase-root]` | Body or wrapper |
| `topbar` | `[data-showcase-section='topbar']` | `<header>` |
| `sidebar` | `[data-showcase-section='sidebar']` | `<aside>` |
| `chips` | `[data-showcase-section='chips']` | `<nav>` chip row |
| `chip` | `[data-showcase-chip]` | Individual `<button>` |
| `videoGrid` | `[data-showcase-section='video-grid']` | Grid `<section>` |
| `videoCard` | `[data-showcase-video-card]` | Each `<article>` |
| `videoTitle` | `[data-showcase-video-title]` | `<h3>` inside card |
| `videoChannel` | `[data-showcase-video-channel]` | Channel `<span>` |
| `videoThumbnail` | `[data-showcase-video-thumbnail]` | `<img>` with `src` |

#### Supported patch operations

| Patch op | Behavior |
|----------|---------|
| `update_theme` | Light/dark mode, accent color, font scale |
| `set_filter` | Show/hide cards by title, channel, or tags |
| `update_section` | Hide/show chips, sidebar, topbar; adjust grid density |
| `remove_section` | Hide sidebar or chips entirely |
| `reorder_sections` | Move chips above/below topbar, etc. |

#### Init snippet

```js
ShowcasePersonalize.init({
  siteId: "acme-youtube",
  apiBaseUrl: "https://showcase.example.com",
  selectors: {
    root: "[data-showcase-root]",
    topbar: "[data-showcase-section='topbar']",
    sidebar: "[data-showcase-section='sidebar']",
    chips: "[data-showcase-section='chips']",
    chip: "[data-showcase-chip]",
    videoGrid: "[data-showcase-section='video-grid']",
    videoCard: "[data-showcase-video-card]",
    videoTitle: "[data-showcase-video-title]",
    videoChannel: "[data-showcase-video-channel]",
    videoThumbnail: "[data-showcase-video-thumbnail]"
  }
});
```

---

### 3.2 Product-Grid — Amazon

**Pattern:** Horizontal topbar with search, no permanent sidebar (or a left filter panel), main area is a responsive product tile grid. Cards carry price, star rating, review count, and Prime badge.

The Showcase prototype (`/amazon`) scrapes `data-asin` tiles from Amazon HTML. In the install model the company surfaces its own catalog cards; Showcase reads their labels and filters them.

#### Required DOM regions

| Region | Element | Notes |
|--------|---------|-------|
| Root | `<body>` or `<div id="app">` | |
| Topbar | `<header>` | Logo, global search, cart icon |
| Sidebar | `<aside>` or `<div class="filters">` | Department/filter panel; optional |
| Product grid | `<section>` or `<ul>` | Main results area |
| Product card | `<article>` or `<li>` | One product tile |

There is no chip strip in the canonical Amazon layout; instead departments live in the sidebar. If a chip-style department bar exists above the grid, expose it as a `chips` section.

#### Recommended `data-showcase-*` attributes

```html
<body data-showcase-root>
  <header data-showcase-section="topbar">
    <a href="/" data-showcase-logo>Acme Store</a>
    <form data-showcase-search>
      <input type="search" placeholder="Search products" />
    </form>
    <a href="/cart">Cart (3)</a>
  </header>

  <div class="page-layout">
    <aside data-showcase-section="sidebar">
      <h2>Department</h2>
      <ul>
        <li><a href="?dept=electronics">Electronics</a></li>
        <li><a href="?dept=books">Books</a></li>
      </ul>
      <h2>Avg. Customer Review</h2>
      <!-- star filter controls -->
    </aside>

    <section data-showcase-section="video-grid">
      <article
        data-showcase-video-card
        data-showcase-video-id="B09XYZ1234"
        data-showcase-tags="electronics headphones wireless noise-cancelling"
        data-showcase-views="4521"
        data-showcase-duration="$49.99"
        data-showcase-posted-ago="4.3"
        data-showcase-category="electronics"
      >
        <a href="/dp/B09XYZ1234">
          <img data-showcase-video-thumbnail src="/images/B09XYZ1234.jpg" alt="" />
          <h3 data-showcase-video-title>Wireless Noise-Cancelling Headphones</h3>
          <span data-showcase-video-channel>SoundBrand</span>
          <!-- price, stars, review count rendered by company CSS -->
        </a>
      </article>
    </section>
  </div>
</body>
```

> **Attribute conventions for Amazon cards**
> - `data-showcase-duration` — repurposed to carry price string (e.g. `"$49.99"`), matching how the prototype stores price in the shared `Video.duration` field.
> - `data-showcase-posted-ago` — repurposed to carry average star rating as a decimal string (e.g. `"4.3"`), matching the prototype's `Video.postedAgo` field.
> - `data-showcase-views` — review count (integer string).
> - `data-showcase-tags` — space-separated keywords: department, brand, attributes.

#### Selector mapping table

| `ShowcaseSelectors` key | Recommended attribute | Notes |
|-------------------------|-----------------------|-------|
| `root` | `[data-showcase-root]` | |
| `topbar` | `[data-showcase-section='topbar']` | `<header>` |
| `sidebar` | `[data-showcase-section='sidebar']` | Filter panel; may be absent |
| `chips` | `[data-showcase-section='chips']` | Department chip bar (if present) |
| `chip` | `[data-showcase-chip]` | Department pill |
| `videoGrid` | `[data-showcase-section='video-grid']` | Product results grid |
| `videoCard` | `[data-showcase-video-card]` | Each product tile |
| `videoTitle` | `[data-showcase-video-title]` | Product name `<h3>` |
| `videoChannel` | `[data-showcase-video-channel]` | Brand / seller name |
| `videoThumbnail` | `[data-showcase-video-thumbnail]` | Product `<img>` |

#### Supported patch operations

| Patch op | Behavior |
|----------|---------|
| `update_theme` | Store accent color, card radius, dark/light mode |
| `set_filter` | Show only cards matching department, brand, or keyword tags |
| `update_section` | Hide filter sidebar, adjust grid density (compact/comfortable) |
| `remove_section` | Remove filter sidebar or header |
| `reorder_sections` | Move filter panel above or beside grid |

#### Init snippet

```js
ShowcasePersonalize.init({
  siteId: "acme-store",
  apiBaseUrl: "https://showcase.example.com",
  selectors: {
    root: "[data-showcase-root]",
    topbar: "[data-showcase-section='topbar']",
    sidebar: "[data-showcase-section='sidebar']",
    videoGrid: "[data-showcase-section='video-grid']",
    videoCard: "[data-showcase-video-card]",
    videoTitle: "[data-showcase-video-title]",
    videoChannel: "[data-showcase-video-channel]",
    videoThumbnail: "[data-showcase-video-thumbnail]",
    // No chips in classic Amazon layout; add if site uses department pills
    chips: "[data-showcase-section='chips']",
    chip: "[data-showcase-chip]"
  }
});
```

---

### 3.3 Social-Feed — Instagram

**Pattern:** No persistent sidebar on mobile; narrow centered column of stacked post cards with avatar, caption, like count, and comments. On desktop, a right-column suggestions panel appears. Category tabs (For You / Following / Reels) may appear above the feed.

The Showcase prototype (`/instagram`) replays the Instagram timeline XHR and renders posts as `Video` cards. In the install model the company exposes its own post feed via the attribute contract.

#### Required DOM regions

| Region | Element | Notes |
|--------|---------|-------|
| Root | `<body>` or `<div id="app">` | |
| Topbar | `<header>` | Logo, search icon, notifications, DMs |
| Sidebar (suggestions) | `<aside>` | Right-column "Suggested" panel; desktop only |
| Chips / tabs | `<nav>` | For You / Following / Reels tab strip (if any) |
| Post feed | `<main>` or `<section>` | Vertically stacked posts |
| Post card | `<article>` | One post (image/video + metadata) |

#### Recommended `data-showcase-*` attributes

```html
<body data-showcase-root>
  <header data-showcase-section="topbar">
    <a href="/" data-showcase-logo>Acme Social</a>
    <nav>
      <a href="/explore">Explore</a>
      <a href="/reels">Reels</a>
      <a href="/notifications">❤</a>
      <a href="/messages">✉</a>
    </nav>
  </header>

  <div class="feed-layout">
    <nav data-showcase-section="chips">
      <button data-showcase-chip>For You</button>
      <button data-showcase-chip>Following</button>
      <button data-showcase-chip>Reels</button>
    </nav>

    <main data-showcase-section="video-grid">
      <article
        data-showcase-video-card
        data-showcase-video-id="ig_CxYZabcdef"
        data-showcase-tags="travel photography italy rome"
        data-showcase-views="4280"
        data-showcase-duration="Photo"
        data-showcase-posted-ago="2h ago"
        data-showcase-category="travel"
      >
        <div class="post-header">
          <img class="avatar" src="/avatars/wanderlust.jpg" alt="wanderlust_diaries" />
          <span data-showcase-video-channel>wanderlust_diaries</span>
        </div>
        <img data-showcase-video-thumbnail src="/posts/ig_CxYZabcdef.jpg" alt="" />
        <p data-showcase-video-title>Golden hour in Rome — some moments you just can't plan ✨</p>
        <p class="likes">4,280 likes</p>
      </article>
    </main>

    <aside data-showcase-section="sidebar">
      <h3>Suggested for you</h3>
      <!-- suggestion accounts -->
    </aside>
  </div>
</body>
```

> **Attribute conventions for Instagram cards**
> - `data-showcase-duration` — post type string: `"Photo"`, `"Video"`, `"Reel"`, `"Carousel"`. Drives filter hints.
> - `data-showcase-views` — like count (integer string).
> - `data-showcase-posted-ago` — relative post time (e.g. `"2h ago"`).
> - `data-showcase-tags` — topic tags; use content categories, not hashtags, for reliable filtering.
> - `data-showcase-video-title` — the post caption first line (visible text).
> - `data-showcase-video-channel` — the account username.

#### Selector mapping table

| `ShowcaseSelectors` key | Recommended attribute | Notes |
|-------------------------|-----------------------|-------|
| `root` | `[data-showcase-root]` | |
| `topbar` | `[data-showcase-section='topbar']` | `<header>` |
| `sidebar` | `[data-showcase-section='sidebar']` | Right suggestions panel |
| `chips` | `[data-showcase-section='chips']` | Tab strip (For You / Reels / Following) |
| `chip` | `[data-showcase-chip]` | Individual tab |
| `videoGrid` | `[data-showcase-section='video-grid']` | Post feed `<main>` |
| `videoCard` | `[data-showcase-video-card]` | Each post `<article>` |
| `videoTitle` | `[data-showcase-video-title]` | Caption text `<p>` |
| `videoChannel` | `[data-showcase-video-channel]` | Username `<span>` |
| `videoThumbnail` | `[data-showcase-video-thumbnail]` | Post `<img>` |

#### Supported patch operations

| Patch op | Behavior |
|----------|---------|
| `update_theme` | Background, accent color (story ring, like button), font scale |
| `set_filter` | Filter posts by username, topic tags, or content type (`Photo`/`Reel`) |
| `update_section` | Hide suggestions sidebar; show/hide tab strip |
| `remove_section` | Remove sidebar suggestions panel |
| `reorder_sections` | Move tab strip or reorder main vs. sidebar columns |

#### Init snippet

```js
ShowcasePersonalize.init({
  siteId: "acme-social",
  apiBaseUrl: "https://showcase.example.com",
  selectors: {
    root: "[data-showcase-root]",
    topbar: "[data-showcase-section='topbar']",
    sidebar: "[data-showcase-section='sidebar']",
    chips: "[data-showcase-section='chips']",
    chip: "[data-showcase-chip]",
    videoGrid: "[data-showcase-section='video-grid']",
    videoCard: "[data-showcase-video-card]",
    videoTitle: "[data-showcase-video-title]",
    videoChannel: "[data-showcase-video-channel]",
    videoThumbnail: "[data-showcase-video-thumbnail]"
  }
});
```

---

### 3.4 Workspace — Slack

**Pattern:** A two-panel layout: a narrow, dark-themed channel sidebar on the left and a message timeline on the right. At the far left is an icon-only workspace rail. No topbar in the traditional sense; the channel header bar lives above the message pane. Messages are chronological rows with avatar, author, timestamp, and body text.

The Showcase prototype (`/slack`) wraps the `SlackWorkspaceShell` component, which treats each message as a `Video` card so the shared pipeline (filter, patch, chat) works across all sites. In the install model the company exposes message rows through the attribute contract.

#### Required DOM regions

| Region | Element | Notes |
|--------|---------|-------|
| Root | `<div class="app">` or `<body>` | |
| Topbar | Channel header bar (`<div class="channel-header">`) | Channel name, topic, member count |
| Sidebar | `<aside class="channel-list">` | Workspace name, channel + DM list, search |
| Feed (messages) | `<div class="message-pane">` | Scrollable message thread |
| Message card | `<div class="message-row">` | One message (avatar + author + body) |

There is no category chip strip in the Slack layout. If the company has a "tabs" strip (e.g. All / Mentions / Threads), expose it as `chips`.

#### Recommended `data-showcase-*` attributes

```html
<div data-showcase-root class="slack-app">

  <aside data-showcase-section="sidebar" class="channel-sidebar">
    <div class="workspace-header">
      <span class="workspace-name">Acme Corp</span>
    </div>
    <input type="search" placeholder="Search Acme Corp" />

    <nav class="channel-list">
      <p class="section-label">Channels</p>
      <a href="#general"># general</a>
      <a href="#engineering"># engineering</a>
      <a href="#design"># design</a>
    </nav>

    <nav class="dm-list">
      <p class="section-label">Direct messages</p>
      <a href="/dm/alice">Alice</a>
      <a href="/dm/bob">Bob</a>
    </nav>
  </aside>

  <div class="workspace-body">
    <header data-showcase-section="topbar" class="channel-header">
      <h1># general</h1>
      <p class="topic">Team-wide announcements and discussions</p>
    </header>

    <div data-showcase-section="video-grid" class="message-pane">
      <article
        data-showcase-video-card
        data-showcase-video-id="msg_1716750000_abc"
        data-showcase-tags="announcement release deploy"
        data-showcase-views="0"
        data-showcase-duration="message"
        data-showcase-posted-ago="10:30 AM"
        data-showcase-category="general"
      >
        <img data-showcase-video-thumbnail src="/avatars/alice.jpg" alt="" class="avatar" />
        <span data-showcase-video-channel>alice</span>
        <p data-showcase-video-title>We just deployed v2.4 to production — all green ✅</p>
        <time class="timestamp">10:30 AM</time>
      </article>
    </div>

    <form class="composer">
      <input type="text" placeholder="Message #general" />
    </form>
  </div>
</div>
```

> **Attribute conventions for Slack cards**
> - `data-showcase-video-id` — unique message ID; use `msg_{timestamp}_{shortId}` for stability.
> - `data-showcase-duration` — always `"message"` or `"thread"` to distinguish thread replies.
> - `data-showcase-views` — always `0` (Slack messages have no view count; leave 0 or omit).
> - `data-showcase-posted-ago` — relative or absolute time string (e.g. `"10:30 AM"`, `"2 days ago"`).
> - `data-showcase-tags` — semantic keywords from message content; drive `set_filter` so users can say "show only deploy messages".
> - `data-showcase-video-channel` — the Slack username (not display name) for reliable filtering.
> - `data-showcase-video-title` — first line of the message body (up to ~120 chars).

#### Selector mapping table

| `ShowcaseSelectors` key | Recommended attribute | Notes |
|-------------------------|-----------------------|-------|
| `root` | `[data-showcase-root]` | Outermost app shell |
| `topbar` | `[data-showcase-section='topbar']` | Channel header bar |
| `sidebar` | `[data-showcase-section='sidebar']` | Channel list `<aside>` |
| `chips` | `[data-showcase-section='chips']` | Mention/thread tabs (if any) |
| `chip` | `[data-showcase-chip]` | Individual tab button |
| `videoGrid` | `[data-showcase-section='video-grid']` | Scrollable message pane |
| `videoCard` | `[data-showcase-video-card]` | Each message row |
| `videoTitle` | `[data-showcase-video-title]` | Message body first line `<p>` |
| `videoChannel` | `[data-showcase-video-channel]` | Author username `<span>` |
| `videoThumbnail` | `[data-showcase-video-thumbnail]` | Avatar `<img>` |

#### Supported patch operations

| Patch op | Behavior |
|----------|---------|
| `update_theme` | Sidebar background color, accent color, font scale (compact/default message density) |
| `set_filter` | Show only messages matching keyword tags, author, or `"thread"` type |
| `update_section` | Toggle sidebar collapsed state; hide channel header |
| `remove_section` | Hide the entire sidebar (focus mode) |
| `reorder_sections` | Not commonly used in workspace layout |

> **Note on `remove_section` / reorder:** In the Slack layout the sidebar is deeply coupled to channel navigation. Hiding it via `update_section` with `{ hidden: true }` is safer than `remove_section`, since hiding preserves the node for revert; removing it breaks channel switching until page reload.

#### Init snippet

```js
ShowcasePersonalize.init({
  siteId: "acme-slack",
  apiBaseUrl: "https://showcase.example.com",
  selectors: {
    root: "[data-showcase-root]",
    topbar: "[data-showcase-section='topbar']",
    sidebar: "[data-showcase-section='sidebar']",
    videoGrid: "[data-showcase-section='video-grid']",
    videoCard: "[data-showcase-video-card]",
    videoTitle: "[data-showcase-video-title]",
    videoChannel: "[data-showcase-video-channel]",
    videoThumbnail: "[data-showcase-video-thumbnail]",
    // Only add chips/chip if your workspace has a tab strip above the feed
    chips: "[data-showcase-section='chips']",
    chip: "[data-showcase-chip]"
  }
});
```

---

## 4. Migration Path (3-Step Per Archetype)

Follow this three-step process for each archetype. Steps are the same regardless of archetype; the only difference is which regions exist.

### Step 1 — Annotate the host page

Add `data-showcase-*` attributes to the company's existing HTML template (server-rendered, React, Vue, etc.). Use the archetype's **required DOM regions** table and **HTML snippet** above as a reference. No structural changes to the page are needed; attributes are purely additive.

**Checklist:**
- [ ] `data-showcase-root` on the outermost container.
- [ ] `data-showcase-section="topbar"` on the header.
- [ ] `data-showcase-section="sidebar"` on the nav/filter panel (if present).
- [ ] `data-showcase-section="chips"` on the chip/tab strip (if present).
- [ ] `data-showcase-section="video-grid"` on the main content region.
- [ ] `data-showcase-video-card` on every repeated item card.
- [ ] `data-showcase-video-title`, `data-showcase-video-channel`, `data-showcase-video-thumbnail` on each card's sub-elements.
- [ ] `data-showcase-tags` on each card with stable topic words (not user-generated hashtags).
- [ ] `data-showcase-video-id` on each card with a stable, unique ID.

### Step 2 — Register the site and embed the script

1. **Register** the site in the Showcase backend:
   ```bash
   pnpm seed:install   # install demo slugs (amazon-demo, instagram-demo, slack-demo)
   pnpm seed:sites     # full prototype slugs (amazon-storefront, instagram-feed, slack-workspace)
   ```
2. **Add CORS origin** for the company domain in `INSTALL_ALLOWED_ORIGINS`.
3. **Embed the script** at the bottom of `<body>` (or via a tag manager):
   ```html
   <script src="https://showcase.example.com/showcase-install.iife.js" defer></script>
   <script>
     window.addEventListener('DOMContentLoaded', function () {
       ShowcasePersonalize.init({
         siteId: "YOUR_SITE_ID",
         apiBaseUrl: "https://showcase.example.com",
         selectors: { /* archetype selectors from section 3 */ }
       });
     });
   </script>
   ```
4. **Verify** using the browser console: `ShowcasePersonalize` should be defined, the floating chat button should appear, and `GET /api/install/page?siteId=YOUR_SITE_ID` should return a `patches` array (empty on first visit).

### Step 3 — Validate and tune

Run the built-in setup audit with `debug: true` or `install.auditSetup()` — it reports missing root, feed region, cards, titles, and tags before go-live.

1. Open the page and open the chat overlay.
2. Ask the assistant to change the theme, filter by a topic, or hide a section. Verify the DOM changes.
3. Reload to confirm patches persist (the backend re-applies them on `GET /api/install/page`).
4. Add more `data-showcase-tags` to cards that are being missed by filters.
5. If CORS errors appear, re-check `INSTALL_ALLOWED_ORIGINS`.
6. If patches do not persist across reloads, confirm the visitor id cookie is being set and `POST /api/install/session` returns `{ visitorId }`.

**Per-archetype gotchas:**

| Archetype | Common issue | Fix |
|-----------|-------------|-----|
| feed-of-cards | Category chips missing from snapshot | Confirm `<nav data-showcase-section="chips">` is rendered before `init()` fires |
| product-grid | Price/rating not in scanner | Store price in `data-showcase-duration`, rating in `data-showcase-posted-ago` |
| social-feed | Posts loaded via infinite scroll | Re-scan on mutation with `MutationObserver` (v2 roadmap; for now annotate initial 20 posts) |
| workspace | Sidebar hides channel switching | Use `update_section` to hide, never `remove_section`; always keep sidebar node in DOM |

---

## 5. Patch Operation Support Matrix

All four archetypes support the same five v1 patch operations, but practical usefulness varies by site shape.

| Patch op | feed-of-cards | product-grid | social-feed | workspace |
|----------|:---:|:---:|:---:|:---:|
| `update_theme` | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| `set_filter` | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| `update_section` | ✅ Full | ✅ Full | ✅ Full | ✅ Partial† |
| `remove_section` | ✅ Full | ✅ Full | ✅ Full | ⚠️ Risky† |
| `reorder_sections` | ✅ Full | ✅ Useful | ✅ Useful | ⚠️ Rarely useful |

† See Slack note in §3.4.

### What "full" means per patch op

- **`update_theme`** — Sets CSS custom properties (`--showcase-accent`, `--showcase-bg`, `--showcase-fg`) on the root element. The company's stylesheet must consume these variables, or use the built-in Showcase injected stylesheet override.
- **`set_filter`** — Hides/shows cards by setting `display: none` (or a toggled class) on `[data-showcase-video-card]` elements that do not match the filter criteria derived from `videoTitle`, `videoChannel`, and `data-showcase-tags`.
- **`update_section`** — Applies `data-showcase-hidden` or `data-showcase-density` attributes to a `[data-showcase-section]` element. The install script uses a small injected stylesheet to translate these into `display: none` and spacing adjustments.
- **`remove_section`** — Physically removes the section element from the DOM. Use sparingly; prefer `update_section` for reversible changes.
- **`reorder_sections`** — Moves `[data-showcase-section]` elements within their shared parent using `insertBefore`. Works only when all target sections share the same parent.

---

## 6. Reference: `ShowcaseSelectors` Interface

Defined in `packages/install/src/scanner.ts`:

```typescript
export interface ShowcaseSelectors {
  root: string;       // Outermost container; required
  topbar: string;     // Navigation header section
  sidebar: string;    // Left/right panel section
  chips: string;      // Category chip / tab strip section
  chip: string;       // Individual chip element inside chips
  videoGrid: string;  // Main content feed section (cards container)
  videoCard: string;  // Repeated item card
  videoTitle: string; // Primary label inside card
  videoChannel: string; // Author/source label inside card
  videoThumbnail: string; // <img> with src inside card
}
```

All keys accept any valid CSS selector string. Selectors are resolved relative to the `root` element (or `document.body` if root is absent). Override any key in the `selectors` object passed to `init()` to adapt to a site that cannot use the default `data-showcase-*` attributes—for example, a site that already uses stable class names:

```js
ShowcasePersonalize.init({
  siteId: "legacy-store",
  selectors: {
    root: "#app",
    topbar: ".site-header",
    sidebar: ".filter-panel",
    videoGrid: ".product-results",
    videoCard: ".product-card",
    videoTitle: ".product-card__title",
    videoChannel: ".product-card__brand",
    videoThumbnail: ".product-card__image img",
    chips: ".dept-tabs",
    chip: ".dept-tabs__tab"
  }
});
```

Using stable class or id selectors is acceptable. `data-showcase-*` attributes are recommended because they are semantically explicit and invisible to CSS, making them less likely to conflict with style changes.
