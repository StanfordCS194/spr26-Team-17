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

export default function Navbar() {
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
