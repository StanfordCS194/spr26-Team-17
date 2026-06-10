'use client';

import type { Video } from '@showcase/shared';
import {
  slackAuthor,
  slackChannelLabel,
  slackIsThread,
  slackIsUnread,
  slackIsDm,
  slackUnreadCount,
} from '@/lib/slack/message';
import { Avatar } from '@/components/templates/Avatar';

export function SlackMessageRow({
  video,
  onOpen,
  showChannel = true,
}: {
  video: Video;
  onOpen: () => void;
  showChannel?: boolean;
}) {
  const author = slackAuthor(video);
  const channel = slackChannelLabel(video);
  const unread = slackIsUnread(video);
  const badge = slackUnreadCount(video);
  const isThread = slackIsThread(video);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group flex w-full gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-[#f8f8f8] ${
        unread ? 'bg-[#eef7fe]' : ''
      }`}
    >
      <Avatar name={author} src={video.thumbnail} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[15px] text-[#1d1c1d]">
            <span className={unread ? 'font-bold' : 'font-semibold'}>{author}</span>
            {showChannel && !slackIsDm(video) && (
              <span className="ml-2 text-[13px] font-normal text-[#616061]">in {channel}</span>
            )}
            {isThread && (
              <span className="ml-2 inline-flex items-center gap-1 text-[12px] font-normal text-[#1264a3]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                  <path d="M7.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-3.75a.75.75 0 0 0-1.5 0V16.5a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5v-9a1.5 1.5 0 0 1 1.5-1.5H12a.75.75 0 0 0 0-1.5H7.5z" />
                  <path d="M16.5 3a.75.75 0 0 0 0 1.5h2.19l-4.72 4.72a.75.75 0 1 0 1.06 1.06l4.72-4.72V8.25a.75.75 0 0 0 1.5 0V3.75A.75.75 0 0 0 20.25 3h-3.75z" />
                </svg>
                thread
              </span>
            )}
          </p>
          <span className="shrink-0 text-xs text-[#616061]">{video.duration}</span>
        </div>
        <p className={`mt-0.5 line-clamp-2 text-[14px] leading-snug ${unread ? 'font-medium text-[#1d1c1d]' : 'text-[#616061]'}`}>
          {video.title}
        </p>
        {badge > 0 && (
          <span className="mt-1.5 inline-flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-[#cd2553] px-1.5 text-[11px] font-bold text-white">
            {badge}
          </span>
        )}
      </div>
    </button>
  );
}
