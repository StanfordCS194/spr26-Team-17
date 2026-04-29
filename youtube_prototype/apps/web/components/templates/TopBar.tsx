import type { PageConfig, Section } from '@showcase/shared';

export function TopBar({ section }: { section: Section; config: PageConfig }) {
  if (section.type !== 'TopBar') return null;
  const { logoText, searchPlaceholder, compactSearch, showProfileChip } = section.props;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-6 border-b border-[color:var(--border)] bg-[color:var(--bg)] px-4">
      <button
        aria-label="Toggle navigation"
        className="grid h-10 w-10 place-items-center rounded-full text-[color:var(--fg)] hover:bg-[color:var(--muted)]"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
        </svg>
      </button>

      <div className="flex items-center gap-1.5 select-none">
        <span className="grid h-7 w-10 place-items-center rounded-md bg-[color:var(--accent)] text-[color:var(--accent-fg)]">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="text-lg font-bold tracking-tight">{logoText}</span>
      </div>

      <form
        className={`mx-auto flex items-stretch ${compactSearch ? 'w-72' : 'w-full max-w-2xl'}`}
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="w-full rounded-l-full border border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-2 text-sm outline-none focus:border-[color:var(--accent)]"
        />
        <button
          type="submit"
          aria-label="Search"
          className="rounded-r-full border border-l-0 border-[color:var(--border)] bg-[color:var(--muted)] px-5 hover:bg-[color:var(--border)]"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M21 20.3l-5.4-5.4a7.5 7.5 0 1 0-1.4 1.4l5.4 5.4zM4 9.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0z" />
          </svg>
        </button>
      </form>

      {showProfileChip && (
        <div className="flex items-center gap-2">
          <button
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-[color:var(--muted)]"
            aria-label="Create"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2zm7-3.78v6.78a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.22l4-2v6.56l-4-2z" />
            </svg>
          </button>
          <button
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-[color:var(--muted)]"
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M10 20h4a2 2 0 0 1-4 0zm10-2v-1l-2-1.5V11a6 6 0 0 0-5-5.92V4a1 1 0 0 0-2 0v1.08A6 6 0 0 0 6 11v4.5L4 17v1z" />
            </svg>
          </button>
          <div
            className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--accent)] text-sm font-semibold text-[color:var(--accent-fg)]"
            aria-label="Profile"
          >
            E
          </div>
        </div>
      )}
    </header>
  );
}
