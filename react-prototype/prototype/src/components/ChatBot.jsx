import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";

const starterMessages = [
  {
    id: "welcome",
    role: "assistant",
    text: "Let me find the right PulseWear for you. Which of these sounds most like you?"
  }
];

const identityOptions = [
  "Stay active and healthy",
  "Keep things simple and efficient",
  "Stay on top of everything",
  "Enjoy the latest tech",
  "Something else..."
];

const identityResponses = {
  "Stay active and healthy":
    "Great fit. I would start by matching you with PulseWear options that make activity, recovery, and health tracking easy to follow.",
  "Keep things simple and efficient":
    "Got it. I will keep the recommendation focused on everyday usefulness, simple controls, and the features that matter most.",
  "Stay on top of everything":
    "Makes sense. I will focus on devices that help you manage notifications, calls, reminders, and packed days without adding friction.",
  "Enjoy the latest tech":
    "Nice. I will point you toward the most advanced PulseWear options with premium sensors, smarter features, and stronger performance."
};

const followUpActions = {
  "Stay active and healthy": [
    "Compare fitness features",
    "Best for workouts",
    "Track health metrics"
  ],
  "Keep things simple and efficient": [
    "Quick recommendation",
    "Compare essentials",
    "Best everyday option"
  ],
  "Stay on top of everything": [
    "Productivity features",
    "Notifications and calls",
    "Best for busy schedules"
  ],
  "Enjoy the latest tech": [
    "Premium models",
    "Advanced features",
    "Compare top devices"
  ]
};

function ChatIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(starterMessages);
  const [selectedIdentity, setSelectedIdentity] = useState("");
  const [customIdentity, setCustomIdentity] = useState("");
  const [awaitingCustomIdentity, setAwaitingCustomIdentity] = useState(false);
  const inputRef = useRef(null);

  function addUserMessage(text) {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmedText
      }
    ]);
    setDraft("");
  }

  function addAssistantMessage(text) {
    setMessages((current) => [
      ...current,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text
      }
    ]);
  }

  function handleIdentitySelect(identity) {
    if (identity === "Something else...") {
      setSelectedIdentity(identity);
      setAwaitingCustomIdentity(true);
      addUserMessage(identity);
      addAssistantMessage("Tell me a little about what you are looking for, and I will shape the recommendation around that.");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    setSelectedIdentity(identity);
    setAwaitingCustomIdentity(false);
    addUserMessage(identity);
    addAssistantMessage(identityResponses[identity]);
  }

  function handleFreeformMessage(text) {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    addUserMessage(trimmedText);

    if (awaitingCustomIdentity) {
      setCustomIdentity(trimmedText);
      setAwaitingCustomIdentity(false);
      addAssistantMessage(`Thanks, that helps. I will treat "${trimmedText}" as your starting point and recommend PulseWear options around that need.`);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleFreeformMessage(draft);
  }

  const visibleActions = selectedIdentity && selectedIdentity !== "Something else..."
    ? followUpActions[selectedIdentity] || []
    : [];

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open ? (
          <motion.section
            key="chat-panel"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 flex h-[min(620px,calc(100vh-7rem))] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_28px_90px_-32px_rgba(20,20,30,0.38)]"
            aria-label="PulseWear chat assistant"
          >
            <header className="flex items-center justify-between gap-4 border-b border-line bg-ink px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/12 text-white">
                  <ChatIcon />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">IMarketer</h2>
                  <p className="mt-0.5 text-xs text-white/65">UI preview</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <CloseIcon />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto bg-canvas/45 px-4 py-5">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] rounded-[20px] px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.role === "user"
                        ? "bg-accent text-white"
                        : "border border-line bg-white text-ink"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {!selectedIdentity ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {identityOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleIdentitySelect(option)}
                      className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-smoke shadow-sm transition hover:border-accent/35 hover:text-ink"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}

              {visibleActions.length ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {visibleActions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => addUserMessage(action)}
                      className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-smoke shadow-sm transition hover:border-accent/35 hover:text-ink"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              ) : null}

              {customIdentity ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {["Show my best match", "Compare options", "Start with essentials"].map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => addUserMessage(action)}
                      className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-smoke shadow-sm transition hover:border-accent/35 hover:text-ink"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-line bg-white p-3">
              <div className="flex items-end gap-2 rounded-[20px] border border-line bg-canvas/60 p-2 focus-within:border-accent/45">
                <label htmlFor="chat-message" className="sr-only">
                  Message PulseWear assistant
                </label>
                <textarea
                  id="chat-message"
                  value={draft}
                  ref={inputRef}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleFreeformMessage(draft);
                    }
                  }}
                  rows="1"
                  placeholder="Ask about devices, sizing, or features"
                  className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-5 text-ink outline-none placeholder:text-smoke/70"
                />
                <button
                  type="submit"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white transition hover:bg-accentDeep disabled:cursor-not-allowed disabled:bg-smoke/35"
                  disabled={!draft.trim()}
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>
              </div>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group relative grid h-16 w-16 place-items-center rounded-full bg-ink text-white shadow-[0_20px_55px_-22px_rgba(0,0,0,0.7)] transition hover:-translate-y-0.5 hover:bg-accent"
        aria-label={open ? "Hide chat" : "Open chat"}
        aria-expanded={open}
      >
        <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-white bg-accent" />
        <ChatIcon />
      </button>
    </div>
  );
}
