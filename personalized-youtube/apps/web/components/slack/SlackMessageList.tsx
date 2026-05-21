'use client';

import { useState } from 'react';
import type { Video } from '@showcase/shared';
import {
  parseSlackReplies,
  slackAuthor,
  slackAvatarSrc,
  slackBodyText,
  slackDateDividerLabel,
  slackDateKeyFromVideo,
  slackIsThread,
  slackMessageTimeLabel,
  slackMessagesInSameGroup,
} from '@/lib/slack/message';
import { Avatar } from '@/components/templates/Avatar';
import { SlackMrkdwn } from './SlackMrkdwn';

type DateDivider = { kind: 'date'; label: string };
type MessageGroup = {
  kind: 'group';
  author: string;
  avatar: string;
  timestamp: string;
  messages: Video[];
};

function groupMessages(videos: Video[]): Array<DateDivider | MessageGroup> {
  const out: Array<DateDivider | MessageGroup> = [];
  let lastDayKey = '';

  for (const video of videos) {
    const dayKey = slackDateKeyFromVideo(video);
    if (dayKey !== lastDayKey) {
      out.push({ kind: 'date', label: slackDateDividerLabel(video) });
      lastDayKey = dayKey;
    }

    const author = slackAuthor(video);
    const last = out[out.length - 1];
    const prevMsg = last?.kind === 'group' ? last.messages[last.messages.length - 1] : null;

    if (
      last?.kind === 'group' &&
      prevMsg &&
      slackMessagesInSameGroup(prevMsg, video)
    ) {
      last.messages.push(video);
    } else {
      out.push({
        kind: 'group',
        author,
        avatar: video.thumbnail,
        timestamp: slackMessageTimeLabel(video),
        messages: [video],
      });
    }
  }

  return out;
}

export function SlackMessageList({
  videos,
  onOpen,
}: {
  videos: Video[];
  onOpen: (video: Video) => void;
}) {
  const groups = groupMessages(videos);

  return (
    <div className="slack-message-list min-w-0 max-w-full overflow-x-hidden pb-4">
      {groups.map((item, i) =>
        item.kind === 'date' ? (
          <div key={`date-${item.label}-${i}`} className="slack-date-divider" role="separator">
            <span>{item.label}</span>
          </div>
        ) : (
          <MessageGroupRow key={`${item.author}-${item.timestamp}-${i}`} group={item} onOpen={onOpen} />
        ),
      )}
    </div>
  );
}

function MessageGroupRow({
  group,
  onOpen,
}: {
  group: MessageGroup;
  onOpen: (video: Video) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="slack-message-group group/msg relative min-w-0 max-w-full px-5 py-0.5 hover:bg-[#f8f8f8]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div className="slack-message-toolbar" aria-hidden>
          <ToolbarBtn label="Add reaction">
            <span className="text-base leading-none">😊</span>
          </ToolbarBtn>
          <ToolbarBtn label="Reply in thread">
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden>
              <path d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6A1.5 1.5 0 0 1 12 3.5V5h2.5A1.5 1.5 0 0 1 16 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 7 14.5V13H4.5A1.5 1.5 0 0 1 3 11.5v-8z" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Share message">
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.5]" aria-hidden>
              <path d="M14 3h3v3M10 10l7-7M6 17H3v-3" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="Save for later">
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current stroke-[1.5]" aria-hidden>
              <path d="M5 3h10v14l-5-3-5 3V3z" />
            </svg>
          </ToolbarBtn>
          <ToolbarBtn label="More actions">⋯</ToolbarBtn>
        </div>
      )}

      <div className="flex gap-2">
        <div className="mt-0.5 w-9 shrink-0">
          <Avatar name={group.author} src={slackAvatarSrc(group.avatar)} size="lg" />
        </div>
        <div className="min-w-0 flex-1 pb-1 pt-0.5">
          <div className="mb-0.5 flex items-baseline gap-2 leading-none">
            <span className="text-[15px] font-bold text-[#1d1c1d]">{group.author}</span>
            <span className="text-xs text-[#616061]">{group.timestamp}</span>
          </div>

          {group.messages.map((video, idx) => (
            <div key={video.id} className={`group/line relative ${idx > 0 ? 'slack-msg-compact' : ''}`}>
              {idx > 0 && (
                <span className="slack-msg-compact-time" aria-hidden>
                  {slackMessageTimeLabel(video)}
                </span>
              )}
              <MessageLines video={video} compact={idx > 0} onOpen={() => onOpen(video)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageLines({
  video,
  compact,
  onOpen,
}: {
  video: Video;
  compact: boolean;
  onOpen: () => void;
}) {
  const body = slackBodyText(video);
  const isThread = slackIsThread(video);
  const replies = parseSlackReplies(video);
  const replyCount = replies.length || (video.views > 0 ? video.views : 0);
  const text = body || video.title;

  return (
    <div className={compact ? 'mt-0.5 min-w-0' : 'min-w-0'}>
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
          }
        }}
        className="block w-full min-w-0 max-w-full cursor-pointer text-left"
      >
        <SlackMrkdwn text={text} />
      </div>

      {isThread && replyCount > 0 && (
        <button
          type="button"
          onClick={onOpen}
          className="slack-thread-pill mt-1"
        >
          <span className="flex -space-x-1">
            {replies.slice(0, 3).map((r, i) => (
              <Avatar
                key={`${r.author}-${i}`}
                name={r.author}
                src={slackAvatarSrc(r.avatar)}
                size="xs"
                className="ring-2 ring-white"
              />
            ))}
          </span>
          <span className="font-bold text-[#1264a3]">
            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </span>
          {replies.length > 0 && replies[replies.length - 1]?.time && (
            <span className="text-[#616061]">Last reply {replies[replies.length - 1]!.time}</span>
          )}
        </button>
      )}
    </div>
  );
}

function ToolbarBtn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="grid h-7 min-w-[1.75rem] place-items-center rounded px-1 text-[#1d1c1d] hover:bg-[#f0f0f0]"
    >
      {children}
    </button>
  );
}
