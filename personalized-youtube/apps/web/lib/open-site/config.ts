// Builds a personalizable PageConfig for an arbitrarily-opened URL.
//
// Strategy: make the tab look like the REAL site as much as the template set
// allows —
//   1. Public server-side fetch of the URL → real cards + identity signals
//      (site name, favicon, theme-color, content kind).
//   2. Theme the page from that identity: accent color, favicon-as-logo, and a
//      layout matched to the content kind (article→list, product→dense grid…).
//   3. Render the site's OWN content only — NO cross-site mock padding, so it
//      never looks like a YouTube clone.
// No DB row is required; dynamic tabs are built on demand and cached briefly.

import {
  PageConfigSchema,
  openSiteLabel,
  type PageConfig,
  type Video,
} from '@showcase/shared';
import { ingestPublicPage, type ContentKind } from '../ingest/public-page';

const TARGET_GRID = 36;
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { config: PageConfig; ts: number }>();

// Stable, pleasant accent derived from the hostname when the site exposes no
// theme-color. Keeps each opened site visually consistent across reloads.
function hostnameColor(host: string): string {
  let h = 0;
  for (let i = 0; i < host.length; i++) h = (h * 31 + host.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return hslToHex(hue, 65, 45);
}

function hslToHex(hSat: number, s: number, l: number): string {
  const a = (s * Math.min(l, 100 - l)) / 100 / 100;
  const f = (n: number) => {
    const k = (n + hSat / 30) % 12;
    const color = l / 100 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Relative luminance (0..1) so we can keep the accent dark enough that white
// text on it stays legible (the topbar logo chip uses --accent-fg = white).
function luminance(hex: string): number {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return 0.5;
  const [r, g, b] = [m[1], m[2], m[3]].map((c) => parseInt(c!, 16) / 255) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function pickAccent(detected: string | null, host: string): string {
  const candidate = detected ?? hostnameColor(host);
  // Too-light brand colors (e.g. near-white) make the white-on-accent logo
  // invisible — fall back to a hostname color in that case.
  return luminance(candidate) > 0.8 ? hostnameColor(host) : candidate;
}

interface LayoutChoice {
  columns: 2 | 3 | 4 | 5;
  density: 'compact' | 'cozy' | 'comfortable';
  layout: 'grid' | 'list' | 'shelves';
  aspectRatio: '16:9' | '4:3' | '1:1' | '3:4';
  cardLayout: 'vertical' | 'horizontal';
  chips: string[];
}

function layoutForKind(kind: ContentKind): LayoutChoice {
  switch (kind) {
    case 'article':
      return { columns: 2, density: 'comfortable', layout: 'list', aspectRatio: '16:9', cardLayout: 'horizontal', chips: ['Top stories', 'Latest', 'For you', 'Saved'] };
    case 'product':
      return { columns: 5, density: 'compact', layout: 'grid', aspectRatio: '1:1', cardLayout: 'vertical', chips: ['All', 'Best sellers', 'Deals', 'New'] };
    case 'social':
      return { columns: 3, density: 'compact', layout: 'grid', aspectRatio: '1:1', cardLayout: 'vertical', chips: ['Feed', 'Following', 'Explore', 'Saved'] };
    case 'video':
      return { columns: 4, density: 'cozy', layout: 'grid', aspectRatio: '16:9', cardLayout: 'vertical', chips: ['All', 'Latest', 'Popular', 'Watch later'] };
    default:
      return { columns: 4, density: 'cozy', layout: 'grid', aspectRatio: '16:9', cardLayout: 'vertical', chips: ['All', 'Latest', 'Popular', 'Saved'] };
  }
}

function hashId(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return `web_${(h >>> 0).toString(36)}`;
}

function cardsToVideos(
  siteName: string,
  favicon: string,
  cards: Array<{ title: string; thumbnail: string; href: string; description: string }>,
): Video[] {
  const out: Video[] = [];
  const seen = new Set<string>();
  for (const card of cards) {
    if (!card.title.trim()) continue;
    const id = hashId(card.href || card.title);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      title: card.title,
      channel: {
        name: siteName,
        avatar: favicon || '/favicon.ico',
        verified: false,
        subscriberCount: 0,
      },
      thumbnail: card.thumbnail || '',
      duration: 'Web',
      views: 0,
      postedAgo: '',
      tags: ['web', 'opened-site'],
      description: card.description ?? '',
      category: 'web',
    });
  }
  return out;
}

interface SiteIdentity {
  slug: string;
  siteName: string;
  logoText: string;
  favicon: string;
  accent: string;
  kind: ContentKind;
  mode: 'light' | 'dark';
  fontKey: string;
  radius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Column count read from the site's CSS, or null to use the kind default. */
  columns: 2 | 3 | 4 | 5 | null;
}

function buildConfig(identity: SiteIdentity, videos: Video[]): PageConfig {
  const l = layoutForKind(identity.kind);
  const isArticle = identity.kind === 'article';
  const columns = identity.columns ?? l.columns;

  const topBar = {
    id: 'topBar',
    type: 'TopBar' as const,
    props: {
      logoText: identity.logoText.slice(0, 40) || 'Opened site',
      searchPlaceholder: `Search ${identity.siteName}`.slice(0, 40),
      compactSearch: false,
      showProfileChip: true,
    },
  };

  // Many large sites (DoorDash, etc.) sit behind bot protection and can't be
  // previewed server-side. Rather than a broken-looking empty grid, show just
  // the site identity + a clear note so the tab still reads as that site.
  const sections =
    videos.length === 0
      ? [
          topBar,
          {
            id: 'emptyNote',
            type: 'CustomNote' as const,
            props: {
              visible: true,
              text: `${identity.siteName} blocks automated preview, so we couldn't load its public content. You can still personalize this tab's look, or ask the assistant to open a different link.`,
            },
          },
        ]
      : [
          topBar,
          {
            id: 'categoryChips',
            type: 'CategoryChips' as const,
            props: { active: l.chips[0] ?? 'All', chips: l.chips },
          },
          {
            id: 'videoGrid',
            type: 'VideoGrid' as const,
            props: { columns, density: l.density, layout: l.layout, videos },
          },
        ];

  return PageConfigSchema.parse({
    id: identity.slug,
    slug: identity.slug,
    theme: {
      mode: identity.mode,
      accent: identity.accent,
      fontScale: '1',
      fontFamily: identity.fontKey,
      radius: identity.radius,
      background: { kind: 'solid' },
      videoCardDefaults: {
        aspectRatio: l.aspectRatio,
        thumbnailScale: 1,
        titleWeight: 600,
        channelNameWeight: 400,
        showDescription: isArticle,
        showViewCount: false,
        showPostedAgo: false,
        showDuration: false,
        cardLayout: l.cardLayout,
        hoverEffect: 'lift',
      },
    },
    sections,
    filter: { include: [], exclude: [], requireTags: [], blockChannels: [] },
    sort: { by: 'recommended', order: 'desc' },
    meta: { title: identity.siteName.slice(0, 60) || 'Opened site', favicon: identity.favicon || '/favicon.ico' },
  });
}

/** Build (or return cached) PageConfig for a dynamically-opened URL + its slug. */
export async function getOpenSiteConfig(url: string, slug: string): Promise<PageConfig> {
  const cached = cache.get(slug);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.config;

  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return 'site';
    }
  })();

  const ingest = await ingestPublicPage(url);
  // Render the site's OWN content only — no cross-site mock padding, so the tab
  // looks like the real site rather than a YouTube clone.
  let identity: SiteIdentity;
  let videos: Video[] = [];
  if (ingest.kind === 'ok') {
    const fe = ingest.frontend;
    identity = {
      slug,
      siteName: ingest.siteName || openSiteLabel(url),
      logoText: ingest.siteName || ingest.title || openSiteLabel(url),
      favicon: ingest.favicon,
      accent: pickAccent(fe.accent ?? ingest.themeColor, host),
      kind: ingest.contentKind,
      mode: fe.mode,
      fontKey: fe.fontKey,
      radius: fe.radius,
      columns: fe.columns,
    };
    videos = cardsToVideos(identity.siteName, ingest.favicon, ingest.cards).slice(0, TARGET_GRID);
  } else {
    console.warn(`[open-site] ingest unavailable for ${slug}: ${ingest.reason}`);
    identity = {
      slug,
      siteName: openSiteLabel(url),
      logoText: openSiteLabel(url),
      // Google's favicon service resolves even when the origin blocks our fetch,
      // so the tab still shows the real site mark.
      favicon: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`,
      accent: hostnameColor(host),
      kind: 'generic',
      mode: 'light',
      fontKey: 'inter',
      radius: 'lg',
      columns: null,
    };
  }

  const config = buildConfig(identity, videos);
  cache.set(slug, { config, ts: Date.now() });
  return config;
}
