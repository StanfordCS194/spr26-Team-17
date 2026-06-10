'use client';

import type { Video } from '@showcase/shared';
import {
  parseSlackReplies,
  slackAuthor,
  slackBodyText,
  slackIsThread,
} from '@/lib/slack/message';
import { Avatar } from '@/components/templates/Avatar';
import { SlackMrkdwn } from './SlackMrkdwn';

/** Single message in a Slack channel timeline (not inbox-style). */
export function SlackTimelineMessage({
  video,
  onOpen,
}: {
  video: Video;
  onOpen: () => void;
}) {
  const author = slackAuthor(video);
  const body = slackBodyText(video);
  const isThread = slackIsThread(video);
  const replies = parseSlackReplies(video);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group slack-timeline-msg flex w-full gap-2 px-5 py-1.5 text-left hover:bg-[#f8f8f8]"
    >
      <Avatar name={author} src={video.thumbnail} size="lg" className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1 pb-2">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <span className="text-[15px] font-bold text-[#1d1c1d]">{author}</span>
          <span className="text-xs text-[#616061] opacity-0 transition-opacity group-hover:opacity-100">
            {video.duration}
          </span>
        </div>
        <SlackMrkdwn text={video.title} />
        {body && body !== video.title && <SlackMrkdwn text={body} className="mt-1" />}
        {isThread && replies.length > 0 && (
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-[#1264a3]/30 bg-[#f0f7fc] px-2 py-1 text-[13px] font-medium text-[#1264a3]">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M7.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-3.75a.75.75 0 0 0-1.5 0V16.5a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5v-9a1.5 1.5 0 0 1 1.5-1.5H12a.75.75 0 0 0 0-1.5H7.5z" />
            </svg>
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </span>
        )}
      </div>
    </button>
  );
}
