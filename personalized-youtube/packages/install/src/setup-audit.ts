import { ARCHETYPE_PRESETS, DEFAULT_SELECTORS, type ShowcaseSelectors, type SiteArchetype } from './scanner';

export type AuditLevel = 'error' | 'warn' | 'info';

export interface AuditIssue {
  level: AuditLevel;
  code: string;
  message: string;
  hint?: string;
}

export interface AuditReport {
  archetype: SiteArchetype;
  ready: boolean;
  cardCount: number;
  issues: AuditIssue[];
  summary: string;
}

function resolvedSelectors(
  archetype: SiteArchetype,
  overrides: Partial<ShowcaseSelectors>,
): ShowcaseSelectors {
  return { ...DEFAULT_SELECTORS, ...ARCHETYPE_PRESETS[archetype], ...overrides };
}

function cardSelector(selectors: ShowcaseSelectors): string {
  return selectors.itemCard ?? selectors.videoCard;
}

function titleSelector(selectors: ShowcaseSelectors): string {
  return selectors.itemTitle ?? selectors.videoTitle;
}

function subtitleSelector(selectors: ShowcaseSelectors): string {
  return selectors.itemSubtitle ?? selectors.videoChannel;
}

function imageSelector(selectors: ShowcaseSelectors): string {
  return selectors.itemImage ?? selectors.videoThumbnail;
}

// Scans a host page and reports missing Showcase markup before go-live.
export function auditInstallSetup(
  selectorOverrides: Partial<ShowcaseSelectors> = {},
  doc: Document = document,
  archetype: SiteArchetype = 'youtube',
): AuditReport {
  const selectors = resolvedSelectors(archetype, selectorOverrides);
  const issues: AuditIssue[] = [];

  const root = doc.querySelector(selectors.root);
  if (!root) {
    issues.push({
      level: 'error',
      code: 'missing_root',
      message: `Root not found for ${selectors.root}`,
      hint: 'Add data-showcase-root on the outermost page wrapper.',
    });
  }

  const regions: Array<{ key: string; selector: string; required: boolean }> = [
    { key: 'topbar', selector: selectors.topbar, required: false },
    { key: 'sidebar', selector: selectors.sidebar, required: archetype === 'slack' },
    { key: 'chips', selector: selectors.chips, required: false },
    { key: 'feed', selector: selectors.videoGrid, required: true },
  ];

  for (const region of regions) {
    const el = root?.querySelector(region.selector) ?? doc.querySelector(region.selector);
    if (!el && region.required) {
      issues.push({
        level: 'error',
        code: `missing_${region.key}`,
        message: `Required region not found: ${region.selector}`,
        hint: `Add data-showcase-section on your ${region.key} element.`,
      });
    } else if (!el) {
      issues.push({
        level: 'info',
        code: `optional_${region.key}`,
        message: `Optional region not found: ${region.selector}`,
      });
    }
  }

  const cards = Array.from((root ?? doc).querySelectorAll(cardSelector(selectors)));
  if (cards.length === 0) {
    issues.push({
      level: 'error',
      code: 'no_cards',
      message: `No item cards matched ${cardSelector(selectors)}`,
      hint: archetype === 'youtube'
        ? 'Add data-showcase-video-card on each content card.'
        : 'Add data-showcase-item-card on each content card.',
    });
  }

  const titleSel = titleSelector(selectors);
  const subtitleSel = subtitleSelector(selectors);
  const imageSel = imageSelector(selectors);

  for (const [index, card] of cards.entries()) {
    if (!card.querySelector(titleSel)) {
      issues.push({
        level: 'warn',
        code: 'card_missing_title',
        message: `Card ${index + 1} is missing title selector ${titleSel}`,
      });
    }
    if (!card.querySelector(subtitleSel)) {
      issues.push({
        level: 'warn',
        code: 'card_missing_subtitle',
        message: `Card ${index + 1} is missing subtitle selector ${subtitleSel}`,
      });
    }
    if (archetype !== 'slack' && !card.querySelector(imageSel)) {
      issues.push({
        level: 'info',
        code: 'card_missing_image',
        message: `Card ${index + 1} has no image at ${imageSel}`,
      });
    }
    if (!card.getAttribute('data-showcase-tags')) {
      issues.push({
        level: 'info',
        code: 'card_missing_tags',
        message: `Card ${index + 1} has no data-showcase-tags — chat filters may be less precise`,
        hint: 'Add data-showcase-tags="topic keywords" for reliable set_filter behavior.',
      });
    }
  }

  if (cards.length > 0 && cards.length < 3) {
    issues.push({
      level: 'warn',
      code: 'few_cards',
      message: `Only ${cards.length} card(s) detected — personalization demos work best with 3+ items`,
    });
  }

  const errors = issues.filter((issue) => issue.level === 'error').length;
  const ready = errors === 0 && cards.length > 0;
  const summary = ready
    ? `Ready: ${cards.length} cards found for archetype "${archetype}".`
    : `${errors} blocking issue(s), ${issues.length} total — run ShowcasePersonalize.auditSetup() after fixes.`;

  return { archetype, ready, cardCount: cards.length, issues, summary };
}
