'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { pickRotatingChips, type RecommendedPrompt } from '@/lib/recommended-prompts';
import { getPageBridge } from '@/lib/page-bridge';
import { TOOL_VERBS, useChatStore, type ChatMessage } from '@/lib/chat-store';
import { SHOWCASE_SITES, siteByPath } from '@showcase/shared';

function fallbackAcknowledgment(toolUses: Array<{ name: string }>): string {
  if (toolUses.length === 0) return '';
  if (toolUses.length === 1) {
    const verb = TOOL_VERBS[toolUses[0]!.name] ?? 'made a change';
    return `Done — ${verb}.`;
  }
  const verbs = toolUses.map((t) => TOOL_VERBS[t.name] ?? 'updated something').slice(0, 3);
  return `Got it. ${verbs.join(', ')}.`;
}

const STORAGE_KEY = 'chatPanel:window:v2';
const DEFAULT_W = 420;
const DEFAULT_H = 620;
const MIN_W = 320;
const MIN_H = 200;
const MINIMIZED_H = 48;

type WindowState = { x: number; y: number; width: number; height: number };

function loadWindowState(): WindowState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WindowState;
    if (
      typeof parsed.x === 'number' &&
      typeof parsed.y === 'number' &&
      typeof parsed.width === 'number' &&
      typeof parsed.height === 'number'
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function defaultWindowState(): WindowState {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0, width: DEFAULT_W, height: DEFAULT_H };
  }
  return {
    x: Math.max(16, window.innerWidth - DEFAULT_W - 24),
    y: Math.max(16, window.innerHeight - DEFAULT_H - 24),
    width: DEFAULT_W,
    height: DEFAULT_H,
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function useActivePageSlug(): string {
  const pathname = usePathname() ?? '/';
  return siteByPath(pathname)?.slug ?? getPageBridge()?.pageSlug ?? 'youtube-clone';
}

export function ChatPanel() {
  const pathname = usePathname() ?? '/';
  const pageSlug = useActivePageSlug();
  const activeSiteId = SHOWCASE_SITES.find((s) => s.slug === pageSlug)?.id ?? 'youtube';
  const { messages, isStreaming, generatingCategory, send, resetSitePreferences, goToSite } =
    useChatStore();

  const [open, setOpen] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [windowState, setWindowState] = useState<WindowState | null>(null);
  const [dragging, setDragging] = useState(false);
  const [input, setInput] = useState('');
  const [chips, setChips] = useState<RecommendedPrompt[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const heightBeforeMinimize = useRef<number>(DEFAULT_H);

  useEffect(() => {
    setMounted(true);
    setChips(pickRotatingChips(Math.floor(Date.now() / 1000), 3));
    setWindowState(loadWindowState() ?? defaultWindowState());
  }, []);

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus();
  }, [open, minimized, pathname]);

  useEffect(() => {
    if (!windowState) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(windowState));
    } catch {
      /* ignore quota */
    }
  }, [windowState]);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const inField =
        tag === 'input' || tag === 'textarea' || (e.target as HTMLElement | null)?.isContentEditable;
      if (e.key === '/' && !inField && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
        setMinimized(false);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
      if (e.key === 'Escape' && open && !minimized) {
        setMinimized(true);
      }
    }
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [open, minimized]);

  function toggleMinimize() {
    if (!windowState) return;
    if (minimized) {
      setWindowState({ ...windowState, height: heightBeforeMinimize.current });
      setMinimized(false);
    } else {
      heightBeforeMinimize.current = windowState.height;
      setWindowState({ ...windowState, height: MINIMIZED_H });
      setMinimized(true);
    }
  }

  const onHeaderMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    setWindowState((current) => {
      if (!current) return current;
      const startWX = current.x;
      const startWY = current.y;
      function onMove(ev: MouseEvent) {
        setWindowState((s) => {
          if (!s) return s;
          const maxX = Math.max(0, window.innerWidth - s.width);
          const maxY = Math.max(0, window.innerHeight - s.height);
          return {
            ...s,
            x: clamp(startWX + (ev.clientX - startX), 0, maxX),
            y: clamp(startWY + (ev.clientY - startY), 0, maxY),
          };
        });
      }
      function onUp() {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        setDragging(false);
      }
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      setDragging(true);
      return current;
    });
  }, []);

  const onResizeMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (e.button !== 0 || minimized) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    setWindowState((current) => {
      if (!current) return current;
      const startW = current.width;
      const startH = current.height;
      const startWX = current.x;
      const startWY = current.y;
      function onMove(ev: MouseEvent) {
        setWindowState((s) => {
          if (!s) return s;
          const maxW = Math.max(MIN_W, window.innerWidth - startWX);
          const maxH = Math.max(MIN_H, window.innerHeight - startWY);
          return {
            ...s,
            width: clamp(startW + (ev.clientX - startX), MIN_W, maxW),
            height: clamp(startH + (ev.clientY - startY), MIN_H, maxH),
          };
        });
      }
      function onUp() {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      }
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return current;
    });
  }, [minimized]);

  if (!mounted) return null;

  if (!open) {
    return createPortal(
      <button
        onClick={() => {
          setOpen(true);
          setMinimized(false);
        }}
        className="fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 text-[color:var(--accent-fg)] shadow-lg hover:scale-105 transition"
      >
        <span aria-hidden>✨</span>
        <span className="font-medium">Personalize</span>
      </button>,
      document.body,
    );
  }

  if (!windowState) return null;

  const currentSiteLabel = SHOWCASE_SITES.find((s) => s.slug === pageSlug)?.label ?? 'Showcase';

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: 40,
        userSelect: dragging ? 'none' : undefined,
      }}
    >
      <aside className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] shadow-2xl">
        <header
          onMouseDown={onHeaderMouseDown}
          className={`flex shrink-0 items-center justify-between border-b border-[color:var(--border)] px-4 py-2 ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <div className="flex items-center gap-2 select-none">
            <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full bg-[color:var(--accent)] text-[10px] text-[color:var(--accent-fg)]">
              ✨
            </span>
            <div>
              <h2 className="text-sm font-medium leading-tight">Personalize</h2>
              {!minimized && (
                <p className="text-[11px] text-[color:var(--muted-fg)] leading-tight">
                  Editing <span className="font-medium text-[color:var(--fg)]">{currentSiteLabel}</span>
                  {' · '}
                  chat carries across sites
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMinimize}
              aria-label={minimized ? 'Expand' : 'Minimize'}
              className="rounded p-1 hover:bg-[color:var(--muted)]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                {minimized ? (
                  <path d="M6 14l6-6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                ) : (
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                )}
              </svg>
            </button>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded p-1 hover:bg-[color:var(--muted)]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </header>

        {!minimized && (
          <>
            <div
              className="flex shrink-0 gap-1 border-b border-[color:var(--border)] px-3 py-2"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {SHOWCASE_SITES.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => goToSite(site.id, pageSlug)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    activeSiteId === site.id
                      ? 'bg-[color:var(--accent)] text-[color:var(--accent-fg)]'
                      : 'bg-[color:var(--muted)] text-[color:var(--muted-fg)] hover:text-[color:var(--fg)]'
                  }`}
                  title={`Open ${site.label}`}
                >
                  {site.label}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="space-y-3 text-sm text-[color:var(--muted-fg)]">
                  <p>One conversation for all sites — switch anytime.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>&quot;Use a forest green dark theme&quot;</li>
                    <li>&quot;Open Amazon and make the grid compact&quot;</li>
                    <li>&quot;Switch to Instagram — show more photos&quot;</li>
                  </ul>
                </div>
              ) : (
                <ul className="space-y-3">
                  {messages.map((m, i) => (
                    <MessageBubble
                      key={i}
                      message={m}
                      isLast={i === messages.length - 1}
                      isStreaming={isStreaming}
                      onPickOption={(opt) => void send(opt, pageSlug)}
                    />
                  ))}
                  {isStreaming && (
                    <li>
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--muted)] px-3 py-2 text-sm text-[color:var(--muted-fg)]">
                        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--accent)]" />
                        Thinking…
                      </div>
                    </li>
                  )}
                  {generatingCategory && (
                    <li>
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--muted)] px-3 py-2 text-sm text-[color:var(--muted-fg)]">
                        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Fetching more videos in{' '}
                        <span className="font-medium">{generatingCategory.replace(/-/g, ' ')}</span>…
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>

            {messages.length < 3 && (
              <div className="flex shrink-0 flex-wrap gap-2 px-4 pb-2">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setInput(chip)}
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--muted)] px-3 py-1 text-xs hover:bg-[color:var(--border)]"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input, pageSlug);
                setInput('');
              }}
              className="shrink-0 border-t border-[color:var(--border)] p-3"
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell the page what you want…"
                  className="flex-1 rounded-full bg-[color:var(--muted)] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                  disabled={isStreaming}
                />
                <button
                  type="submit"
                  disabled={isStreaming || !input.trim()}
                  className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-[color:var(--accent-fg)] disabled:opacity-50"
                >
                  Send
                </button>
              </div>
              <button
                type="button"
                onClick={() => void resetSitePreferences(pageSlug)}
                disabled={isStreaming}
                className="mt-2 text-xs text-[color:var(--muted-fg)] hover:underline disabled:opacity-50"
              >
                Reset {currentSiteLabel} preferences
              </button>
            </form>
          </>
        )}
        {!minimized && (
          <div
            onMouseDown={onResizeMouseDown}
            aria-hidden
            className="absolute bottom-0 right-0 h-3.5 w-3.5 cursor-nwse-resize"
            style={{
              backgroundImage:
                'linear-gradient(135deg, transparent 0 50%, color-mix(in srgb, var(--border) 70%, transparent) 50% 60%, transparent 60% 75%, color-mix(in srgb, var(--border) 70%, transparent) 75% 85%, transparent 85% 100%)',
            }}
          />
        )}
      </aside>
    </div>,
    document.body,
  );
}

