'use client';

import { useEffect, useState } from 'react';
import type { Video } from '@showcase/shared';
import type { SlackBootstrapMeta } from '@/lib/slack/client';
import {
  parseSlackReplies,
  slackAuthor,
  slackAvatarSrc,
  slackBodyText,
  slackChannelIdFromVideo,
  slackChannelLabel,
  slackIsThread,
  slackMessageTsFromVideo,
  isSlackApiChannelId,
  type SlackReply,
} from '@/lib/slack/message';
import { usePageStore } from '@/lib/store';
import { Avatar } from '@/components/templates/Avatar';
import { SlackChannelHeader } from './SlackChannelHeader';
import { SlackComposer } from './SlackComposer';
import { SlackMrkdwn } from './SlackMrkdwn';

export function SlackThreadView({
  currentVideo,
  watchingTitle,
}: {
  currentVideo: Video | undefined;
  suggestions: Video[];
  watchingId: string;
  watchingTitle: string | null;
}) {
  const { setWatching } = usePageStore();
  const title = watchingTitle || currentVideo?.title || 'Message';
  const author = currentVideo ? slackAuthor(currentVideo) : 'Member';
  const channel = currentVideo ? slackChannelLabel(currentVideo) : 'Slack';
  const isThread = currentVideo ? slackIsThread(currentVideo) : false;
  const body = currentVideo ? slackBodyText(currentVideo) : '';
  const mockReplies = currentVideo ? parseSlackReplies(currentVideo) : [];

  const [replies, setReplies] = useState<SlackReply[]>(mockReplies);
  const [loadingReplies, setLoadingReplies] = useState(false);

  useEffect(() => {
    if (!currentVideo) {
      setReplies([]);
      return;
    }

    const channelId = slackChannelIdFromVideo(currentVideo);
    const threadTs = slackMessageTsFromVideo(currentVideo);
    if (!channelId || !threadTs || !isSlackApiChannelId(channelId)) {
      setReplies(parseSlackReplies(currentVideo));
      return;
    }

    let cancelled = false;
    setLoadingReplies(true);
    fetch(
      `/api/slack/replies?channel=${encodeURIComponent(channelId)}&ts=${encodeURIComponent(threadTs)}`,
    )
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as { ok?: boolean; replies?: SlackReply[] };
      })
      .then((data) => {
        if (cancelled) return;
        if (data?.ok && Array.isArray(data.replies) && data.replies.length > 0) {
          setReplies(data.replies);
        } else {
          setReplies(parseSlackReplies(currentVideo));
        }
      })
      .catch(() => {
        if (!cancelled) setReplies(parseSlackReplies(currentVideo));
      })
      .finally(() => {
        if (!cancelled) setLoadingReplies(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentVideo]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <SlackChannelHeader
        channelName={isThread ? 'Thread' : channel}
        memberCount={isThread ? replies.length + 1 : 12}
        topic={isThread ? channel : undefined}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <article className="flex gap-2 pb-4">
          <Avatar
            name={author}
            src={slackAvatarSrc(currentVideo?.thumbnail)}
            size="lg"
            className="mt-0.5"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-[15px] font-bold text-[#1d1c1d]">{author}</span>
              <span className="text-xs text-[#616061]">{currentVideo?.duration ?? ''}</span>
            </div>
            <SlackMrkdwn text={title} className="mt-1" />
            {body && body !== title && <SlackMrkdwn text={body} className="mt-2 text-[#616061]" />}
          </div>
        </article>

        {(replies.length > 0 || loadingReplies) && (
          <section className="border-t border-[#e8e8e8] pt-4">
            <p className="mb-3 text-[13px] font-semibold text-[#1264a3]">
              {loadingReplies
                ? 'Loading replies…'
                : `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}
            </p>
            <div className="space-y-3">
              {replies.map((reply, i) => (
                <div key={`${reply.author}-${reply.time}-${i}`} className="flex gap-2">
                  <Avatar
                    name={reply.author}
                    src={slackAvatarSrc(reply.avatar)}
                    size="lg"
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[15px] font-bold text-[#1d1c1d]">{reply.author}</span>
                      <span className="text-xs text-[#616061]">{reply.time}</span>
                    </div>
                    <SlackMrkdwn text={reply.text} className="mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={() => setWatching(null)}
          className="mt-6 text-[13px] font-medium text-[#1264a3] hover:underline"
        >
          ← Back to {channel}
        </button>
      </div>

      <SlackComposer channelName={isThread ? `thread in ${channel}` : channel} />
    </div>
  );
}
