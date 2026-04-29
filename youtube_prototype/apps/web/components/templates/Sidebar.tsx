import type { PageConfig, Section } from '@showcase/shared';

const ICON: Record<string, React.ReactElement> = {
  Home: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z" />
    </svg>
  ),
  Shorts: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M17.77 10.32l-1.2-.5L18 9.06A6.4 6.4 0 0014.74 3h-1.45A6.41 6.41 0 007.4 6.94l-2.69 4.66a4 4 0 002.59 5.93l1.2.5L7 18.94A6.42 6.42 0 0010.26 25h1.45a6.42 6.42 0 005.89-3.94l2.69-4.66a4 4 0 00-2.52-6.08zM10 16.5v-9l6 4.5z" />
    </svg>
  ),
  Subscriptions: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M20 8H4V6h16v2zm-2-6H6v2h12V2zm4 10v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-9 4l-5-3v6l5-3z" />
    </svg>
  ),
  You: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.31 0-10 1.66-10 5v3h20v-3c0-3.34-6.69-5-10-5z" />
    </svg>
  ),
  Library: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4zm12 1l5-3-5-3z" />
    </svg>
  ),
  History: (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <path d="M13 3a9 9 0 109 9h-2a7 7 0 11-7-7 6.9 6.9 0 014.95 2.05L15 11h7V4l-2.55 2.55A8.94 8.94 0 0013 3zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8z" />
    </svg>
  ),
};

function FallbackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function Sidebar({ section }: { section: Section; config: PageConfig }) {
  if (section.type !== 'Sidebar') return null;
  const { collapsed, pinnedItems, showSubscriptions } = section.props;

  return (
    <aside
      className={`hidden lg:flex shrink-0 flex-col gap-1 overflow-y-auto border-r border-[color:var(--border)] bg-[color:var(--bg)] py-3 transition-all ${
        collapsed ? 'w-20 px-2 items-center' : 'w-60 px-3'
      }`}
    >
      {pinnedItems.map((item) => (
        <button
          key={item}
          className={`flex items-center rounded-lg text-[color:var(--fg)] transition-colors hover:bg-[color:var(--muted)] ${
            collapsed
              ? 'flex-col gap-1 px-1 py-3 text-[10px] w-full'
              : 'gap-4 px-3 py-2 text-sm w-full text-left'
          }`}
        >
          <span className="shrink-0 text-[color:var(--fg)]">
            {ICON[item] ?? <FallbackIcon />}
          </span>
          <span className={collapsed ? 'leading-none' : 'truncate'}>{item}</span>
        </button>
      ))}

      {showSubscriptions && !collapsed && (
        <>
          <div className="my-3 border-t border-[color:var(--border)]" />
          <div className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-[color:var(--muted-fg)]">
            Subscriptions
          </div>
        </>
      )}
    </aside>
  );
}
