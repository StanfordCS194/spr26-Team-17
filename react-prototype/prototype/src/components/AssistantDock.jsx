import { AnimatePresence, motion } from "framer-motion";

export default function AssistantDock({
  visible,
  personalization,
  messageCount,
  onOpen,
  onReset
}) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.aside
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.24 }}
          className="fixed bottom-5 right-5 z-[60] w-[calc(100vw-2.5rem)] max-w-sm"
        >
          <div className="overflow-hidden rounded-[28px] border border-[#d8def0] bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(238,242,255,0.98))] p-4 shadow-[0_30px_90px_-40px_rgba(58,73,221,0.32)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-smoke">
                  AI session saved
                </div>
                <h3 className="mt-2 text-lg font-semibold text-ink">
                  {personalization.recommendedProductName} is still leading.
                </h3>
                <p className="mt-2 text-sm leading-6 text-smoke">
                  {messageCount} messages saved. Reopen the assistant to refine your recommendation or start over.
                </p>
              </div>
              <button
                type="button"
                onClick={onReset}
                className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-smoke transition hover:text-ink"
              >
                Reset
              </button>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={onOpen}
                className="flex-1 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-accentDeep"
              >
                Resume AI
              </button>
              <div className="rounded-full border border-[#d7dff7] bg-[#f4f7ff] px-4 py-3 text-sm font-medium text-[#34426f]">
                {personalization.focusAudience}
              </div>
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
