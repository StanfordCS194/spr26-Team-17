import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import AssistantDock from "./components/AssistantDock";
import AssistantOverlay from "./components/AssistantOverlay";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProductPage from "./components/ProductPage";
import HomePage from "./pages/HomePage";
import { buildAssistantResponse, getDefaultPersonalization } from "./utils/assistant";
import { productCatalog } from "./data/siteData";

const SESSION_STORAGE_KEY = "pulsewear-ai-session-v1";
const defaultMessages = [
  {
    role: "assistant",
    content:
      "Tell me what kind of life you are shopping for and I will reshape the PulseWear site around the best-fit device."
  }
];

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      requestAnimationFrame(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, location.hash]);

  return null;
}

function PageFrame({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}

export default function App() {
  const location = useLocation();
  const [aiModeOpen, setAiModeOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    if (typeof window === "undefined") return defaultMessages;

    try {
      const saved = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!saved) return defaultMessages;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed.messages) && parsed.messages.length ? parsed.messages : defaultMessages;
    } catch {
      return defaultMessages;
    }
  });
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [personalization, setPersonalization] = useState(() => {
    if (typeof window === "undefined") return getDefaultPersonalization();

    try {
      const saved = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!saved) return getDefaultPersonalization();
      const parsed = JSON.parse(saved);
      return parsed.personalization || getDefaultPersonalization();
    } catch {
      return getDefaultPersonalization();
    }
  });
  const sessionActive = messages.length > 1;

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        messages,
        personalization
      })
    );
  }, [messages, personalization]);

  function resetAssistantSession() {
    setMessages(defaultMessages);
    setPersonalization(getDefaultPersonalization());
    setAiModeOpen(false);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  async function handleAssistantMessage(input) {
    const nextMessages = [...messages, { role: "user", content: input }];
    setMessages(nextMessages);
    setIsAssistantLoading(true);

    try {
      const response = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: input,
          messages: nextMessages
        })
      });

      if (!response.ok) {
        let errorMessage = "Gemini request failed.";

        try {
          const payload = await response.json();
          if (payload?.error) errorMessage = payload.error;
        } catch {
          // Ignore parse failures and keep the default error message.
        }

        throw new Error(errorMessage);
      }

      const payload = await response.json();
      setPersonalization(payload.personalization);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: payload.reply }
      ]);
    } catch (error) {
      const fallback = buildAssistantResponse(input);
      setPersonalization(fallback.personalization);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `${fallback.reply} Gemini fallback: ${error instanceof Error ? error.message : "unknown error"}.`
        }
      ]);
      console.error("Gemini chat failed, using local fallback:", error);
    } finally {
      setIsAssistantLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <ScrollManager />
      <Navbar
        aiEnabled={aiModeOpen}
        onToggleAiMode={() => setAiModeOpen((value) => !value)}
      />
      <AnimatePresence mode="wait">
        <Routes location={location} key={`${location.pathname}${location.hash}`}>
          <Route
            path="/"
            element={
              <PageFrame>
                <HomePage personalization={personalization} />
              </PageFrame>
            }
          />
          {productCatalog.map((product) => (
            <Route
              key={product.slug}
              path={product.route}
              element={
                <PageFrame>
                  <ProductPage {...product} />
                </PageFrame>
              }
            />
          ))}
        </Routes>
      </AnimatePresence>
      <Footer />
      <AssistantDock
        visible={!aiModeOpen && sessionActive}
        personalization={personalization}
        messageCount={messages.length}
        onOpen={() => setAiModeOpen(true)}
        onReset={resetAssistantSession}
      />
      <AssistantOverlay
        open={aiModeOpen}
        messages={messages}
        isLoading={isAssistantLoading}
        personalization={personalization}
        onClose={() => setAiModeOpen(false)}
        onResetSession={resetAssistantSession}
        onSendMessage={handleAssistantMessage}
      />
    </div>
  );
}
