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
          className="fixed inset-0 z-[70] overflow-y-auto bg-[linear-gradient(180deg,rgba(247,244,238,0.96),rgba(235,240,255,0.98))] text-ink backdrop-blur-xl"
        >
          <div className="flex h-full flex-col">
            <div className="section-shell flex items-center justify-between gap-4 border-b border-black/5 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-smoke">
                  AI Assistant
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                  Describe your rhythm and I will personalize the site.
                </h2>
                <p className="mt-2 text-sm text-smoke">
                  Your conversation is saved, so you can close this and come back anytime.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onResetSession}
                  className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-smoke transition hover:-translate-y-0.5 hover:text-ink hover:shadow-panel"
                >
                  Reset session
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:shadow-panel"
                >
                  Keep browsing
                </button>
              </div>
            </div>

            <div className="section-shell grid min-h-0 flex-1 gap-6 py-6 lg:grid-cols-[1.2fr,0.8fr]">
              <div className="flex min-h-0 flex-col rounded-[32px] border border-[#d9deee] bg-white/92 shadow-[0_30px_80px_-36px_rgba(58,73,221,0.22)]">
                <div className="flex items-center justify-between border-b border-black/6 px-6 py-4">
                  <div>
                    <div className="text-sm font-semibold text-ink">Conversation</div>
                    <div className="mt-1 text-sm text-smoke">
                      Ask for the wearable that best matches your needs.
                    </div>
                  </div>
                  {isLoading ? (
                    <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      Thinking
                    </div>
                  ) : null}
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
                  {messages.map((message, index) => (
                    <motion.div
                      key={`${message.role}-${index}-${message.content}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`max-w-2xl rounded-[28px] px-5 py-4 ${
                        message.role === "user"
                          ? "ml-auto bg-[linear-gradient(135deg,#5968ff,#7481ff)] text-white shadow-[0_20px_45px_-28px_rgba(89,104,255,0.9)]"
                          : "border border-[#dbe1f2] bg-[#f8faff] text-ink"
                      }`}
                    >
                      <div className={`text-xs font-semibold uppercase tracking-[0.16em] ${message.role === "user" ? "text-white/75" : "text-smoke"}`}>
                        {message.role === "user" ? "You" : "PulseWear AI"}
                      </div>
                      <p className="mt-2 text-sm leading-7 sm:text-base">
                        {message.content}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="border-t border-white/10 px-4 py-4 sm:px-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {starterPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setDraft(prompt)}
                        className="rounded-full border border-[#d7dff7] bg-[#f4f7ff] px-3 py-2 text-left text-xs font-medium text-[#34426f] transition hover:-translate-y-0.5 hover:border-accent/30 hover:bg-white hover:text-ink"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      rows={3}
                      placeholder="I need a device that helps me balance workouts, sleep, and school..."
                      className="min-h-[92px] flex-1 rounded-[24px] border border-[#d8deef] bg-[#fcfdff] px-5 py-4 text-sm text-ink outline-none placeholder:text-smoke/70 focus:border-accent/40 focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !draft.trim()}
                      className="rounded-[24px] bg-ink px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-accentDeep disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
                    >
                      Personalize
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[32px] border border-[#d9deee] bg-[linear-gradient(135deg,#ffffff,#eef2ff)] p-6 text-ink shadow-[0_24px_65px_-34px_rgba(58,73,221,0.22)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-smoke">
                    Live Direction
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold">
                    {personalization.heroTitle}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-smoke">
                    {personalization.heroDescription}
                  </p>
                </div>

                <div className="rounded-[32px] border border-[#d9deee] bg-white/88 p-6 text-ink shadow-[0_20px_50px_-36px_rgba(24,33,56,0.18)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-smoke">
                    Website changes
                  </div>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-smoke">
                    <li><span className="font-semibold text-ink">Recommended device:</span> {personalization.recommendedProductName}</li>
                    <li><span className="font-semibold text-ink">Primary audience:</span> {personalization.focusAudience}</li>
                    <li><span className="font-semibold text-ink">Priority themes:</span> {personalization.priorities.join(", ")}</li>
                    <li><span className="font-semibold text-ink">CTA direction:</span> {personalization.ctaLabel}</li>
                    <li><span className="font-semibold text-ink">Featured segments:</span> {personalization.featuredSegments.join(", ")}</li>
                  </ul>
                </div>

                <div className="rounded-[32px] border border-[#d9deee] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(243,246,255,0.95))] p-6 text-ink shadow-[0_20px_50px_-36px_rgba(24,33,56,0.18)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-smoke">
                    Try next
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {personalization.followUpPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handlePromptClick(prompt)}
                        className="rounded-full border border-[#d7dff7] bg-[#f4f7ff] px-3 py-2 text-left text-xs font-medium text-[#34426f] transition hover:-translate-y-0.5 hover:border-accent/30 hover:bg-white hover:text-ink"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
