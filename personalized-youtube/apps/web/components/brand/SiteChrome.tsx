'use client';

import { useEffect, useRef, useState } from 'react';
import type { PageConfig, Section } from '@showcase/shared';
import { applyBrandSearch } from '@/lib/feed-interaction';
import { useAmazonCartOptional } from '@/lib/amazon-cart';
import { getSiteBrand } from '@/lib/site-brand';
import { usePageStore, type NavKey } from '@/lib/store';

function AmazonLogo() {
  return (
    <span className="flex items-baseline gap-0 leading-none text-white">
      <span className="text-[22px] font-bold tracking-tight">amazon</span>
      <svg viewBox="0 0 28 12" className="h-[14px] w-[28px] -translate-x-0.5 translate-y-0.5" aria-hidden>
        <path
          d="M2 10c6 2 14 2 22-1 1 0 1 2 0 2-9 4-19 3-26-2-1-1 1-2 4 1z"
          fill="#ff9900"
        />
        <path
          d="M2 10c6 2 14 2 22-1"
          fill="none"
          stroke="#ff9900"
          strokeWidth="1.5"
        />
      </svg>
      <span className="ml-1 text-[11px] font-normal text-[#ccc]">.com</span>
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

function useBrandSearch(config: PageConfig) {
  const brand = getSiteBrand(config.slug);
  const {
    dispatch,
    enterSearch,
    exitSearch,
    searchQuery,
    liveFeedMode,
    ytContinuation,
    setYtContinuation,
    setWatching,
    setActiveNav,
  } = usePageStore();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (searchQuery === null) setQuery('');
    else setQuery(searchQuery);
  }, [searchQuery]);

  async function runSearch(rawQuery: string): Promise<boolean> {
    const q = rawQuery.trim();
    if (!q || searching) return false;
    if (!liveFeedMode && brand === 'youtube') return false;
    if (!liveFeedMode && brand !== 'youtube') {
      // Mock: filter locally via search query in enterSearch + client filter handled elsewhere
      enterSearch(q, { config, ytContinuation });
      return true;
    }
    setSearching(true);
    try {
      return await applyBrandSearch({
        brand,
        query: q,
        config,
        ytContinuation,
        dispatch,
        enterSearch,
        setYtContinuation,
      });
    } finally {
      setSearching(false);
    }
  }

  function goHome() {
    setWatching(null);
    setActiveNav('Home', null);
    exitSearch();
  }

  return { brand, query, setQuery, searching, runSearch, goHome, liveFeedMode, setActiveNav, setWatching, exitSearch };
}

