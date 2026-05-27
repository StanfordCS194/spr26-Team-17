import type { FilterState, Patch } from '@showcase/shared';
import type { DomBindings } from './scanner';

// Hides an element while remembering its previous display style for reset/show.
function setHidden(el: Element | null, hidden: boolean) {
  if (!el) return;
  const html = el as HTMLElement;
  if (hidden) {
    if (!html.dataset.showcaseOriginalDisplay) {
      html.dataset.showcaseOriginalDisplay = html.style.display || '__empty__';
    }
    html.style.display = 'none';
    html.setAttribute('data-showcase-hidden', 'true');
  } else {
    const original = html.dataset.showcaseOriginalDisplay;
    html.style.display = !original || original === '__empty__' ? '' : original;
    html.removeAttribute('data-showcase-hidden');
  }
}

// Finds a section by the stable data-showcase-section id used in patches.
function sectionById(bindings: DomBindings, sectionId: string): Element | null {
  return bindings.sections.find((section) => section.getAttribute('data-showcase-section') === sectionId) ?? null;
}

// Normalizes filter terms before comparing them with card text.
function normalizeWords(values: string[] | undefined): string[] {
  return (values ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean);
}

// Collects the searchable text we know about for a video card.
function cardText(card: Element): string {
  return [
    card.textContent ?? '',
    card.getAttribute('data-showcase-tags') ?? '',
    card.getAttribute('data-showcase-category') ?? '',
  ].join(' ').toLowerCase();
}

// Supports plain substring matching and simple /regex/flags filter patterns.
function matchesAny(text: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
      const last = pattern.lastIndexOf('/');
      try {
        return new RegExp(pattern.slice(1, last), pattern.slice(last + 1)).test(text);
      } catch {
        return text.includes(pattern.toLowerCase());
      }
    }
    return text.includes(pattern.toLowerCase());
  });
}

// Applies v1 filtering by hiding cards that do not match the requested criteria.
function applyFilter(bindings: DomBindings, filter: Partial<FilterState>) {
  const requireTags = normalizeWords(filter.requireTags);
  const include = normalizeWords(filter.include);
  const exclude = normalizeWords(filter.exclude);
  const blockChannels = normalizeWords(filter.blockChannels);
  const requireTitleMatches = normalizeWords(filter.requireTitleMatches);
  const excludeTitleMatches = normalizeWords(filter.excludeTitleMatches);

  const cards = bindings.itemCards ?? bindings.videoCards;
  for (const card of cards) {
    const text = cardText(card);
    let visible = true;
    if (requireTags.length > 0) visible = requireTags.some((tag) => text.includes(tag));
    if (visible && include.length > 0) visible = include.some((term) => text.includes(term));
    if (visible && exclude.length > 0) visible = !exclude.some((term) => text.includes(term));
    if (visible && blockChannels.length > 0) visible = !blockChannels.some((term) => text.includes(term));
    if (visible && requireTitleMatches.length > 0) visible = matchesAny(text, requireTitleMatches);
    if (visible && excludeTitleMatches.length > 0) visible = !matchesAny(text, excludeTitleMatches);
    setHidden(card, !visible);
  }
}

// Applies theme-level changes as CSS variables/styles on the host root element.
function applyTheme(bindings: DomBindings, patch: Record<string, unknown>) {
  const root = bindings.root as HTMLElement;
  if (typeof patch.mode === 'string') {
    root.setAttribute('data-showcase-theme', patch.mode);
    if (patch.mode === 'dark') {
      root.style.setProperty('--bg', '#0f0f0f');
      root.style.setProperty('--fg', '#f5f5f5');
      root.style.setProperty('--muted', '#242424');
      root.style.setProperty('--muted-fg', '#b8b8b8');
      root.style.setProperty('--border', '#333333');
    } else if (patch.mode === 'light') {
      root.style.setProperty('--bg', '#ffffff');
      root.style.setProperty('--fg', '#0f0f0f');
      root.style.setProperty('--muted', '#f2f2f2');
      root.style.setProperty('--muted-fg', '#606060');
      root.style.setProperty('--border', '#dedede');
    }
  }
  if (typeof patch.accent === 'string') {
    root.style.setProperty('--accent', patch.accent);
  }
  if (typeof patch.fontScale === 'string') {
    root.style.setProperty('--showcase-font-scale', patch.fontScale);
    root.style.fontSize = `${Number(patch.fontScale) * 100}%`;
  }
  const background = patch.background;
  if (background && typeof background === 'object') {
    const bg = background as { kind?: string; from?: string; to?: string; angle?: number };
    if (bg.kind === 'gradient' && bg.from && bg.to) {
      root.style.background = `linear-gradient(${bg.angle ?? 180}deg, ${bg.from}, ${bg.to})`;
    } else if ((bg.kind === 'solid' || bg.kind === 'paper') && bg.from) {
      root.style.background = bg.from;
    }
  }
}

// Applies section-level changes that a static DOM can safely represent.
function applySectionPatch(bindings: DomBindings, sectionId: string, patch: Record<string, unknown>) {
  const section = sectionById(bindings, sectionId);
  if (!section) return;
  if (typeof patch.visible === 'boolean') {
    setHidden(section, !patch.visible);
  }
  if (typeof patch.density === 'string') {
    section.setAttribute('data-showcase-density', patch.density);
  }
  if (typeof patch.layout === 'string') {
    section.setAttribute('data-showcase-layout', patch.layout);
  }
}

// Reorders known section elements by appending them to their existing parent.
function reorderSections(bindings: DomBindings, order: string[]) {
  const byId = new Map(bindings.sections.map((section) => [section.getAttribute('data-showcase-section'), section]));
  for (const id of order) {
    const section = byId.get(id);
    const parent = section?.parentElement;
    if (section && parent) parent.appendChild(section);
  }
}

// Dispatches shared patch objects into install-safe DOM mutations.
export function applyDomPatch(patch: Patch, bindings: DomBindings): void {
  switch (patch.op) {
    case 'update_theme':
      applyTheme(bindings, patch.patch as Record<string, unknown>);
      return;
    case 'update_section':
      applySectionPatch(bindings, patch.sectionId, patch.patch);
      return;
    case 'set_filter':
      applyFilter(bindings, patch.filter);
      return;
    case 'remove_section':
      setHidden(sectionById(bindings, patch.sectionId), true);
      return;
    case 'reorder_sections':
      reorderSections(bindings, patch.order);
      return;
    default:
      console.warn(`[Showcase] Unsupported install patch op: ${patch.op}`);
  }
}
