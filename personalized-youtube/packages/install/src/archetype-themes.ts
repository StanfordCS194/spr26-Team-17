import type { SiteArchetype } from './scanner';

export interface ArchetypeTheme {
  accent: string;
  mode: 'light' | 'dark';
  bg: string;
  fg: string;
  muted: string;
  mutedFg: string;
  border: string;
}

export const ARCHETYPE_THEMES: Record<SiteArchetype, ArchetypeTheme> = {
  youtube: {
    accent: '#FF0033',
    mode: 'light',
    bg: '#ffffff',
    fg: '#0f0f0f',
    muted: '#f2f2f2',
    mutedFg: '#606060',
    border: '#dedede',
  },
  amazon: {
    accent: '#FF9900',
    mode: 'light',
    bg: '#ffffff',
    fg: '#0f1111',
    muted: '#f3f3f3',
    mutedFg: '#565959',
    border: '#d5d9d9',
  },
  instagram: {
    accent: '#E1306C',
    mode: 'light',
    bg: '#fafafa',
    fg: '#262626',
    muted: '#efefef',
    mutedFg: '#8e8e8e',
    border: '#dbdbdb',
  },
  slack: {
    accent: '#611F69',
    mode: 'light',
    bg: '#ffffff',
    fg: '#1d1c1d',
    muted: '#f8f8f8',
    mutedFg: '#616061',
    border: '#dddddd',
  },
};

export function applyArchetypeTheme(root: Element, archetype: SiteArchetype): void {
  const theme = ARCHETYPE_THEMES[archetype];
  const el = root as HTMLElement;
  el.setAttribute('data-showcase-archetype', archetype);
  el.setAttribute('data-showcase-theme', theme.mode);
  el.style.setProperty('--accent', theme.accent);
  el.style.setProperty('--bg', theme.bg);
  el.style.setProperty('--fg', theme.fg);
  el.style.setProperty('--muted', theme.muted);
  el.style.setProperty('--muted-fg', theme.mutedFg);
  el.style.setProperty('--border', theme.border);
  if (archetype === 'slack') {
    el.style.setProperty('--showcase-sidebar-bg', '#3F0E40');
    el.style.setProperty('--showcase-sidebar-fg', '#ffffff');
  }
}
