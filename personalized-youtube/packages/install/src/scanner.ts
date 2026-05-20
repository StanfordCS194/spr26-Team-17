import { PageConfigSchema, type PageConfig, type Video } from '@showcase/shared';

export interface ShowcaseSelectors {
  root: string;
  topbar: string;
  sidebar: string;
  chips: string;
  chip: string;
  videoGrid: string;
  videoCard: string;
  videoTitle: string;
  videoChannel: string;
  videoThumbnail: string;
}

export interface DomBindings {
  root: Element;
  topbar: Element | null;
  sidebar: Element | null;
  chips: Element | null;
  videoGrid: Element | null;
  videoCards: Element[];
  sections: Element[];
}

export interface ScanResult {
  config: PageConfig;
  bindings: DomBindings;
}

// Default contract a YouTube-like host page must follow for zero-config scanning.
export const DEFAULT_SELECTORS: ShowcaseSelectors = {
  root: '[data-showcase-root]',
  topbar: "[data-showcase-section='topbar']",
  sidebar: "[data-showcase-section='sidebar']",
  chips: "[data-showcase-section='chips']",
  chip: '[data-showcase-chip]',
  videoGrid: "[data-showcase-section='video-grid']",
  videoCard: '[data-showcase-video-card]',
  videoTitle: '[data-showcase-video-title]',
  videoChannel: '[data-showcase-video-channel]',
  videoThumbnail: '[data-showcase-video-thumbnail]',
};

// Reads visible text from the first matching child element.
function textOf(root: Element, selector: string): string {
  return root.querySelector(selector)?.textContent?.trim() ?? '';
}

// Reads an attribute, such as a thumbnail src, from the first matching child.
function attrOf(root: Element, selector: string, attr: string): string {
  return root.querySelector(selector)?.getAttribute(attr)?.trim() ?? '';
}

// Builds searchable tags from explicit data attributes plus title/channel words.
function tagsFor(card: Element, title: string, channel: string): string[] {
  const raw = card.getAttribute('data-showcase-tags') ?? '';
  const explicit = raw
    .split(/[,\s]+/)
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  const derived = `${title} ${channel}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2);
  return Array.from(new Set([...explicit, ...derived]));
}

// Converts one host DOM card into the shared Video object used by our pipeline.
function videoFromCard(card: Element, index: number, selectors: ShowcaseSelectors): Video {
  const title = textOf(card, selectors.videoTitle) || `Video ${index + 1}`;
  const channel = textOf(card, selectors.videoChannel) || 'Unknown channel';
  const thumbnail = attrOf(card, selectors.videoThumbnail, 'src');
  const id = card.getAttribute('data-showcase-video-id') || `host-video-${index + 1}`;
  return {
    id,
    title,
    channel: {
      name: channel,
      avatar: '',
      verified: false,
      subscriberCount: 0,
    },
    thumbnail,
    duration: card.getAttribute('data-showcase-duration') || '0:00',
    views: Number(card.getAttribute('data-showcase-views') || 0),
    postedAgo: card.getAttribute('data-showcase-posted-ago') || '',
    tags: tagsFor(card, title, channel),
    description: '',
    category: card.getAttribute('data-showcase-category') || 'host',
  };
}

// Section ids come from data-showcase-section so patches can target DOM sections.
function sectionId(el: Element | null, fallback: string): string {
  return el?.getAttribute('data-showcase-section') || fallback;
}

// Scans a static host page and returns both a PageConfig snapshot and live DOM bindings.
export function scanHostPage(
  selectorOverrides: Partial<ShowcaseSelectors> = {},
  doc: Document = document,
): ScanResult {
  const selectors = { ...DEFAULT_SELECTORS, ...selectorOverrides };

  // Prefer the declared root, but fall back to body/documentElement for demos.
  const root = doc.querySelector(selectors.root) ?? doc.body ?? doc.documentElement;
  if (!root) {
    throw new Error('Showcase install could not find a root element to scan');
  }

  // Bind the real elements we will later patch directly in the browser.
  const topbar = root.querySelector(selectors.topbar);
  const sidebar = root.querySelector(selectors.sidebar);
  const chips = root.querySelector(selectors.chips);
  const videoGrid = root.querySelector(selectors.videoGrid);
  const videoCards = Array.from(root.querySelectorAll(selectors.videoCard));
  const sections = Array.from(root.querySelectorAll('[data-showcase-section]'));
  const chipLabels = chips
    ? Array.from(chips.querySelectorAll(selectors.chip)).map((chip) => chip.textContent?.trim() ?? '').filter(Boolean)
    : [];
  const videos = videoCards.map((card, index) => videoFromCard(card, index, selectors));

  // Parse through the shared schema so install snapshots match the main app shape.
  const config = PageConfigSchema.parse({
    id: 'host-page',
    slug: 'host-page',
    theme: {
      mode: 'light',
      accent: '#FF0033',
      fontScale: '1',
      fontFamily: 'sans',
      radius: 'md',
      background: { kind: 'solid', angle: 180, intensity: 0.7 },
      videoCardDefaults: {},
    },
    sections: [
      {
        id: sectionId(topbar, 'topbar'),
        type: 'TopBar',
        props: {
          logoText: topbar?.textContent?.trim().split(/\s+/)[0] ?? 'YouTube',
          searchPlaceholder: 'Search',
          compactSearch: false,
          showProfileChip: true,
        },
      },
      {
        id: sectionId(sidebar, 'sidebar'),
        type: 'Sidebar',
        props: {
          collapsed: false,
          pinnedItems: sidebar
            ? Array.from(sidebar.querySelectorAll('a,button')).map((item) => item.textContent?.trim() ?? '').filter(Boolean)
            : ['Home', 'Shorts', 'Subscriptions', 'You'],
          showSubscriptions: true,
        },
      },
      {
        id: sectionId(chips, 'chips'),
        type: 'CategoryChips',
        props: {
          active: chipLabels[0] ?? 'All',
          chips: chipLabels.length > 0 ? chipLabels : ['All'],
        },
      },
      {
        id: sectionId(videoGrid, 'video-grid'),
        type: 'VideoGrid',
        props: {
          columns: 4,
          density: 'cozy',
          layout: 'grid',
          videos,
        },
      },
    ],
    filter: {},
    sort: {},
    meta: { title: doc.title || 'YouTube', favicon: '/favicon.ico' },
  });

  return {
    config,
    bindings: {
      root,
      topbar,
      sidebar,
      chips,
      videoGrid,
      videoCards,
      sections,
    },
  };
}
