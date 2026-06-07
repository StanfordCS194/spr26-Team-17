import type { PageConfig } from '@showcase/shared';

export interface ChangeReceipt {
  id: string;
  label: string;
  patchCount: number;
}

export interface ChangeHistoryEntry {
  id: string;
  label: string;
  patchCount: number;
  before: PageConfig;
  after: PageConfig;
}

export interface ChangeHistoryState {
  past: ChangeHistoryEntry[];
  future: ChangeHistoryEntry[];
}

export const EMPTY_CHANGE_HISTORY: ChangeHistoryState = { past: [], future: [] };

export function commitHistory(
  history: ChangeHistoryState,
  entry: ChangeHistoryEntry,
): ChangeHistoryState {
  return { past: [...history.past, entry], future: [] };
}

export function undoHistory(
  history: ChangeHistoryState,
  expectedId?: string,
): { history: ChangeHistoryState; config: PageConfig | null } {
  const entry = history.past.at(-1);
  if (!entry || (expectedId && entry.id !== expectedId)) {
    return { history, config: null };
  }
  return {
    history: {
      past: history.past.slice(0, -1),
      future: [...history.future, entry],
    },
    config: entry.before,
  };
}

export function redoHistory(
  history: ChangeHistoryState,
  expectedId?: string,
): { history: ChangeHistoryState; config: PageConfig | null } {
  const entry = history.future.at(-1);
  if (!entry || (expectedId && entry.id !== expectedId)) {
    return { history, config: null };
  }
  return {
    history: {
      past: [...history.past, entry],
      future: history.future.slice(0, -1),
    },
    config: entry.after,
  };
}
