'use client';

export function SlackChannelHeader({
  channelName,
  memberCount = 12,
  topic,
  onMenuClick,
}: {
  channelName: string;
  memberCount?: number;
  topic?: string | null;
  onMenuClick?: () => void;
}) {
  const isDm = !channelName.startsWith('#') && !channelName.startsWith('Search');
  const display = channelName.replace(/^#\s*/, '');
  const isSearch = channelName.startsWith('Search');

  return (
    <div className="slack-channel-header shrink-0 border-b border-[#e8e8e8] bg-white">
      <header className="flex items-center justify-between px-5 py-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#616061] hover:bg-[#f0f0f0] md:hidden"
              aria-label="Open sidebar"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" /></svg>
            </button>
          )}
          {!isDm && !isSearch && (
            <span className="text-[18px] font-bold leading-none text-[#616061]" aria-hidden>
              #
            </span>
          )}
          <h1 className="truncate text-[18px] font-bold leading-tight text-[#1d1c1d]">{display}</h1>
          {!isSearch && (
            <button
              type="button"
              className="rounded p-1 text-[#616061] hover:bg-[#f8f8f8]"
              aria-label="Star channel"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.5]">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5 text-[#616061]">
          {!isDm && !isSearch && (
            <HeaderIcon label="View members">
              <span className="flex items-center gap-1 text-[13px] font-normal">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.5]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                {memberCount}
              </span>
            </HeaderIcon>
          )}
          <HeaderIcon label="Start huddle">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.5]"><path d="M12 1a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" /><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" /></svg>
          </HeaderIcon>
          <HeaderIcon label="Search in channel">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.5]"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" /></svg>
          </HeaderIcon>
          <HeaderIcon label="More channel actions">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
          </HeaderIcon>
        </div>
      </header>

      {!isSearch && (
        <div className="flex gap-6 border-t border-[#f0f0f0] px-5">
          <button type="button" className="border-b-2 border-[#1264a3] py-2 text-[13px] font-bold text-[#1d1c1d]">
            Messages
          </button>
          <button type="button" className="border-b-2 border-transparent py-2 text-[13px] font-medium text-[#616061] hover:text-[#1d1c1d]">
            Files
          </button>
          <button type="button" className="border-b-2 border-transparent py-2 text-[13px] font-medium text-[#616061] hover:text-[#1d1c1d]">
            Pins
          </button>
        </div>
      )}

      {topic && !isSearch && (
        <div className="border-t border-[#f0f0f0] px-5 py-1.5">
          <p className="truncate text-[13px] leading-snug text-[#616061]">
            <span className="font-normal text-[#616061]">Topic</span>{' '}
            <span className="text-[#1d1c1d]">{topic}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function HeaderIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-8 min-w-[2rem] place-items-center rounded px-1.5 hover:bg-[#f8f8f8]"
    >
      {children}
    </button>
  );
}
