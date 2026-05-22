'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePageStore } from '@/lib/store';
import type { Patch } from '@showcase/shared';

interface HoveredSection {
  id: string;
  type: string;
  element: Element;
}

interface SelectedSection {
  id: string;
  type: string;
  rect: DOMRect;
}

interface SectionLabel {
  id: string;
  type: string;
  rect: DOMRect;
}

function findSectionAncestor(target: EventTarget | null): { id: string; type: string; element: Element } | null {
  let el = target as Element | null;
  while (el && el !== document.body) {
    const id = el.getAttribute('data-section-id');
    const type = el.getAttribute('data-section-type');
    if (id && type) return { id, type, element: el };
    el = el.parentElement;
  }
  return null;
}

export function MagicPointerController() {
  const { magicPointerActive, setMagicPointerActive, pageSlug, dispatch } = usePageStore();
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<HoveredSection | null>(null);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [selected, setSelected] = useState<SelectedSection | null>(null);
  const [sectionLabels, setSectionLabels] = useState<SectionLabel[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusText, setStatusText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Refresh all section label positions
  const refreshLabels = useCallback(() => {
    const els = document.querySelectorAll('[data-section-id]');
    const labels: SectionLabel[] = [];
    els.forEach((el) => {
      const id = el.getAttribute('data-section-id');
      const type = el.getAttribute('data-section-type');
      if (id && type) labels.push({ id, type, rect: el.getBoundingClientRect() });
    });
    setSectionLabels(labels);
  }, []);

  // Update hover rect
  const updateHoverRect = useCallback(() => {
    if (hovered) setHoveredRect(hovered.element.getBoundingClientRect());
  }, [hovered]);

  // When magic pointer activates/deactivates
  useEffect(() => {
    if (!magicPointerActive) {
      setHovered(null);
      setHoveredRect(null);
      setSelected(null);
      setInput('');
      setStatusText('');
      setSectionLabels([]);
      document.body.style.cursor = '';
      return;
    }
    document.body.style.cursor = 'crosshair';
    refreshLabels();
    return () => { document.body.style.cursor = ''; };
  }, [magicPointerActive, refreshLabels]);

  // Mouse and click event delegation when active
  useEffect(() => {
    if (!magicPointerActive) return;

    function onMouseOver(e: MouseEvent) {
      const found = findSectionAncestor(e.target);
      if (!found) { setHovered(null); setHoveredRect(null); return; }
      setHovered(found);
      setHoveredRect(found.element.getBoundingClientRect());
    }

    function onClick(e: MouseEvent) {
      const found = findSectionAncestor(e.target);
      if (!found) { setSelected(null); return; }
      e.preventDefault();
      e.stopPropagation();
      const rect = found.element.getBoundingClientRect();
      setSelected({ id: found.id, type: found.type, rect });
      setInput('');
      setStatusText('');
    }

    function onScroll() {
      updateHoverRect();
      refreshLabels();
    }

    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('click', onClick, true);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', refreshLabels);

    return () => {
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', refreshLabels);
    };
  }, [magicPointerActive, updateHoverRect, refreshLabels]);

  // Escape dismisses popover
  useEffect(() => {
    if (!selected) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setSelected(null); setInput(''); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  // Focus input when popover opens
  useEffect(() => {
    if (selected) requestAnimationFrame(() => inputRef.current?.focus());
  }, [selected]);

  async function send() {
    if (!input.trim() || !selected || isSending) return;
    setIsSending(true);
    setStatusText('Thinking…');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageSlug,
          message: input.trim(),
          history: [],
          focusedSectionId: selected.id,
          focusedSectionType: selected.type,
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Server error ${res.status}: ${errText}`);
      }
      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let lineBuffer = '';
      let gotDone = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Accumulate across chunk boundaries before splitting — prevents losing events
        // when a TCP chunk cuts mid-line.
        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;

          type SseEvent = { kind: string; patch?: Patch; message?: string; name?: string };
          let ev: SseEvent;
          try { ev = JSON.parse(data) as SseEvent; } catch { continue; }

          if (ev.kind === 'tool_use') setStatusText(`Applying ${ev.name ?? 'change'}…`);
          if (ev.kind === 'patch' && ev.patch) dispatch(ev.patch);
          if (ev.kind === 'error') throw new Error(ev.message ?? 'Unknown server error');
          if (ev.kind === 'done') {
            gotDone = true;
            setStatusText('Done!');
            setTimeout(() => {
              setSelected(null);
              setInput('');
              setMagicPointerActive(false);
            }, 800);
          }
        }
      }

      if (!gotDone) setStatusText('No changes made.');
    } catch (err) {
      setStatusText(`Error: ${(err as Error).message}`);
    } finally {
      setIsSending(false);
    }
  }

  if (!mounted || !magicPointerActive) return null;

  function popoverStyle(rect: DOMRect): React.CSSProperties {
    const popW = 340;
    const popH = 130;
    let left = rect.right - popW;
    let top = rect.top + 8;
    if (left < 8) left = 8;
    if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
    if (top + popH > window.innerHeight - 8) top = rect.top - popH - 8;
    return { position: 'fixed', left, top, width: popW, zIndex: 9999 };
  }

  return createPortal(
    <>
      {/* All-section labels: shown as soon as magic pointer is active */}
      {sectionLabels.map((sl) => (
        <div
          key={sl.id}
          aria-hidden
          className="pointer-events-none"
          style={{
            position: 'fixed',
            left: sl.rect.left + 6,
            top: sl.rect.top + 6,
            zIndex: 9980,
          }}
        >
          <span
            className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)' }}
          >
            {sl.type}
          </span>
        </div>
      ))}

      {/* Hover highlight ring */}
      {hoveredRect && !selected && (
        <div
          aria-hidden
          className="pointer-events-none"
          style={{
            position: 'fixed',
            left: hoveredRect.left - 2,
            top: hoveredRect.top - 2,
            width: hoveredRect.width + 4,
            height: hoveredRect.height + 4,
            border: '2px solid var(--accent)',
            borderRadius: 6,
            background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
            zIndex: 9990,
            transition: 'left 60ms, top 60ms, width 60ms, height 60ms',
          }}
        >
          <span
            className="absolute right-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Edit {hovered?.type}
          </span>
        </div>
      )}

      {/* Edit popover */}
      {selected && (
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 9998 }}
            onClick={() => { setSelected(null); setInput(''); }}
          />
          <div
            className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg)] p-3 shadow-2xl"
            style={popoverStyle(selected.rect)}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-2 text-xs font-semibold text-[color:var(--muted-fg)] uppercase tracking-wide">
              Edit {selected.type}
            </p>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void send(); }}
                placeholder={`Change this ${selected.type}…`}
                disabled={isSending}
                className="flex-1 rounded-lg bg-[color:var(--muted)] px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[color:var(--accent)] disabled:opacity-50"
              />
              <button
                onClick={() => void send()}
                disabled={isSending || !input.trim()}
                className="rounded-lg bg-[color:var(--accent)] px-3 py-1.5 text-sm font-medium text-[color:var(--accent-fg)] disabled:opacity-50"
              >
                {isSending ? '…' : 'Go'}
              </button>
            </div>
            {statusText && (
              <p className="mt-1.5 text-xs text-[color:var(--muted-fg)]">{statusText}</p>
            )}
          </div>
        </>
      )}
    </>,
    document.body,
  );
}