function MessageBubble({
  message: m,
  isLast,
  isStreaming,
  onPickOption,
}: {
  message: ChatMessage;
  isLast: boolean;
  isStreaming: boolean;
  onPickOption: (opt: string) => void;
}) {
  const showFallback =
    m.role === 'assistant' && (!m.content || !m.content.trim()) && (m.toolUses?.length ?? 0) > 0;
  const display = showFallback ? fallbackAcknowledgment(m.toolUses ?? []) : m.content;

  return (
    <li className={m.role === 'user' ? 'text-right' : ''}>
      {m.siteLabel && (
        <p
          className={`mb-1 text-[10px] uppercase tracking-wide text-[color:var(--muted-fg)] ${
            m.role === 'user' ? 'text-right' : 'text-left'
          }`}
        >
          {m.siteLabel}
        </p>
      )}
      <div
        className={`inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
          m.role === 'user'
            ? 'bg-[color:var(--accent)] text-[color:var(--accent-fg)]'
            : 'bg-[color:var(--muted)] text-[color:var(--fg)]'
        }`}
      >
        <p className="whitespace-pre-wrap">{display}</p>
        {m.role === 'assistant' && m.toolUses && m.toolUses.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {m.toolUses.map((t, j) => (
              <span
                key={j}
                className="inline-flex items-center gap-1 rounded-full bg-[color:var(--bg)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[color:var(--muted-fg)] border border-[color:var(--border)]"
                title={t.rationale ?? t.name}
              >
                <span className="h-1 w-1 rounded-full bg-[color:var(--accent)]" />
                {TOOL_VERBS[t.name] ?? t.name}
              </span>
            ))}
          </div>
        )}
        {m.role === 'assistant' && m.askOptions && m.askOptions.length > 0 && isLast && !isStreaming && (
          <div className="mt-3 flex flex-wrap gap-2">
            {m.askOptions.map((opt, j) => (
              <button
                key={j}
                onClick={() => onPickOption(opt)}
                className="rounded-full bg-[color:var(--bg)] px-3 py-1 text-xs text-[color:var(--fg)] border border-[color:var(--border)] hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-fg)] hover:border-[color:var(--accent)] transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
