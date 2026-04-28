import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { navItems } from "../data/siteData";

function isNavActive(item, pathname, hash) {
  if (pathname !== "/" && item.id === "products") return true;
  if (pathname === "/" && hash === `#${item.id}`) return true;
  if (pathname === "/" && !hash && item.id === "products") return true;
  return false;
}

function NavLink({ item, pathname, hash, onClick }) {
  const active = isNavActive(item, pathname, hash);

  return (
    <Link
      to={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-black text-white"
          : "text-smoke hover:bg-black/[0.04] hover:text-ink"
      }`}
    >
      {item.label}
    </Link>
  );
}

function AiModeToggle({
  enabled,
  sessionActive = false,
  messageCount = 0,
  onToggle,
  compact = false
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      className={`group inline-flex items-center gap-3 rounded-full border px-3 py-2 transition ${
        enabled
          ? "border-accent bg-[linear-gradient(135deg,#5968ff,#7481ff)] text-white shadow-hover"
          : sessionActive
            ? "border-accent/20 bg-[linear-gradient(135deg,#ffffff,#eef2ff)] text-ink shadow-panel hover:-translate-y-0.5"
            : "border-line bg-white text-ink hover:-translate-y-0.5 hover:shadow-panel"
      } ${compact ? "justify-between" : ""}`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`grid h-10 w-10 place-items-center rounded-2xl text-sm font-black ${
            enabled
              ? "bg-white/20 text-white"
              : sessionActive
                ? "bg-accent/10 text-accent"
                : "bg-black/5 text-ink"
          }`}
        >
          AI
        </span>
        <span className="text-left">
          <span className="block text-sm font-semibold">
            {enabled ? "AI Concierge" : sessionActive ? "Resume AI" : "AI Concierge"}
          </span>
          <span className={`block text-xs ${enabled ? "text-white/75" : "text-smoke"}`}>
            {sessionActive ? `${messageCount} messages saved` : "Personalize your shopping path"}
          </span>
        </span>
      </span>
      <span className="flex items-center gap-3">
        {sessionActive && !enabled ? (
          <span className="hidden rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent sm:inline-flex">
            Saved
          </span>
        ) : null}
        <span
          className={`relative h-6 w-11 rounded-full transition ${
            enabled ? "bg-white/30" : "bg-black/10"
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full shadow-sm transition ${
              enabled ? "left-6 bg-white" : "left-1 bg-white"
            }`}
          />
        </span>
      </span>
    </button>
  );
}

export default function Navbar({
  aiEnabled = false,
  sessionActive = false,
  messageCount = 0,
  onToggleAiMode = () => {}
}) {
  const { pathname, hash } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname, hash]);

  const mobileLinks = useMemo(() => navItems, []);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-canvas/80 backdrop-blur-xl">
      <div className="section-shell flex h-18 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-sm font-black text-white shadow-[0_12px_24px_-18px_rgba(0,0,0,0.6)]">
            PW
          </div>
          <div>
            <div className="text-lg font-semibold">PulseWear</div>
            <div className="text-xs text-smoke">smart wearables</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-line bg-white/90 p-1 shadow-panel lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              pathname={pathname}
              hash={hash}
            />
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <AiModeToggle
            enabled={aiEnabled}
            sessionActive={sessionActive}
            messageCount={messageCount}
            onToggle={onToggleAiMode}
          />
          <Link
            to="/#products"
            className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:shadow-panel"
          >
            Shop now
          </Link>
          <Link
            to="/#compare"
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-accentDeep hover:shadow-hover"
          >
            Compare devices
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-white text-ink shadow-panel lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <div className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-5 rounded-full bg-current transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-current transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-current transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-t border-line bg-canvas/95 lg:hidden"
          >
            <div className="section-shell py-4">
              <div className="surface-card flex flex-col gap-2 p-4">
                <AiModeToggle
                  enabled={aiEnabled}
                  sessionActive={sessionActive}
                  messageCount={messageCount}
                  onToggle={onToggleAiMode}
                  compact
                />
                {mobileLinks.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    pathname={pathname}
                    hash={hash}
                    onClick={() => setOpen(false)}
                  />
                ))}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <Link
                    to="/#products"
                    className="rounded-full border border-line px-4 py-3 text-center text-sm font-semibold text-ink"
                  >
                    Shop now
                  </Link>
                  <Link
                    to="/#compare"
                    className="rounded-full bg-accent px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Compare devices
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
