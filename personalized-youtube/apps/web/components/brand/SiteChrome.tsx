'use client';

import type { PageConfig, Section } from '@showcase/shared';
import { getSiteBrand } from '@/lib/site-brand';
import { usePageStore } from '@/lib/store';

function AmazonLogo() {
  return (
    <span className="flex items-baseline gap-0 text-xl font-bold tracking-tight text-white">
      <span>amazon</span>
      <span className="text-[#ff9900] text-2xl leading-none">⌵</span>
    </span>
  );
}

function InstagramLogo() {
  return (
    <span className="brand-ig-gradient-text text-2xl font-semibold" style={{ fontFamily: 'cursive' }}>
      Instagram
    </span>
  );
}

export function BrandTopBar({ section, config }: { section: Section; config: PageConfig }) {
  const brand = getSiteBrand(config.slug);
  const { setWatching, setActiveNav } = usePageStore();

  if (section.type !== 'TopBar') return null;
  const { searchPlaceholder, showProfileChip } = section.props;

  function goHome() {
    setWatching(null);
    setActiveNav('Home', null);
  }

  if (brand === 'amazon') {
    return (
      <header className="brand-amazon-header sticky top-0 z-30 border-b">
        <div className="flex h-14 items-center gap-3 px-4">
          <button type="button" onClick={goHome} className="shrink-0" aria-label="Amazon home">
            <AmazonLogo />
          </button>
          <form
            className="mx-auto flex h-10 max-w-3xl flex-1 items-stretch"
            onSubmit={(e) => e.preventDefault()}
          >
            <select
              className="hidden rounded-l-md border border-r-0 border-[#888c8c] bg-[#f3f3f3] px-2 text-xs text-[#0f1111] sm:block"
              aria-label="Category"
              defaultValue="all"
            >
              <option>All</option>
            </select>
            <input
              type="search"
              placeholder={searchPlaceholder || 'Search Amazon'}
              className="brand-search-input w-full border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ff9900]"
            />
            <button
              type="submit"
              className="rounded-r-md bg-[#febd69] px-4 hover:bg-[#f3a847]"
              aria-label="Search"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#0f1111]">
                <path d="M21 20.3l-5.4-5.4a7.5 7.5 0 1 0-1.4 1.4l5.4 5.4zM4 9.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0z" />
              </svg>
            </button>
          </form>
          {showProfileChip && (
            <div className="flex shrink-0 items-center gap-1 text-white">
              <button type="button" className="px-2 py-1 text-xs hover:underline" aria-label="Account">
                Account
              </button>
              <button type="button" className="px-2 py-1 text-xs hover:underline" aria-label="Orders">
                Orders
              </button>
              <button type="button" className="relative px-2 py-1" aria-label="Cart">
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.16 14l.84-2h8.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20.84 3H6.21L5.27 1H2v2h2l3.6 7.59-1.35 2.44C5.52 13.37 6.24 14 7.16 14z" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="flex h-9 items-center gap-4 overflow-x-auto bg-[#232f3e] px-4 text-xs text-white no-scrollbar">
          {['All', "Today's Deals", 'Prime', 'Gift Cards', 'Customer Service'].map((label) => (
            <button key={label} type="button" className="shrink-0 whitespace-nowrap hover:text-[#ff9900]">
              {label}
            </button>
          ))}
        </div>
      </header>
    );
  }

  if (brand === 'instagram') {
    return (
      <header className="brand-ig-header sticky top-0 z-30 border-b">
        <div className="mx-auto flex h-[60px] max-w-[935px] items-center gap-4 px-4">
          <button type="button" onClick={goHome} aria-label="Instagram home">
            <InstagramLogo />
          </button>
          <form className="hidden flex-1 sm:block" onSubmit={(e) => e.preventDefault()}>
            <input
              type="search"
              placeholder={searchPlaceholder || 'Search'}
              className="brand-search-input w-full px-4 py-2 text-sm outline-none"
            />
          </form>
          {showProfileChip && (
            <div className="ml-auto flex items-center gap-3">
              <button type="button" className="hidden h-6 w-6 rounded bg-[color:var(--muted)] lg:block" aria-label="Home" />
              <button type="button" className="hidden h-6 w-6 rounded bg-[color:var(--muted)] lg:block" aria-label="Messages" />
              <button type="button" className="hidden h-6 w-6 rounded bg-[color:var(--muted)] lg:block" aria-label="Explore" />
              <div
                className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]"
                aria-hidden
              >
                <div className="h-full w-full rounded-full bg-white p-px">
                  <div className="h-full w-full rounded-full bg-[color:var(--muted)]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    );
  }

  return null;
}

export function BrandBottomNav({ config }: { config: PageConfig }) {
  const brand = getSiteBrand(config.slug);
  if (brand !== 'instagram') return null;

  const items = [
    { label: 'Home', active: true },
    { label: 'Search', active: false },
    { label: 'Reels', active: false },
    { label: 'Shop', active: false },
    { label: 'Profile', active: false },
  ];

  return (
    <nav
      aria-label="Instagram navigation"
      className="brand-ig-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] bg-white md:hidden"
    >
      <div className="mx-auto flex max-w-[935px] items-center justify-around px-2 py-2">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${
              item.active ? 'text-[color:var(--fg)]' : 'text-[color:var(--muted-fg)]'
            }`}
            aria-current={item.active ? 'page' : undefined}
          >
            <span
              className={`grid h-6 w-6 place-items-center rounded ${item.active ? 'opacity-100' : 'opacity-60'}`}
              aria-hidden
            >
              {item.label === 'Home' && (
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                  <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997h0A2.997 2.997 0 0 1 15 16.545V21h7V11.543L12 4 2 11.543V21h7.005Z" />
                </svg>
              )}
              {item.label === 'Search' && (
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3-3" />
                </svg>
              )}
              {item.label === 'Reels' && (
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.252-.148-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                </svg>
              )}
              {item.label === 'Shop' && (
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
                </svg>
              )}
              {item.label === 'Profile' && (
                <div className="h-6 w-6 rounded-full border border-[color:var(--border)] bg-[color:var(--muted)]" />
              )}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
