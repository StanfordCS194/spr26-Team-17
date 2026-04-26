/* global tuneRunStaticAnalysis, chrome */
(function () {
  if (window !== window.top) return;
  if (document.getElementById("tune-page-style")) return;

  const pageStyle = document.createElement("style");
  pageStyle.id = "tune-page-style";
  pageStyle.textContent = `
    html.tune-page {
      --tune-font: 1;
      --tune-img: 1;
    }
    html.tune-page {
      font-size: calc(100% * var(--tune-font, 1)) !important;
    }
    html.tune-page img,
    html.tune-page video,
    html.tune-page picture > img {
      zoom: var(--tune-img, 1);
    }
  `;
  (document.head || document.documentElement).appendChild(pageStyle);
  document.documentElement.classList.add("tune-page");
  document.documentElement.style.setProperty("--tune-font", "1");
  document.documentElement.style.setProperty("--tune-img", "1");

  const host = document.createElement("div");
  host.id = "tune-dock-host";
  host.setAttribute("data-tune-extension", "1");
  (document.body || document.documentElement).appendChild(host);

  const root = host.attachShadow({ mode: "open" });
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("content/panel.css");
  root.appendChild(link);

  const wrap = document.createElement("div");
  wrap.innerHTML = getPanelMarkup();
  root.appendChild(wrap);
  const dock = /** @type {HTMLDivElement} */ (wrap.querySelector("#tune-dock"));
  if (!dock) return;
  dock.classList.add("tune-dock--collapsed");

  const q = (sel) => /** @type {HTMLElement} */ (dock.querySelector(sel));
  const els = {
    railBtn: /** @type {HTMLButtonElement} */ (q("#tune-rail-btn")),
    closeBtn: /** @type {HTMLButtonElement} */ (q("#tune-close")),
    fontRange: /** @type {HTMLInputElement} */ (q("#tune-font")),
    fontVal: /** @type {HTMLSpanElement} */ (q("#tune-font-val")),
    imgRange: /** @type {HTMLInputElement} */ (q("#tune-img")),
    imgVal: /** @type {HTMLSpanElement} */ (q("#tune-img-val")),
    staticBox: /** @type {HTMLDivElement} */ (q("#tune-static")),
    confChip: /** @type {HTMLSpanElement} */ (q("#tune-conf")),
    metaLine: /** @type {HTMLParagraphElement} */ (q("#tune-meta")),
    aiBlock: /** @type {HTMLDivElement} */ (q("#tune-ai-block")),
    aiText: /** @type {HTMLParagraphElement} */ (q("#tune-ai-text")),
    aiErr: /** @type {HTMLParagraphElement} */ (q("#tune-ai-err")),
    btnAi: /** @type {HTMLButtonElement} */ (q("#tune-btn-ai")),
    chatToggle: /** @type {HTMLButtonElement} */ (q("#tune-chat-toggle")),
    chatSection: /** @type {HTMLDivElement} */ (q("#tune-chat-section")),
    messages: /** @type {HTMLDivElement} */ (q("#tune-messages")),
    input: /** @type {HTMLTextAreaElement} */ (q("#tune-user-input")),
    sendBtn: /** @type {HTMLButtonElement} */ (q("#tune-send")),
  };

  const storageKey = "tune-prefs";
  const chatHistory = /** @type {{ role: string, content: string }[]} */ ([]);

  let staticData = null;
  let lastPageContext = null;
  let chatOpen = false;
  let dockOpen = false;

  function getPanelMarkup() {
    return `
    <div class="tune-dock" id="tune-dock" aria-label="PageTune">
      <div class="tune-rail" title="PageTune">
        <button class="tune-rail-btn" type="button" id="tune-rail-btn" aria-controls="tune-dock" aria-expanded="false">PageTune</button>
      </div>
      <aside class="tune-panel" id="tune-panel" role="complementary" aria-label="Page tuning">
        <header class="tune-header">
          <div>
            <h2 class="tune-title">PageTune</h2>
            <p class="tune-hint">Text, images, and page-aware help</p>
          </div>
          <button class="tune-icon-btn" type="button" id="tune-close" title="Hide panel" aria-label="Hide panel">×</button>
        </header>
        <div class="tune-body">
          <div class="tune-block">
            <h3 class="tune-block-title">This page (static rules)</h3>
            <p class="tune-para" id="tune-static">Analyzing…</p>
            <div class="tune-chips">
              <span class="tune-chip" id="tune-conf">confidence —</span>
            </div>
            <p class="tune-tiny" id="tune-meta"></p>
            <div class="tune-actions">
              <button type="button" class="tune-btn tune-btn--primary" id="tune-btn-ai" disabled>AI summary</button>
            </div>
            <p class="tune-err" id="tune-ai-err" style="display:none" role="alert"></p>
            <div id="tune-ai-block" class="tune-block" style="display:none; margin:8px 0 0; padding:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px">
              <p class="tune-para" id="tune-ai-text"></p>
            </div>
          </div>
          <div class="tune-block">
            <h3 class="tune-block-title">Adjust</h3>
            <div class="tune-row">
              <span class="tune-label" id="label-font">Text size</span>
              <span class="tune-value" id="tune-font-val">100%</span>
            </div>
            <input class="tune-range" type="range" id="tune-font" min="80" max="150" step="1" value="100" aria-labelledby="label-font" />
            <div class="tune-row" style="margin-top:6px">
              <span class="tune-label" id="label-img">Image size</span>
              <span class="tune-value" id="tune-img-val">100%</span>
            </div>
            <input class="tune-range" type="range" id="tune-img" min="50" max="150" step="1" value="100" aria-labelledby="label-img" />
            <p class="tune-tiny">Scales the document root and media zoom. Some sites with heavy CSS may look uneven.</p>
          </div>
          <div class="tune-block">
            <div class="tune-row" style="margin-bottom:0">
              <h3 class="tune-block-title" style="margin:0">AI assistant</h3>
              <button class="tune-btn" type="button" id="tune-chat-toggle" aria-expanded="false">Open chat</button>
            </div>
            <p class="tune-tiny">Conversational help for this page. Configure an API key in extension options. Not a simple filter: use full sentences.</p>
            <div class="tune-chat" id="tune-chat-section" aria-label="AI chat">
              <div class="tune-messages" id="tune-messages" role="log" aria-live="polite"></div>
              <div class="tune-composer">
                <label class="tune-sr-only" for="tune-user-input">Message</label>
                <textarea class="tune-input" id="tune-user-input" placeholder="e.g. How do I narrow results on this page?" rows="3"></textarea>
                <button type="button" class="tune-btn tune-btn--primary" id="tune-send">Send</button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>`;
  }

  function setDock(open) {
    dockOpen = open;
    dock.className = "tune-dock" + (open ? " tune-dock--expanded" : " tune-dock--collapsed");
    els.railBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function readPrefs() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      /* ignore */
    }
    return { font: 100, img: 100 };
  }

  function writePrefs(p) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(p));
    } catch (e) {
      /* ignore */
    }
  }

  function applyFont(v) {
    const f = v / 100;
    document.documentElement.style.setProperty("--tune-font", String(f));
    els.fontVal.textContent = Math.round(v) + "%";
  }

  function applyImg(v) {
    const f = v / 100;
    document.documentElement.style.setProperty("--tune-img", String(f));
    els.imgVal.textContent = Math.round(v) + "%";
  }

  function runStatic() {
    staticData = typeof tuneRunStaticAnalysis === "function" ? tuneRunStaticAnalysis() : null;
    if (!staticData) {
      els.staticBox.textContent = "Could not analyze this page.";
      return;
    }
    els.staticBox.textContent = staticData.staticSummary;
    els.confChip.textContent = "confidence " + Math.round((staticData.confidence || 0) * 100) + "%";
    const t = (staticData.title || "(no title)").slice(0, 80);
    els.metaLine.textContent = "Title: " + t;
    lastPageContext = {
      title: staticData.title,
      url: staticData.url,
      hasSearchForm: staticData.hasSearchForm,
      mainSelector: staticData.mainSelector,
      textLength: staticData.textLength,
      textSample: staticData.textSample,
      staticSummary: staticData.staticSummary,
    };
    els.btnAi.disabled = false;
  }

  function showAiErr(m) {
    if (!m) {
      els.aiErr.style.display = "none";
      els.aiErr.textContent = "";
      return;
    }
    els.aiErr.textContent = m;
    els.aiErr.style.display = "block";
  }

  function loadAiSummary() {
    if (!staticData) return;
    showAiErr(null);
    els.btnAi.disabled = true;
    els.btnAi.textContent = "Loading…";
    chrome.runtime.sendMessage(
      { type: "TUNE_ANALYZE", static: staticData },
      (res) => {
        els.btnAi.disabled = false;
        els.btnAi.textContent = "AI summary";
        if (chrome.runtime.lastError) {
          showAiErr(chrome.runtime.lastError.message);
          return;
        }
        if (res && res.ok && res.text) {
          els.aiBlock.style.display = "block";
          els.aiText.textContent = res.text;
        } else {
          showAiErr((res && res.error) || "AI unavailable.");
        }
      }
    );
  }

  function setChatOpen(open) {
    chatOpen = open;
    els.chatSection.className = "tune-chat" + (open ? " tune-chat--open" : "");
    els.chatToggle.textContent = open ? "Close chat" : "Open chat";
    els.chatToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function appendMessage(role, text) {
    const b = document.createElement("div");
    b.className = "tune-bubble tune-bubble--" + (role === "user" ? "user" : "ai");
    b.textContent = text;
    els.messages.appendChild(b);
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function sendChat() {
    const t = (els.input.value || "").trim();
    if (!t) return;
    els.input.value = "";
    appendMessage("user", t);
    showAiErr(null);
    els.sendBtn.disabled = true;
    const history = chatHistory.map((m) => ({ role: m.role, content: m.content }));
    chatHistory.push({ role: "user", content: t });
    chrome.runtime.sendMessage(
      {
        type: "TUNE_CHAT",
        text: t,
        history: history,
        pageContext: lastPageContext,
      },
      (res) => {
        els.sendBtn.disabled = false;
        if (chrome.runtime.lastError) {
          showAiErr(chrome.runtime.lastError.message);
          return;
        }
        if (res && res.ok && res.text) {
          chatHistory.push({ role: "assistant", content: res.text });
          appendMessage("ai", res.text);
        } else {
          const err = (res && res.error) || "Chat failed.";
          showAiErr(err);
          chatHistory.pop();
        }
      }
    );
  }

  els.railBtn.addEventListener("click", () => setDock(!dockOpen));
  els.closeBtn.addEventListener("click", () => setDock(false));
  els.fontRange.addEventListener("input", () => {
    const v = Number(els.fontRange.value);
    applyFont(v);
    const p = readPrefs();
    p.font = v;
    writePrefs(p);
  });
  els.imgRange.addEventListener("input", () => {
    const v = Number(els.imgRange.value);
    applyImg(v);
    const p = readPrefs();
    p.img = v;
    writePrefs(p);
  });
  els.btnAi.addEventListener("click", loadAiSummary);
  els.chatToggle.addEventListener("click", () => setChatOpen(!chatOpen));
  els.sendBtn.addEventListener("click", sendChat);
  els.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sendChat();
    }
  });

  const p = readPrefs();
  els.fontRange.value = String(p.font);
  els.imgRange.value = String(p.img);
  applyFont(p.font);
  applyImg(p.img);
  setDock(false);
  setChatOpen(false);
  runStatic();
})();