export function BrandTopBar({ section, config }: { section: Section; config: PageConfig }) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { brand, query, setQuery, searching, runSearch, goHome, liveFeedMode, setWatching } = useBrandSearch(config);

  if (section.type !== 'TopBar') return null;
  const { searchPlaceholder, showProfileChip } = section.props;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await runSearch(query);
  }

  if (brand === 'amazon') {
    const amazonCart = useAmazonCartOptional();
    const cartCount = amazonCart?.cartCount ?? 0;

    function openCart() {
      setWatching(null);
      amazonCart?.goToCart();
    }

    function handleGoHome() {
      goHome();
      amazonCart?.goToBrowse();
    }

    return (
      <header className="brand-amazon-header sticky top-0 z-30 border-b">
        <div className="flex h-[60px] items-stretch gap-2 px-3 sm:gap-3 sm:px-4">
          <button type="button" onClick={handleGoHome} className="flex shrink-0 items-center self-center" aria-label="Amazon home">
            <AmazonLogo />
          </button>

          <button
            type="button"
            className="hidden shrink-0 flex-col justify-center text-left text-[11px] leading-tight text-[#ccc] hover:text-white lg:flex"
          >
            <span className="text-[#ccc]">Deliver to</span>
            <span className="font-bold text-white">Akira · Stanford 94305</span>
          </button>

          <form
            className="mx-auto flex h-10 max-w-3xl flex-1 items-stretch self-center"
            onSubmit={onSubmit}
          >
            <select
              className="hidden rounded-l-md border border-r-0 border-[#888c8c] bg-[#f3f3f3] px-2 text-xs text-[#0f1111] sm:block"
              aria-label="Category"
              defaultValue="all"
            >
              <option>All</option>
              <option>Home &amp; Kitchen</option>
              <option>Electronics</option>
              <option>Books</option>
            </select>
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                liveFeedMode ? searchPlaceholder || 'Search Amazon' : `${searchPlaceholder || 'Search Amazon'} (mock)`
              }
              disabled={searching}
              className="brand-search-input w-full border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ff9900] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={searching}
              className="rounded-r-md bg-[#febd69] px-4 hover:bg-[#f3a847] disabled:opacity-60"
              aria-label="Search"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#0f1111]">
                <path d="M21 20.3l-5.4-5.4a7.5 7.5 0 1 0-1.4 1.4l5.4 5.4zM4 9.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0z" />
              </svg>
            </button>
          </form>

          {showProfileChip && (
            <div className="flex shrink-0 items-center gap-1 self-center text-white">
              <button type="button" className="hidden px-2 py-1 text-left text-[11px] leading-tight hover:outline hover:outline-1 hover:outline-white sm:block">
                <span className="block text-[#ccc]">EN</span>
                <span className="font-bold">🇺🇸</span>
              </button>
              <button type="button" className="px-2 py-1 text-left text-[11px] leading-tight hover:outline hover:outline-1 hover:outline-white">
                <span className="block text-[#ccc]">Hello, Akira</span>
                <span className="font-bold">Account &amp; Lists</span>
              </button>
              <button type="button" className="hidden px-2 py-1 text-left text-[11px] leading-tight hover:outline hover:outline-1 hover:outline-white md:block">
                <span className="block text-[#ccc]">Returns</span>
                <span className="font-bold">&amp; Orders</span>
              </button>
              <button type="button" onClick={openCart} className="relative px-2 py-1 hover:outline hover:outline-1 hover:outline-white" aria-label="Cart">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.16 14l.84-2h8.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20.84 3H6.21L5.27 1H2v2h2l3.6 7.59-1.35 2.44C5.52 13.37 6.24 14 7.16 14z" />
                </svg>
                <span className="absolute left-5 top-0 text-base font-bold text-[#ff9900]">{cartCount}</span>
                <span className="absolute -bottom-0.5 left-6 text-[11px] font-bold">Cart</span>
              </button>
            </div>
          )}
        </div>
        <div className="flex h-9 items-center gap-4 overflow-x-auto bg-[#232f3e] px-4 text-xs text-white no-scrollbar">
          {[
            { label: 'All', query: 'best sellers' },
            { label: "Today's Deals", query: "today's deals" },
            { label: 'Prime', query: 'prime deals' },
            { label: 'Gift Cards', query: 'gift cards' },
            { label: 'Customer Service', query: 'customer service' },
          ].map(({ label, query: q }) => (
            <button
              key={label}
              type="button"
              className="shrink-0 whitespace-nowrap hover:text-[#ff9900]"
              onClick={() => void runSearch(q)}
            >
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
          <form className="hidden flex-1 sm:block" onSubmit={onSubmit}>
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={liveFeedMode ? searchPlaceholder || 'Search' : `${searchPlaceholder || 'Search'} (mock)`}
              disabled={searching}
              className="brand-search-input w-full px-4 py-2 text-sm outline-none disabled:opacity-60"
            />
          </form>
          {showProfileChip && (
            <div className="ml-auto flex items-center gap-3">
              <button type="button" onClick={goHome} className="hidden h-6 w-6 lg:block" aria-label="Home">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                  <path d="M9.005 16.545a2.997 2.997 0 0 1 2.997-2.997h0A2.997 2.997 0 0 1 15 16.545V21h7V11.543L12 4 2 11.543V21h7.005Z" />
                </svg>
              </button>
              <button
                type="button"
                className="hidden h-6 w-6 lg:block"
                aria-label="Messages"
                onClick={() => searchInputRef.current?.focus()}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </button>
              <button
                type="button"
                className="hidden h-6 w-6 lg:block"
                aria-label="Explore"
                onClick={() => void runSearch('explore')}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3-3" />
                </svg>
              </button>
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
  const { activeNav, setActiveNav, setWatching, exitSearch } = usePageStore();
  const { runSearch, goHome } = useBrandSearch(config);

  if (brand !== 'instagram') return null;

  const items: { label: NavKey; onClick: () => void }[] = [
    { label: 'Home', onClick: goHome },
    { label: 'Search', onClick: () => setActiveNav('Search', null) },
    { label: 'Reels', onClick: () => { setWatching(null); setActiveNav('Reels', null); exitSearch(); } },
    { label: 'Shop', onClick: () => void runSearch('shop') },
    { label: 'Profile', onClick: () => { setWatching(null); setActiveNav('Profile', null); } },
  ];

  return (
    <nav
      aria-label="Instagram navigation"
      className="brand-ig-bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] bg-white md:hidden"
    >
      <div className="mx-auto flex max-w-[935px] items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive = activeNav === item.label;
          return (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${
                isActive ? 'text-[color:var(--fg)]' : 'text-[color:var(--muted-fg)]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded ${isActive ? 'opacity-100' : 'opacity-60'}`}
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
          );
        })}
      </div>
    </nav>
  );
}
