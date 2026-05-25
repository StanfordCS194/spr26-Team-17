'use client';

export function SlackComposer({ channelName }: { channelName: string }) {
  const placeholder = channelName.startsWith('#') || channelName.includes(' ')
    ? `Message ${channelName.startsWith('#') ? channelName : channelName}`
    : `Message @${channelName}`;

  return (
    <div className="slack-composer shrink-0 bg-white px-5 pb-6 pt-1">
      <div className="flex items-end gap-2">
        <button
          type="button"
          aria-label="Attach"
          className="mb-2 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#e8e8e8] text-[#616061] hover:bg-[#f8f8f8]"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.5]"><path d="M12 5v14M5 12h14" /></svg>
        </button>

        <div className="min-w-0 flex-1 overflow-hidden rounded-lg border border-[#868686]/60 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] focus-within:border-[#616061]">
          <textarea
            readOnly
            rows={1}
            placeholder={placeholder}
            className="block max-h-40 min-h-[42px] w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-[15px] leading-[22px] text-[#1d1c1d] outline-none placeholder:text-[#616061]"
            aria-label={placeholder}
          />
          <div className="flex items-center justify-between px-1 pb-1.5 pt-0.5">
            <div className="flex items-center text-[#616061]">
              <ComposerIcon label="Bold"><span className="text-[14px] font-bold">B</span></ComposerIcon>
              <ComposerIcon label="Italic"><span className="text-[14px] italic">I</span></ComposerIcon>
              <ComposerIcon label="Strikethrough"><span className="text-[14px] line-through">S</span></ComposerIcon>
              <ComposerIcon label="Link">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
              </ComposerIcon>
              <ComposerIcon label="Bulleted list">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>
              </ComposerIcon>
            </div>
            <div className="flex items-center gap-0.5 text-[#616061]">
              <ComposerIcon label="Emoji">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.5]"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></svg>
              </ComposerIcon>
              <ComposerIcon label="Mention someone"><span className="text-[15px] font-medium">@</span></ComposerIcon>
              <button
                type="button"
                aria-label="Send message"
                disabled
                className="ml-0.5 grid h-8 w-8 place-items-center rounded bg-[#007a5a]/40 text-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComposerIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded hover:bg-[#f0f0f0]"
    >
      {children}
    </button>
  );
}
