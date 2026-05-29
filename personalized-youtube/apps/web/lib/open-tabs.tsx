'use client';

import { useEffect, useState } from 'react';

// Client-side registry of dynamically-opened site tabs. These are the tabs a
// visitor creates by asking the chat to "open <url>". They live in
// localStorage (per browser) and sit alongside the built-in SHOWCASE_SITES in
// the chat's tab bar. Persisting preferences server-side would need a DB row;
// for now these tabs are session/browser-scoped, which is enough to switch
// between them and personalize live.

export interface OpenTab {
  slug: string;
  label: string;
  url: string;
  path: string;
}

const STORAGE_KEY = 'showcase:openTabs:v1';
const CHANGE_EVENT = 'showcase:openTabs:changed';
const MAX_TABS = 8;

function read(): OpenTab[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is OpenTab =>
        t &&
        typeof t.slug === 'string' &&
        typeof t.label === 'string' &&
        typeof t.url === 'string' &&
        typeof t.path === 'string',
    );
  } catch {
    return [];
  }
}

function write(tabs: OpenTab[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  } catch {
    /* ignore quota */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getOpenTabs(): OpenTab[] {
  return read();
}

export function addOpenTab(tab: OpenTab): void {
  const tabs = read().filter((t) => t.slug !== tab.slug);
  tabs.push(tab);
  write(tabs.slice(-MAX_TABS));
}

export function removeOpenTab(slug: string): void {
  write(read().filter((t) => t.slug !== slug));
}

export function useOpenTabs(): OpenTab[] {
  const [tabs, setTabs] = useState<OpenTab[]>([]);
  useEffect(() => {
    const sync = () => setTabs(read());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return tabs;
}
