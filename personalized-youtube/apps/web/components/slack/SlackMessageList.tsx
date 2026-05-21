'use client';

import { useState } from 'react';
import type { Video } from '@showcase/shared';
import {
  parseSlackReplies,
  slackAuthor,
  slackAvatarSrc,
  slackBodyText,
  slackIsThread,
} from '@/lib/slack/message';
import { Avatar } from '@/components/templates/Avatar';

type DateDivider = { kind: 'date'; label: string };
type MessageGroup = {
  kind: 'group';
  author: string;
  avatar: string;
  timestamp: string;
  messages: Video[];
};

function dayBucket(video: Video): string {
  const d = video.duration.trim();
  if (/^\d{1,2}:\d{2}\s*[AP]M$/i.test(d)) return 'Today';
  if (d === 'Yesterday') return 'Yesterday';
  if (d) return d;
  return 'Earlier';
}

function groupMessages(videos: Video[]): Array<DateDivider | MessageGroup> {
  const out: Array<DateDivider | MessageGroup> = [];
  let lastDay = '';

  for (const video of videos) {
    const day = dayBucket(video);
    if (day !== lastDay) {
      out.push({ kind: 'date', label: day });
      lastDay = day;
    }

    const author = slackAuthor(video);
    const last = out[out.length - 1];
    if (last?.kind === 'group' && last.author === author && dayBucket(video) === lastDay) {
      last.messages.push(video);
    } else {
      out.push({
        kind: 'group',
        author,
        avatar: video.thumbnail,
        timestamp: video.duration,
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
    <div className="slack-message-list">
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
      className="slack-message-group group/msg relative px-5 py-0.5 hover:bg-[#f8f8f8]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div className="slack-message-toolbar" aria-hidden>
          <ToolbarBtn label="Add reaction">😊</ToolbarBtn>
          <ToolbarBtn label="Reply in thread">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M7.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-3.75H16.5V16.5a1.5 1.5 0 0 1-1.5 1.5h-9a1.5 1.5 0 0 1-1.5-1.5v-9a1.5 1.5 0 0 1 1.5-1.5H12V3H7.5z" /></svg>
          </ToolbarBtn>
          <ToolbarBtn label="Share">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
          </ToolbarBtn>
          <ToolbarBtn label="Save">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
          </ToolbarBtn>
          <ToolbarBtn label="More">⋯</ToolbarBtn>
        </div>
      )}

      <div className="flex gap-2">
        <Avatar name={group.author} src={slackAvatarSrc(group.avatar)} size="lg" className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1 pb-2 pt-0.5">
          <div className="flex items-baseline gap-2 leading-none">
            <span className="text-[15px] font-bold text-[#1d1c1d]">{group.author}</span>
            <span className="text-xs text-[#616061]">{group.timestamp}</span>
          </div>

          {group.messages.map((video, idx) => (
            <MessageLines key={video.id} video={video} compact={idx > 0} onOpen={() => onOpen(video)} />
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
    <div className={compact ? 'mt-1' : 'mt-0.5'}>
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <p className="whitespace-pre-wrap text-[15px] leading-[22px] text-[#1d1c1d]">{text}</p>
      </button>

      {isThread && replyCount > 0 && (
        <button
          type="button"
          onClick={onOpen}
          className="mt-1 flex flex-wrap items-center gap-2 rounded-md border border-transparent px-1 py-0.5 text-left hover:border-[#d1d2d3] hover:bg-white"
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
          <span className="text-[13px] font-bold text-[#1264a3]">
            {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </span>
          {replies.length > 0 && replies[replies.length - 1]?.time && (
            <span className="text-[13px] text-[#616061]">Last reply {replies[replies.length - 1]!.time}</span>
          )}
        </button>
      )}
    </div>
  );
}

function ToolbarBtn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span
      title={label}
      className="grid h-7 min-w-[1.75rem] place-items-center rounded px-1 text-[#1d1c1d] hover:bg-[#f0f0f0]"
    >
      {children}
    </span>
  );
}
