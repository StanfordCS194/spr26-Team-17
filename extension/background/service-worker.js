/* global chrome */

async function getSettings() {
  const s = await chrome.storage.sync.get(["apiKey", "model", "aiEnabled"]);
  return {
    apiKey: s.apiKey || "",
    model: s.model || "gpt-4o-mini",
    aiEnabled: s.aiEnabled !== false,
  };
}

/** @param {any[]} contextMessages system + user */
async function openaiChat(apiKey, model, messages) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 800,
      temperature: 0.4,
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error("OpenAI: " + r.status + " " + t);
  }
  const j = await r.json();
  const c = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  if (!c) throw new Error("Unexpected response");
  return String(c);
}

function buildContextMessagesForAnalyze(staticPayload) {
  return [
    {
      role: "system",
      content:
        "You help users understand a web page they are viewing. " +
        "You receive a JSON snapshot from our extension (heuristics, sample text, URL). " +
        "In 2–4 short sentences, describe what the page is likely for and how a user can search or get what they need. " +
        "Be concrete. If uncertain, say what is unclear. Do not invent features that are not suggested by the data.",
    },
    {
      role: "user",
      content: JSON.stringify(staticPayload).slice(0, 12000),
    },
  ];
}

function buildContextMessagesForChat({ userMessage, history, pageContext }) {
  const historySlice = (history || [])
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content }));
  return [
    {
      role: "system",
      content:
        "You are a helpful browser assistant. The user is on a real web page. " +
        "You have a JSON summary of the page (URL, title, heuristics, and a text sample). " +
        "Help them decide what to search, click, or read next. Be practical and short unless they ask for detail. " +
        "If you cannot see the page, rely on the summary only and do not claim you rendered the full DOM. " +
        "Page context:\n" +
        JSON.stringify(pageContext).slice(0, 10000),
    },
    ...historySlice,
    { role: "user", content: userMessage },
  ];
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === "PING") {
    sendResponse({ ok: true });
    return;
  }
  if (msg && msg.type === "TUNE_ANALYZE") {
    (async () => {
      const settings = await getSettings();
      if (!settings.apiKey) {
        sendResponse({ ok: false, error: "Add an API key in PageTune options to enable AI." });
        return;
      }
      if (!settings.aiEnabled) {
        sendResponse({ ok: false, error: "AI is turned off in options." });
        return;
      }
      const messages = buildContextMessagesForAnalyze(msg.static);
      const text = await openaiChat(settings.apiKey, settings.model, messages);
      sendResponse({ ok: true, text });
    })();
    return true;
  }
  if (msg && msg.type === "TUNE_CHAT") {
    (async () => {
      const settings = await getSettings();
      if (!settings.apiKey) {
        sendResponse({ ok: false, error: "Add an API key in PageTune options." });
        return;
      }
      if (!settings.aiEnabled) {
        sendResponse({ ok: false, error: "AI is turned off in options." });
        return;
      }
      const messages = buildContextMessagesForChat({
        userMessage: msg.text,
        history: msg.history,
        pageContext: msg.pageContext,
      });
      const reply = await openaiChat(settings.apiKey, settings.model, messages);
      sendResponse({ ok: true, text: reply });
    })();
    return true;
  }
  return false;
});
