'use client';

export function SlackComposer({ channelName }: { channelName: string }) {
  const placeholder = channelName.startsWith('#')
    ? `Message ${channelName}`
    : `Message ${channelName}`;

  return (
    <div className="slack-composer shrink-0 bg-white px-5 pb-5 pt-2">
      <div className="overflow-hidden rounded-lg border border-[#868686]/50 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-within:border-[#868686]">
        <textarea
          readOnly
          rows={2}
          placeholder={placeholder}
          className="block w-full resize-none bg-transparent px-3 pt-3 pb-1 text-[15px] leading-[22px] text-[#1d1c1d] outline-none placeholder:text-[#616061]"
          aria-label={placeholder}
        />
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <div className="flex items-center gap-0.5 text-[#616061]">
            <ComposerIcon label="Bold">
              <span className="text-[15px] font-bold">B</span>
            </ComposerIcon>
            <ComposerIcon label="Italic">
              <span className="text-[15px] italic">I</span>
            </ComposerIcon>
            <ComposerIcon label="Strikethrough">
              <span className="text-[15px] line-through">S</span>
            </ComposerIcon>
            <ComposerIcon label="Link">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
            </ComposerIcon>
            <ComposerIcon label="Ordered list">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M4 18v-2h2" /></svg>
            </ComposerIcon>
            <ComposerIcon label="Bulleted list">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2"><path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>
            </ComposerIcon>
          </div>
          <div className="flex items-center gap-0.5 text-[#616061]">
            <ComposerIcon label="Attach">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
            </ComposerIcon>
            <ComposerIcon label="Emoji">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></svg>
            </ComposerIcon>
            <ComposerIcon label="Mention">
              <span className="text-[15px] font-medium">@</span>
            </ComposerIcon>
            <ComposerIcon label="Video clip">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current stroke-2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 9l5 3-5 3V9z" /></svg>
            </ComposerIcon>
            <button
              type="button"
              aria-label="Send"
              className="ml-1 grid h-8 w-8 place-items-center rounded bg-[#007a5a] text-white hover:bg-[#006644]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComposerIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span
      title={label}
      className="grid h-7 w-7 place-items-center rounded hover:bg-[#f0f0f0]"
    >
      {children}
    </span>
  );
}
