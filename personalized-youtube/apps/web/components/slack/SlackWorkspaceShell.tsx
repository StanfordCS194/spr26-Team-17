'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PageConfig, Video } from '@showcase/shared';
import {
  filterVideosForSlackChannel,
  filterVideosForSlackSearch,
  isSlackApiChannelId,
  SLACK_CATALOG,
  SLACK_CHANNEL_TOPICS,
  SLACK_DEFAULT_CHANNEL,
  SLACK_SIDEBAR_CHANNELS,
  SLACK_SIDEBAR_DMS,
  SLACK_WORKSPACE_NAME,
} from '@/lib/slack/message';
import type { SlackBootstrapMeta } from '@/lib/slack/client';
import { applyBrandSearch, applyVideosToGrid } from '@/lib/feed-interaction';
import { usePageStore } from '@/lib/store';
import { Avatar } from '@/components/templates/Avatar';
import { SlackChannelHeader } from './SlackChannelHeader';
import { SlackComposer } from './SlackComposer';
import { SlackMessageList } from './SlackMessageList';
import { SlackThreadView } from './SlackThreadView';

function videosFromConfig(config: PageConfig): Video[] {
  const grid = config.sections.find((s) => s.type === 'VideoGrid');
  if (grid && grid.type === 'VideoGrid') return grid.props.videos;
  return SLACK_CATALOG.slice(0, 24);
}

function channelIdForLabel(
  label: string,
  channels: { id: string; label: string }[],
  dms: { id: string; label: string }[],
): string | null {
  const hit = [...channels, ...dms].find((c) => c.label === label);
  return hit?.id ?? null;
}

