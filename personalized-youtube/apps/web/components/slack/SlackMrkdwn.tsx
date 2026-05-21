'use client';

import type { ReactNode } from 'react';

function safeUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol === 'https:' || u.protocol === 'http:') return u.href;
  } catch {
    // ignore
  }
  return null;
}

const SPECIAL_MENTIONS: Record<string, string> = {
  channel: 'channel',
  here: 'here',
  everyone: 'everyone',
};

function parseAngleToken(inner: string): ReactNode {
  const urlMatch = inner.match(/^(https?:\/\/[^\s|>]+)(?:\|([\s\S]+))?$/i);
  if (urlMatch) {
    const href = safeUrl(urlMatch[1]!);
    if (href) {
      const labelContent = urlMatch[2]
        ? parseLine(urlMatch[2], 'link-label')
        : urlMatch[1]!;
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="slack-mrkdwn-link break-all text-[#1264a3] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {labelContent}
        </a>
      );
    }
    return urlMatch[2]?.trim() || urlMatch[1]!;
  }

  if (inner.startsWith('@')) {
    const rest = inner.slice(1);
    const pipe = rest.indexOf('|');
    const name = pipe === -1 ? 'member' : rest.slice(pipe + 1).trim() || 'member';
    return (
      <span className="slack-mrkdwn-mention rounded-[3px] bg-[#e8f5fa] px-0.5 font-medium text-[#1264a3]">
        @{name}
      </span>
    );
  }

  if (inner.startsWith('#')) {
    const rest = inner.slice(1);
    const pipe = rest.indexOf('|');
    const name = pipe === -1 ? rest.trim() : rest.slice(pipe + 1).trim();
    return (
      <span className="slack-mrkdwn-channel rounded-[3px] bg-[#e8f5fa] px-0.5 font-medium text-[#1264a3]">
        #{name || 'channel'}
      </span>
    );
  }

  if (inner.startsWith('!')) {
    const key = inner.slice(1).split('|')[0]?.trim().toLowerCase() ?? '';
    const label = SPECIAL_MENTIONS[key] ?? key;
    return (
      <span className="slack-mrkdwn-broadcast rounded-[3px] bg-[#fff0b3] px-0.5 font-medium text-[#1d1c1d]">
        @{label}
      </span>
    );
  }

  return inner;
}

function parseInlineFormatting(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~|`[^`\n]+`/g;
  let last = 0;
  let i = 0;

  for (const m of text.matchAll(re)) {
    const idx = m.index ?? 0;
    if (idx > last) nodes.push(text.slice(last, idx));

    const token = m[0];
    const inner = token.slice(1, -1);
    if (token.startsWith('*')) {
      nodes.push(
        <strong key={`${keyPrefix}-b${i++}`} className="font-bold">
          {parseLine(inner, `${keyPrefix}-bi`)}
        </strong>,
      );
    } else if (token.startsWith('_')) {
      nodes.push(
        <em key={`${keyPrefix}-i${i++}`} className="italic">
          {parseLine(inner, `${keyPrefix}-ii`)}
        </em>,
      );
    } else if (token.startsWith('~')) {
      nodes.push(
        <s key={`${keyPrefix}-s${i++}`} className="line-through">
          {inner}
        </s>,
      );
    } else if (token.startsWith('`')) {
      nodes.push(
        <code
          key={`${keyPrefix}-c${i++}`}
          className="rounded bg-[#f8f8f8] px-1 py-0.5 font-mono text-[13px] text-[#e01e5a] ring-1 ring-[#ebebeb]"
        >
          {inner}
        </code>,
      );
    }
    last = idx + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length > 0 ? nodes : [text];
}

function parseLine(line: string, key: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /<[^>]+>/g;
  let last = 0;
  let i = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(line)) !== null) {
    const idx = match.index;
    if (idx > last) {
      nodes.push(...parseInlineFormatting(line.slice(last, idx), `${key}-t${i}`));
    }
    nodes.push(
      <span key={`${key}-a${i++}`}>{parseAngleToken(match[0].slice(1, -1))}</span>,
    );
    last = idx + match[0].length;
  }

  if (last < line.length) {
    nodes.push(...parseInlineFormatting(line.slice(last), `${key}-end`));
  }

  return nodes.length > 0 ? nodes : [''];
}

function parseText(text: string): ReactNode[] {
  const lines = text.split('\n');
  const out: ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) out.push(<br key={`br-${lineIdx}`} />);
    out.push(...parseLine(line, `l${lineIdx}`));
  });

  return out;
}

/** Render Slack mrkdwn (links, mentions, basic inline formatting). */
export function SlackMrkdwn({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  if (!text.trim()) return null;

  return (
    <div className={`slack-mrkdwn whitespace-pre-wrap break-words text-[15px] leading-[22px] text-[#1d1c1d] ${className}`}>
      {parseText(text)}
    </div>
  );
}
