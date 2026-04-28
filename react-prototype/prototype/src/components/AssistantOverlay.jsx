import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const starterPrompts = [
  "I am a student and want one device for focus, sleep, and workouts.",
  "I want the best wearable for recovery and training performance.",
  "Show me the most affordable option for wellness and daily health insight."
];

export default function AssistantOverlay({
  open,
  messages,
  isLoading,
  personalization,
  onClose,
  onResetSession,
  onSendMessage
}) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function handleSubmit(event) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || isLoading) return;
    setDraft("");
    onSendMessage(message);
  }

  function handlePromptClick(prompt) {
    if (isLoading) return;
    setDraft("");
    onSendMessage(prompt);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          className="fixed inset-0 z-[70] flex h-[100svh] min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,rgba(247,244,238,0.96),rgba(235,240,255,0.98))] text-ink backdrop-blur-xl supports-[height:100dvh]:h-[100dvh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pulsewear-ai-title"
        >
          {/* Safe areas: home indicator / notches */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] [@media(max-height:480px)_and_(orientation:landscape)]:pt-1 [@media(max-height:480px)_and_(orientation:landscape)]:pb-2">
          {/* Compact chrome */}
          <header className="section-shell flex shrink-0 flex-wrap items-start justify-between gap-2 border-b border-black/5 py-2 sm:gap-3 sm:py-3 [@media(max-height:560px)]:py-2 [@media(max-height:480px)_and_(orientation:landscape)]:py-2">
            <div className="min-w-0 flex-1 pr-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-smoke sm:text-xs">
                AI Assistant
              </p>
              <h2
                id="pulsewear-ai-title"
                className="mt-0.5 text-base font-semibold leading-tight text-ink sm:text-lg [@media(max-height:480px)_and_(orientation:landscape)]:text-sm [@media(max-height:480px)_and_(orientation:landscape)]:leading-snug"
              >
                Personalize for your rhythm
              </h2>
              <p className="mt-1 text-[11px] leading-snug text-smoke sm:text-xs md:text-sm [@media(max-height:480px)_and_(orientation:landscape)]:hidden">
                Your conversation is saved, so you can close this and come back anytime.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onResetSession}
                className="min-h-[44px] min-w-[72px] touch-manipulation rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-smoke transition hover:text-ink sm:min-h-[44px] sm:px-4 sm:text-sm"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] min-w-[72px] touch-manipulation rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition sm:min-h-[44px] sm:px-4 sm:text-sm"
              >
                Close
              </button>
            </div>
          </header>

          <div className="section-shell flex min-h-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto py-2 sm:gap-4 sm:py-4 lg:flex-row lg:items-stretch lg:gap-6 lg:overflow-hidden [@media(max-height:640px)]:gap-2 [@media(max-height:640px)]:py-2 [@media(max-height:480px)_and_(orientation:landscape)]:py-2 [@media(max-height:480px)_and_(orientation:landscape)]:gap-2">
            <div className="flex min-h-[min(420px,min(85svh,calc(100svh-11rem)))] w-full min-w-0 shrink-0 flex-col overflow-hidden rounded-2xl border border-[#d9deee] bg-white shadow-[0_20px_60px_-36px_rgba(58,73,221,0.2)] sm:min-h-[min(calc(100svh-10rem),560px)] sm:rounded-[28px] lg:min-h-0 lg:max-h-[min(calc(100svh-10rem),min(90vh,900px))] lg:flex-1 [@media(max-height:480px)_and_(orientation:landscape)]:min-h-[calc(100svh-9rem)]">
              <div className="relative z-[1] flex shrink-0 items-center justify-between gap-2 border-b border-black/[0.06] px-3 py-2 sm:px-5 sm:py-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink">Conversation</div>
                  <div className="mt-0.5 text-xs text-smoke sm:text-sm [@media(max-height:640px)]:hidden">
                    Ask for the wearable that matches you.
                  </div>
                </div>
                {isLoading ? (
                  <div className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700 sm:px-3 sm:py-1 sm:text-xs">
                    Thinking
                  </div>
                ) : null}
              </div>

              <div className="relative z-0 min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden overscroll-contain px-3 pb-5 pt-2.5 sm:space-y-3.5 sm:px-4 sm:pb-6 sm:pt-3">
                {messages.map((message, index) => (
                  <motion.div
                    key={`${message.role}-${index}-${message.content}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`max-w-[min(36rem,calc(100%-0.75rem))] rounded-xl px-3 py-2.5 sm:max-w-2xl sm:rounded-[22px] sm:px-4 sm:py-3 ${
                      message.role === "user"
                        ? "ml-auto bg-[linear-gradient(135deg,#5968ff,#7481ff)] text-white shadow-[0_8px_20px_-10px_rgba(58,70,200,0.55)]"
                        : "border border-[#dbe1f2] bg-[#f8faff] text-ink shadow-sm"
                    }`}
                  >
                    <div className={`text-[9px] font-semibold uppercase tracking-[0.13em] sm:text-[10px] sm:tracking-[0.15em] ${message.role === "user" ? "text-white/75" : "text-smoke"}`}>
                      {message.role === "user" ? "You" : "PulseWear AI"}
                    </div>
                    <p className="mt-1 break-words text-[13px] leading-snug antialiased sm:mt-1.5 sm:text-sm sm:leading-relaxed">
                      {message.content}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="relative z-[2] shrink-0 border-t border-black/[0.08] bg-white px-3 py-3 sm:px-5 sm:py-4">
                <div className="mb-2 flex flex-wrap gap-1.5 sm:mb-3 sm:gap-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setDraft(prompt)}
                      className="max-w-full rounded-full border border-[#d7dff7] bg-[#f4f7ff] px-2.5 py-1.5 text-left text-[10px] font-medium leading-snug text-[#34426f] transition hover:border-accent/30 hover:bg-white hover:text-ink sm:px-3 sm:py-1.5 sm:text-[11px]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-2 sm:flex-row sm:gap-3"
                >
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={2}
                    placeholder="Describe what you need…"
                    className="min-h-[68px] flex-1 rounded-2xl border border-[#d8deef] bg-[#fcfdff] px-3.5 py-2.5 text-[13px] leading-snug text-ink outline-none placeholder:text-smoke/70 focus:border-accent/40 focus:bg-white sm:min-h-[80px] sm:px-4 sm:py-3 sm:text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !draft.trim()}
                    className="h-11 shrink-0 rounded-2xl bg-ink px-5 text-sm font-semibold text-white transition hover:bg-accentDeep disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:self-end sm:rounded-[24px] sm:py-4"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>

            <aside className="flex max-h-[min(40svh,320px)] w-full min-w-0 shrink-0 flex-col gap-3 overflow-y-auto overscroll-contain lg:max-h-full lg:w-[min(340px,min(38vw,40%))] lg:gap-4 xl:w-[min(400px,36%)] [@media(min-width:1024px)_and_(max-height:720px)]:max-h-[min(52svh,440px)]">
              <div className="rounded-2xl border border-[#d9deee] bg-[linear-gradient(135deg,#ffffff,#eef2ff)] p-4 text-ink shadow-[0_18px_50px_-32px_rgba(58,73,221,0.22)] sm:rounded-[28px] sm:p-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-smoke sm:text-xs">
                  Live Direction
                </div>
                <h3 className="mt-2 text-lg font-semibold leading-snug sm:text-xl">
                  {personalization.heroTitle}
                </h3>
                <p className="mt-2 max-h-[min(160px,25vh)] overflow-y-auto text-sm leading-relaxed text-smoke sm:max-h-[min(240px,30vh)] md:max-h-none md:overflow-visible">
                  {personalization.heroDescription}
                </p>
              </div>

              <div className="rounded-2xl border border-[#d9deee] bg-white p-4 text-ink shadow-[0_16px_44px_-32px_rgba(24,33,56,0.18)] sm:rounded-[28px] sm:p-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-smoke sm:text-xs">
                  Website changes
                </div>
                <ul className="mt-3 space-y-2 text-xs leading-snug text-smoke sm:text-sm sm:leading-6">
                  <li><span className="font-semibold text-ink">Recommended device:</span> {personalization.recommendedProductName}</li>
                  <li><span className="font-semibold text-ink">Primary audience:</span> {personalization.focusAudience}</li>
                  <li><span className="font-semibold text-ink">Priority themes:</span> {personalization.priorities.join(", ")}</li>
                  <li><span className="font-semibold text-ink">CTA direction:</span> {personalization.ctaLabel}</li>
                  <li><span className="font-semibold text-ink">Featured segments:</span> {personalization.featuredSegments.join(", ")}</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[#d9deee] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(243,246,255,0.95))] p-4 text-ink shadow-[0_16px_44px_-32px_rgba(24,33,56,0.18)] sm:rounded-[28px] sm:p-5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-smoke sm:text-xs">
                  Try next
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {personalization.followUpPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handlePromptClick(prompt)}
                      className="rounded-full border border-[#d7dff7] bg-[#f4f7ff] px-2.5 py-1.5 text-left text-[11px] font-medium leading-snug text-[#34426f] transition hover:border-accent/30 hover:bg-white hover:text-ink sm:px-3 sm:py-2 sm:text-xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