export function SlackWorkspaceShell({ config }: { config: PageConfig }) {
  const {
    selectedChannel,
    searchQuery,
    setActiveNav,
    setWatching,
    enterSearch,
    exitSearch,
    watchingId,
    watchingTitle,
    slackMeta,
    dispatch,
    ytContinuation,
    setYtContinuation,
  } = usePageStore();

  const [sidebarQuery, setSidebarQuery] = useState('');
  const [liveVideos, setLiveVideos] = useState<Video[] | null>(null);
  const [loadingChannel, setLoadingChannel] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [clientMeta, setClientMeta] = useState<SlackBootstrapMeta | null>(slackMeta);
  const [interceptLive, setInterceptLive] = useState<boolean>(Boolean(slackMeta));
  const [loadingMore, setLoadingMore] = useState(false);
  const paneRef = useRef<HTMLDivElement>(null);

  const workspaceName = clientMeta?.workspaceName ?? SLACK_WORKSPACE_NAME;
  const sidebarChannels = clientMeta?.channels ?? SLACK_SIDEBAR_CHANNELS.map((c) => ({ ...c }));
  const sidebarDms = clientMeta?.dms ?? SLACK_SIDEBAR_DMS.map((d) => ({ ...d }));
  const defaultChannel = clientMeta?.defaultChannelLabel ?? SLACK_DEFAULT_CHANNEL;

  const catalog = liveVideos ?? videosFromConfig(config);
  const activeChannel = selectedChannel ?? defaultChannel;

  const messages = useMemo(() => {
    let list = catalog;
    if (activeChannel === 'Threads') {
      list = list.filter((v) => v.tags.includes('thread'));
    } else if (liveVideos === null) {
      list = filterVideosForSlackChannel(list, activeChannel);
    }
    if (searchQuery) list = filterVideosForSlackSearch(list, searchQuery);
    if (sidebarQuery.trim()) list = filterVideosForSlackSearch(list, sidebarQuery);
    return list;
  }, [catalog, activeChannel, searchQuery, sidebarQuery, liveVideos]);

  const currentVideo = watchingId ? catalog.find((v) => v.id === watchingId) : undefined;
  const suggestions = catalog.filter((v) => v.id !== watchingId).slice(0, 6);

  const loadLiveChannel = useCallback(async (label: string) => {
    const channelId = channelIdForLabel(label, sidebarChannels, sidebarDms);
    if (!channelId) {
      setLiveVideos(null);
      return;
    }
    setLoadingChannel(true);
    try {
      const res = await fetch(`/api/slack/history?channel=${encodeURIComponent(channelId)}`);
      if (!res.ok) {
        setLiveVideos(null);
        return;
      }
      const data = (await res.json()) as { ok?: boolean; videos?: Video[]; continuation?: string | null };
      if (data.ok && Array.isArray(data.videos)) {
        setLiveVideos(data.videos);
        applyVideosToGrid(dispatch, config, data.videos, 2);
        setYtContinuation(
          typeof data.continuation === 'string' && data.continuation.length > 0 ? data.continuation : null,
        );
      }
    } finally {
      setLoadingChannel(false);
    }
  }, [sidebarChannels, sidebarDms, dispatch, config, setYtContinuation]);

  const loadMoreMessages = useCallback(async () => {
    if (!ytContinuation || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/slack/more?token=${encodeURIComponent(ytContinuation)}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        ok?: boolean;
        videos?: Video[];
        continuation?: string | null;
      };
      if (!data.ok || !Array.isArray(data.videos) || data.videos.length === 0) return;

      setLiveVideos((prev) => {
        const base = prev ?? videosFromConfig(config);
        const seen = new Set(base.map((v) => v.id));
        const merged = [...base, ...data.videos!.filter((v) => !seen.has(v.id))];
        applyVideosToGrid(dispatch, config, merged, 2);
        return merged;
      });
      setYtContinuation(
        typeof data.continuation === 'string' && data.continuation.length > 0 ? data.continuation : null,
      );
    } finally {
      setLoadingMore(false);
    }
  }, [ytContinuation, loadingMore, config, dispatch, setYtContinuation]);

  useEffect(() => {
    const el = paneRef.current;
    if (!el || !ytContinuation) return;

    function onScroll() {
      if (loadingMore || loadingChannel) return;
      const nearBottom = el!.scrollHeight - el!.scrollTop - el!.clientHeight < 160;
      if (nearBottom) void loadMoreMessages();
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [ytContinuation, loadingMore, loadingChannel, loadMoreMessages]);

  useEffect(() => {
    if (slackMeta) {
      setClientMeta(slackMeta);
      setInterceptLive(true);
      return;
    }
    fetch('/api/slack/bootstrap')
      .then(async (res) => {
        if (!res.ok) {
          setInterceptLive(false);
          return null;
        }
        return (await res.json()) as { ok?: boolean; meta?: SlackBootstrapMeta };
      })
      .then((data) => {
        if (data?.ok && data.meta) {
          setClientMeta(data.meta);
          setInterceptLive(true);
        } else {
          setInterceptLive(false);
        }
      })
      .catch(() => setInterceptLive(false));
  }, [slackMeta]);

  useEffect(() => {
    if (!selectedChannel) {
      setActiveNav('Home', defaultChannel);
    }
  }, [selectedChannel, setActiveNav, defaultChannel]);

  async function selectChannel(name: string) {
    setWatching(null);
    exitSearch();
    setSidebarQuery('');
    setMobileSidebarOpen(false);
    setActiveNav('Home', name);

    const channelId = channelIdForLabel(name, sidebarChannels, sidebarDms);
    if (name !== 'Threads' && channelId && isSlackApiChannelId(channelId)) {
      await loadLiveChannel(name);
      return;
    }
    setLiveVideos(null);
  }

  async function runSidebarSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) {
      exitSearch();
      return;
    }
    setLoadingChannel(true);
    const ok = await applyBrandSearch({
      brand: 'slack',
      query: trimmed,
      config,
      ytContinuation,
      dispatch,
      enterSearch,
      setYtContinuation,
      hideRows: false,
    });
    setLoadingChannel(false);
    if (ok) {
      setLiveVideos(null);
      setMobileSidebarOpen(false);
      return;
    }
    enterSearch(trimmed, { config, ytContinuation: null });
  }

  const headerName = searchQuery ? `Search: “${searchQuery}”` : activeChannel;
  const topic =
    searchQuery
      ? `${messages.length} results`
      : activeChannel.startsWith('#')
        ? SLACK_CHANNEL_TOPICS[activeChannel] ?? null
        : null;
  const isDm = !activeChannel.startsWith('#') && activeChannel !== 'Threads' && !searchQuery;

  const sidebar = (
    <>
      <div className="px-3 pt-3 pb-2">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/10"
        >
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-[#611f69] text-xs font-bold text-white">
            {workspaceName.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-white">{workspaceName}</span>
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/70" aria-hidden>
            <path fill="currentColor" d="M7 10l5 5 5-5H7z" />
          </svg>
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-md border border-white/20 bg-[#491f4e] px-2 py-1.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/70" aria-hidden>
            <path fill="currentColor" d="M10 4a6 6 0 1 0 3.7 10.7l5.3 5.3 1.4-1.4-5.3-5.3A6 6 0 0 0 10 4zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
          </svg>
          <input
            type="search"
            value={sidebarQuery}
            onChange={(e) => setSidebarQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void runSidebarSearch(sidebarQuery);
            }}
            placeholder={`Search ${workspaceName}`}
            className="min-w-0 flex-1 bg-transparent text-[13px] text-white placeholder:text-white/50 outline-none"
          />
        </div>
      </div>

      <div className="flex gap-1 px-3 pb-2">
        <QuickNavBtn label="Threads" active={activeChannel === 'Threads'} onClick={() => void selectChannel('Threads')} />
        <QuickNavBtn label="Huddles" />
        <QuickNavBtn label="Drafts" />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4 text-[15px]">
        <SectionLabel>Channels</SectionLabel>
        {sidebarChannels.map((ch) => (
          <SidebarNavItem
            key={ch.id}
            label={ch.label.replace(/^#\s*/, '')}
            prefix="#"
            unread={ch.unread}
            active={activeChannel === ch.label}
            onClick={() => void selectChannel(ch.label)}
          />
        ))}
        <button type="button" className="slack-sidebar-add flex w-full items-center gap-2 rounded-md px-3 py-1 text-white/70 hover:bg-white/10">
          <span className="text-lg leading-none">+</span>
          <span>Add channels</span>
        </button>

        <SectionLabel>Direct messages</SectionLabel>
        {sidebarDms.map((dm) => (
          <SidebarNavItem
            key={dm.id}
            label={dm.label}
            unread={dm.unread}
            active={activeChannel === dm.label}
            onClick={() => void selectChannel(dm.label)}
            avatar={dm.label}
          />
        ))}
        <button type="button" className="slack-sidebar-add flex w-full items-center gap-2 rounded-md px-3 py-1 text-white/70 hover:bg-white/10">
          <span className="text-lg leading-none">+</span>
          <span>Invite people</span>
        </button>
      </nav>
    </>
  );

  return (
    <div className="slack-shell flex min-h-0 flex-1">
      {/* Workspace rail — Slack desktop left strip */}
      <aside className="slack-workspace-rail hidden w-[70px] shrink-0 flex-col items-center border-r border-[#522653] py-3 md:flex">
        <button
          type="button"
          className="flex h-[36px] w-[36px] items-center justify-center rounded-lg bg-[#611f69] text-sm font-bold text-white shadow-sm"
          aria-label={workspaceName}
        >
          {workspaceName.slice(0, 1).toUpperCase()}
        </button>
        <button
          type="button"
          className="mt-3 flex h-[36px] w-[36px] items-center justify-center rounded-lg border border-white/25 text-xl text-white/80 hover:border-white/50"
          aria-label="Add workspace"
        >
          +
        </button>
        <div className="mt-auto flex flex-col items-center gap-3 pb-2">
          <button type="button" className="text-white/70 hover:text-white" aria-label="Notifications">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          </button>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#611f69] text-xs font-bold text-white">
            A
          </span>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="slack-sidebar hidden w-[260px] shrink-0 flex-col border-r border-[#522653] md:flex">
        {sidebar}
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close sidebar"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="slack-sidebar absolute inset-y-0 left-0 flex w-[min(280px,85vw)] flex-col shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        {watchingId && currentVideo ? (
          <SlackThreadView
            currentVideo={currentVideo}
            suggestions={suggestions}
            watchingId={watchingId}
            watchingTitle={watchingTitle}
          />
        ) : (
          <>
            <SlackChannelHeader
              channelName={headerName}
              memberCount={isDm ? 2 : 12}
              topic={topic}
              onMenuClick={() => setMobileSidebarOpen(true)}
            />

            {!interceptLive && (
              <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-2 text-[13px] text-amber-950">
                Showing mock data — connect your Slack account for full channels and messages. Run{' '}
                <code className="rounded bg-amber-100 px-1">pnpm slack:setup</code> (log in at app.slack.com in Chrome Profile 1, add{' '}
                <code className="rounded bg-amber-100 px-1">SLACK_XOXC</code> to .env).
              </div>
            )}

            <div ref={paneRef} className="slack-message-pane min-h-0 flex-1 overflow-y-auto">
              {loadingChannel ? (
                <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
                  <p className="text-[15px] font-medium text-[#1d1c1d]">Loading messages…</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
                  <p className="text-[15px] font-medium text-[#1d1c1d]">No messages here yet.</p>
                  <p className="mt-1 text-sm text-[#616061]">Pick another channel or clear search.</p>
                </div>
              ) : (
                <SlackMessageList
                  videos={messages}
                  onOpen={(v) => setWatching(v.id, v.title, { thumbnail: v.thumbnail })}
                />
              )}
              {loadingMore && (
                <p className="py-4 text-center text-sm text-[#616061]">Loading older messages…</p>
              )}
            </div>

            <SlackComposer channelName={activeChannel} />
          </>
        )}
      </div>
    </div>
  );
}

function QuickNavBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md px-2 py-1.5 text-center text-[11px] font-medium ${
        active ? 'bg-[#1164a3] text-white' : 'bg-white/10 text-white/80 hover:bg-white/15'
      }`}
    >
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-0.5 mt-3 flex items-center justify-between px-3 text-[13px] font-medium text-white/70">
      <span>{children}</span>
      <span className="text-white/50">▼</span>
    </p>
  );
}

function SidebarNavItem({
  label,
  prefix,
  unread,
  active,
  onClick,
  avatar,
}: {
  label: string;
  prefix?: string;
  unread?: number;
  active: boolean;
  onClick: () => void;
  avatar?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex w-full items-center gap-2 rounded-md px-3 py-[3px] text-left transition-colors ${
        active ? 'bg-[#1164a3] text-white' : 'text-white/90 hover:bg-[#350d36]/80'
      }`}
    >
      {avatar ? (
        <Avatar name={avatar} size="xs" />
      ) : (
        prefix && <span className="w-4 shrink-0 text-center text-[15px] text-white/50">{prefix}</span>
      )}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {unread != null && unread > 0 && (
        <span className="rounded-full bg-white px-1.5 text-[11px] font-bold text-[#350d36]">{unread}</span>
      )}
    </button>
  );
}
