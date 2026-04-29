export const SCHEMA_CATALOG = `## Section type catalog

Every section in the page has shape \`{ id: string, type: <one of below>, props: <type-specific> }\`. Use update_section to edit props by id.

### TopBar
Top navigation. Props:
  - logoText: string
  - searchPlaceholder: string
  - compactSearch: boolean — true shrinks search bar
  - showProfileChip: boolean

### Sidebar
Left navigation. Props:
  - collapsed: boolean — true hides labels, icon-only
  - pinnedItems: string[] — labels of items pinned at top
  - showSubscriptions: boolean

### CategoryChips
Horizontal filter chips above the grid. Props:
  - active: string — currently selected chip
  - chips: string[] — list of chip labels

### VideoGrid
Main feed grid. Props:
  - columns: 2 | 3 | 4 | 5
  - density: 'compact' | 'cozy' | 'comfortable' — compact hides description, smaller card; cozy is default; comfortable adds whitespace
  - videos: Video[] — managed by adapter; usually do NOT touch directly

### RecommendedRow
Horizontal carousel of recommendations. Props:
  - headline: string
  - videos: Video[] — managed by adapter

### ShortsRow
Short-form video shelf. Props:
  - visible: boolean — set false to hide entirely (or use remove_section)
  - headline: string
  - shorts: Short[]

### ContinueWatchingRow
Resume-where-you-left-off shelf. Props:
  - visible: boolean
  - headline: string
  - videos: Video[]

### FilterSummary
Pills showing what filters are currently active. Props:
  - visible: boolean
  - active: { label: string, kind: 'include'|'exclude'|'requireTag'|'blockChannel'|'sort' }[]
  Auto-managed when filters change. You can hide it.

### CustomNote
Visitor-defined note pinned to the page. Props:
  - text: string
  - visible: boolean

## Theme

Top-level theme object. Use update_theme.
  - mode: 'light' | 'dark'
  - accent: hex color string (#RRGGBB)
  - fontScale: '0.875' | '1' | '1.125' | '1.25'
  - radius: 'none'|'sm'|'md'|'lg'|'xl'
  - videoCardDefaults: {
      aspectRatio: '16:9'|'4:3'|'1:1'|'3:4',
      thumbnailScale: number 0.5–2,
      titleWeight: 100–900,
      channelNameWeight: 100–900,
      showDescription: boolean,
      showViewCount: boolean,
      showPostedAgo: boolean,
      showDuration: boolean
    }

## Filter and sort

Top-level state, edited via set_filter and set_sort:
  - filter: {
      include[], exclude[], requireTags[], blockChannels[],
      minDurationSeconds?, maxDurationSeconds?,
      minRating?,
      minSubscriberCount?, maxSubscriberCount?  // for "hide channels under 100k subs", "only big creators"
    }
  - sort: { by: 'recommended'|'recent'|'popular'|'duration', order: 'asc'|'desc' }

## Tag vocabulary (for filter matching)

Music subgenres: jazz, classical, chill, hip-hop, rock, electronic, indie, lofi, ambient, instrumental
Energy: high-energy, low-energy, chill, hype, calm
Format: tutorial, review, vlog, news, podcast, reaction, gameplay, walkthrough
Topic: gaming, cooking, tech, news, education, comedy, fitness, sports, science, history, kids, beauty, travel, diy, business, finance, fashion, photography, cars, climbing, woodworking, art, gardening, language

When the visitor says "more chill jazz", that's requireTags: ['jazz', 'chill']. "Less bangers" is exclude: ['high-energy', 'hype'].`;
