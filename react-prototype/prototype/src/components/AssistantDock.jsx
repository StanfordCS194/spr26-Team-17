import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const DOCK_MIN_STORAGE = "pulsewear-ai-dock-minimized";

export default function AssistantDock({
  visible,
  personalization,
  messageCount,
  onOpen,
  onReset
}) {
  const [minimized, setMinimized] = useState(() => {
    try {
      return sessionStorage.getItem(DOCK_MIN_STORAGE) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(DOCK_MIN_STORAGE, minimized ? "1" : "0");
    } catch {
      /* ignore quota / privacy mode */
    }
  }, [minimized]);

  const bottomPad = "max(1.25rem, env(safe-area-inset-bottom, 0px))";
  const rightPad = "max(1.25rem, env(safe-area-inset-right, 0px))";

  const topNames = Array.isArray(personalization?.topFits)
    ? personalization.topFits.map((f) => f?.productName).filter(Boolean)
    : [];
  const fabDeviceLine =
    topNames.length >= 2
      ? `${topNames.slice(0, 2).join(" · ")}${topNames.length > 2 ? " …" : ""}`
      : topNames[0] || personalization?.recommendedProductName || "";

  return (
    <AnimatePresence>
      {visible && minimized ? (
        <motion.div
          key="dock-fab"
          initial={{ opacity: 0, scale: 0.88, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed z-[60]"
          style={{ bottom: bottomPad, right: rightPad }}
        >
          <button
            type="button"
            onClick={() => setMinimized(false)}
            aria-label="Expand AI session card"
            className="touch-manipulation flex max-w-[calc(100vw-2rem)] items-center gap-2.5 rounded-full border border-accent/25 bg-accent py-3 pl-3 pr-5 text-left text-white shadow-[0_20px_50px_-24px_rgba(58,73,221,0.9)] ring-4 ring-accent/10 transition hover:-translate-y-0.5 hover:bg-accentDeep sm:gap-3 sm:pl-4"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/95 text-[10px] font-black leading-none tracking-tighter text-accent">
              PW
            </span>
            <span className="min-w-0 flex flex-col gap-0.5 text-[11px] font-semibold leading-tight">
              <span className="text-white/95">PulseWear AI</span>
              <span className="truncate font-medium text-white/75">
                {fabDeviceLine ? `Session saved · ${fabDeviceLine}` : "Resume session"}
              </span>
            </span>
          </button>
        </motion.div>
      ) : null}

      {visible && !minimized ? (
        <motion.aside
          key="dock-panel"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.24 }}
          className="fixed z-[60] flex max-h-[min(520px,calc(100svh-2.5rem))] w-[calc(100vw-2rem)] max-w-[min(20rem,calc(100vw-2rem))] flex-col sm:w-auto sm:max-w-[22rem]"
          style={{
            bottom: bottomPad,
            right: rightPad
          }}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-[#d8def0] bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(238,242,255,0.98))] shadow-[0_30px_90px_-40px_rgba(58,73,221,0.32)]">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-smoke">
                    AI session saved
                  </div>
                  <h3 className="mt-2 text-[1.0625rem] font-semibold leading-snug text-ink sm:text-lg">
                    {personalization.topFits?.length
                      ? `${personalization.topFits.map((f) => f.productName).join(", ")} — still your ranked lineup.`
                      : `${personalization.recommendedProductName} is still leading.`}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-smoke">
                    {messageCount} messages saved. Reopen the assistant to refine your recommendation or start over.
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMinimized(true)}
                    aria-label="Shrink to floating button"
                    title="Shrink to floating button"
                    className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-smoke transition hover:text-ink"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={onReset}
                    className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-smoke transition hover:text-ink"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={onOpen}
                  className="w-full rounded-full bg-accent px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_32px_-20px_rgba(58,73,221,0.85)] transition hover:-translate-y-0.5 hover:bg-accentDeep"
                >
                  Resume AI
                </button>

                <div className="rounded-panel border border-line/70 bg-white/55 px-4 py-3.5">
                  <p className="eyebrow mb-1.5 text-[10px]">How we&apos;re matching you</p>
                  <p className="text-[13px] leading-[1.6] text-smoke">{personalization.focusAudience}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
