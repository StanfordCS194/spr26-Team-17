'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { SHOWCASE_SITES, type PageConfig, type Patch, type ShowcaseSiteId, type Video } from '@showcase/shared';
import { getPageBridge } from '@/lib/page-bridge';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  siteSlug?: string;
  siteLabel?: string;
  toolUses?: Array<{ name: string; rationale?: string }>;
  askOptions?: string[];
}

interface ChatStoreValue {
  messages: ChatMessage[];
  isStreaming: boolean;
  generatingCategory: string | null;
  send: (text: string, pageSlug: string) => Promise<void>;
  resetSitePreferences: (pageSlug: string) => Promise<void>;
  goToSite: (siteId: ShowcaseSiteId, currentSlug: string) => void;
}

const ChatStoreContext = createContext<ChatStoreValue | null>(null);

const TOOL_VERBS: Record<string, string> = {
  update_theme: 'tweaked the look',
  update_section: 'updated a section',
  set_filter: 'filtered the feed',
  set_sort: 'changed sort order',
  add_section: 'added a section',
  remove_section: 'hid a section',
  reorder_sections: 'reordered the page',
  request_more_content: 'pulling fresh videos',
  ask_user: 'has a quick question',
  switch_site: 'switching site',
};

function siteMeta(slug: string): { siteSlug: string; siteLabel: string } {
  const site = SHOWCASE_SITES.find((s) => s.slug === slug);
  return { siteSlug: slug, siteLabel: site?.label ?? slug };
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatingCategory, setGeneratingCategory] = useState<string | null>(null);
  const historyLoaded = useRef(false);

  useEffect(() => {
    if (historyLoaded.current) return;
    historyLoaded.current = true;
    fetch('/api/chat/history?scope=session')
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((d: { messages?: ChatMessage[] }) => {
        if (Array.isArray(d.messages) && d.messages.length > 0) setMessages(d.messages);
      })
      .catch(() => {});
  }, []);

  const fetchMoreContent = useCallback(
    async (input: { category: string; count?: number; style?: string }, pageSlug: string) => {
      const bridge = getPageBridge();
      if (!bridge || bridge.pageSlug !== pageSlug) return;

      setGeneratingCategory(input.category);
      try {
        const res = await fetch('/api/generate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: pageSlug, ...input }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { videos?: Video[] };
        const newVideos = data.videos ?? [];
        if (newVideos.length === 0) return;

        const grid = bridge.config.sections.find((s) => s.type === 'VideoGrid');
        if (!grid) return;
        const currentVideos = (grid.props as { videos?: Video[] }).videos ?? [];
        bridge.dispatch({
          op: 'update_section',
          sectionId: grid.id,
          patch: { videos: [...currentVideos, ...newVideos] },
        });
      } catch {
        /* best-effort */
      } finally {
        setGeneratingCategory(null);
      }
    },
    [],
  );

  const send = useCallback(
    async (text: string, pageSlug: string) => {
      if (!text.trim() || isStreaming) return;

      const meta = siteMeta(pageSlug);
      const prior = messages;
      const next: ChatMessage[] = [...prior, { role: 'user', content: text, ...meta }];
      setMessages(next);
      setIsStreaming(true);

      const bridge = getPageBridge();
      let watchingThumbnail: string | null = null;
      let watchingChannel: string | null = null;
      const watchingId = bridge?.watchingId ?? null;
      const watchingTitle = bridge?.watchingTitle ?? null;
      const config = bridge?.config;

      if (watchingId && config) {
        for (const s of config.sections) {
          const props = s.props as {
            videos?: Video[];
            shorts?: Array<{ id: string; thumbnail: string; channel?: { name?: string } }>;
          };
          const fromVideos = props.videos?.find((v) => v.id === watchingId);
          if (fromVideos) {
            watchingThumbnail = fromVideos.thumbnail || watchingThumbnail;
            watchingChannel = fromVideos.channel?.name || watchingChannel;
            if (watchingThumbnail) break;
          }
          const fromShorts = props.shorts?.find((sh) => sh.id === watchingId);
          if (fromShorts) {
            watchingThumbnail = fromShorts.thumbnail || watchingThumbnail;
            watchingChannel = fromShorts.channel?.name || watchingChannel;
            if (watchingThumbnail) break;
          }
        }
      }

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageSlug,
            message: text,
            history: prior.map(({ role, content }) => ({ role, content })),
            watching: watchingId
              ? {
                  id: watchingId,
                  title: watchingTitle ?? '',
                  thumbnail: watchingThumbnail,
                  channel: watchingChannel,
                }
              : null,
          }),
        });
        if (!res.body) throw new Error('No response stream');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';
        const toolUses: ChatMessage['toolUses'] = [];
        let askOptions: string[] | undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const ev = JSON.parse(data);
              if (ev.kind === 'text') assistantContent += ev.text;
              if (ev.kind === 'tool_use') toolUses.push({ name: ev.name, rationale: ev.rationale });
              if (ev.kind === 'patch') {
                const bridge = getPageBridge();
                if (bridge) {
                  bridge.dispatch(ev.patch as Patch, { persist: true, trace: true });
                } else {
                  console.warn('[chat] patch dropped — no page bridge registered', ev.patch);
                }
              }
              if (ev.kind === 'request_more_content') void fetchMoreContent(ev.input, pageSlug);
              if (ev.kind === 'switch_site' && typeof ev.path === 'string') router.push(ev.path);
              if (ev.kind === 'ask_user') {
                const q = typeof ev.input?.question === 'string' ? ev.input.question : '';
                if (q) assistantContent += (assistantContent ? '\n\n' : '') + q;
                if (Array.isArray(ev.input?.options)) askOptions = ev.input.options as string[];
              }
            } catch {
              /* ignore malformed line */
            }
          }
        }

        setMessages([
          ...next,
          { role: 'assistant', content: assistantContent, toolUses, askOptions, ...meta },
        ]);

        // Reconcile with server-rendered config (preferences applied in DB).
        const bridge = getPageBridge();
        if (bridge && bridge.pageSlug === pageSlug) {
          try {
            const pageRes = await fetch(`/api/page?slug=${encodeURIComponent(pageSlug)}`);
            if (pageRes.ok) {
              const data = (await pageRes.json()) as { config?: PageConfig };
              if (data.config) bridge.replace(data.config);
            }
          } catch {
            /* optimistic patches already applied */
          }
        }
      } catch (err) {
        setMessages([
          ...next,
          { role: 'assistant', content: `Error: ${(err as Error).message}`, ...meta },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [fetchMoreContent, isStreaming, messages, router],
  );

  const resetSitePreferences = useCallback(async (pageSlug: string) => {
    const bridge = getPageBridge();
    if (!bridge) return;
    setIsStreaming(true);
    try {
      await fetch(`/api/reset?slug=${encodeURIComponent(pageSlug)}`, { method: 'POST' });
      const res = await fetch(`/api/page?slug=${encodeURIComponent(pageSlug)}`);
      const data = await res.json();
      if (data.config) bridge.replace(data.config);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const goToSite = useCallback(
    (siteId: ShowcaseSiteId, currentSlug: string) => {
      const target = SHOWCASE_SITES.find((s) => s.id === siteId);
      if (!target || target.slug === currentSlug) return;
      router.push(target.path);
    },
    [router],
  );

  return (
    <ChatStoreContext.Provider
      value={{ messages, isStreaming, generatingCategory, send, resetSitePreferences, goToSite }}
    >
      {children}
    </ChatStoreContext.Provider>
  );
}

export function useChatStore(): ChatStoreValue {
  const value = useContext(ChatStoreContext);
  if (!value) throw new Error('useChatStore must be used within ChatProvider');
  return value;
}

export { TOOL_VERBS };
