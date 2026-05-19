import type { Patch } from '@showcase/shared';
import type { ShowcaseInstallConfig } from './index';

interface ChatUiArgs {
  config: ShowcaseInstallConfig;
  visitorIdPromise: Promise<string>;
  scan: () => { config: any };
  applyPatch: (patch: Patch) => void;
  reset: () => Promise<void>;
}

export function mountInstallChat({ config, visitorIdPromise, scan, applyPatch, reset }: ChatUiArgs): { destroy(): void } {
  const host = document.createElement('div');
  host.setAttribute('data-showcase-chat-host', '');
  const shadow = host.attachShadow({ mode: 'open' });
  document.body.appendChild(host);

  const apiBaseUrl = config.apiBaseUrl ?? window.location.origin;
  const state = {
    open: true,
    busy: false,
    history: [] as Array<{ role: 'user' | 'assistant'; content: string }>,
  };

  shadow.innerHTML = `
    <style>
      :host { all: initial; color-scheme: light dark; }
      .launcher, .panel, .panel * { box-sizing: border-box; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .launcher {
        position: fixed; right: 22px; bottom: 22px; z-index: 2147483647;
        border: 0; border-radius: 999px; background: #ff0033; color: white;
        font-weight: 800; padding: 13px 17px; box-shadow: 0 14px 40px rgba(0,0,0,.24); cursor: pointer;
      }
      .panel {
        position: fixed; right: 22px; bottom: 78px; z-index: 2147483647; width: min(390px, calc(100vw - 28px));
        height: min(560px, calc(100vh - 108px)); display: flex; flex-direction: column;
        border: 1px solid rgba(128,128,128,.32); border-radius: 14px; overflow: hidden;
        background: color-mix(in srgb, Canvas 96%, transparent); color: CanvasText;
        box-shadow: 0 22px 70px rgba(0,0,0,.28); backdrop-filter: blur(14px);
      }
      .panel[hidden] { display: none; }
      header { align-items: center; border-bottom: 1px solid rgba(128,128,128,.22); display: flex; gap: 8px; justify-content: space-between; padding: 12px 14px; }
      strong { font-size: 14px; }
      .actions { align-items: center; display: flex; gap: 8px; }
      .reset { background: rgba(128,128,128,.12); border: 1px solid rgba(128,128,128,.26); border-radius: 999px; color: inherit; cursor: pointer; font-size: 11px; font-weight: 800; padding: 5px 8px; }
      .close { background: transparent; border: 0; color: inherit; cursor: pointer; font-size: 20px; line-height: 1; }
      .messages { display: flex; flex: 1; flex-direction: column; gap: 8px; overflow: auto; padding: 14px; }
      .msg { border-radius: 12px; font-size: 13px; line-height: 1.4; max-width: 88%; padding: 9px 11px; white-space: pre-wrap; }
      .user { align-self: flex-end; background: #ff0033; color: white; }
      .assistant { align-self: flex-start; background: rgba(128,128,128,.14); color: inherit; }
      form { border-top: 1px solid rgba(128,128,128,.22); display: flex; gap: 8px; padding: 10px; }
      input { flex: 1; min-width: 0; border: 1px solid rgba(128,128,128,.35); border-radius: 999px; padding: 10px 12px; background: Canvas; color: CanvasText; }
      button[type="submit"] { border: 0; border-radius: 999px; background: #ff0033; color: #fff; cursor: pointer; font-weight: 800; padding: 0 14px; }
      button:disabled { cursor: not-allowed; opacity: .55; }
    </style>
    <section class="panel" aria-label="Showcase personalization chat">
      <header><strong>Personalize</strong><div class="actions"><button class="reset" type="button">Reset</button><button class="close" type="button" aria-label="Close">×</button></div></header>
      <div class="messages" role="log" aria-live="polite"></div>
      <form>
        <input aria-label="Personalization request" placeholder="Ask to change this page" />
        <button type="submit">Send</button>
      </form>
    </section>
    <button class="launcher" type="button" hidden>Personalize</button>
  `;

  const panel = shadow.querySelector<HTMLElement>('.panel')!;
  const launcher = shadow.querySelector<HTMLButtonElement>('.launcher')!;
  const close = shadow.querySelector<HTMLButtonElement>('.close')!;
  const resetButton = shadow.querySelector<HTMLButtonElement>('.reset')!;
  const form = shadow.querySelector<HTMLFormElement>('form')!;
  const input = shadow.querySelector<HTMLInputElement>('input')!;
  const submit = shadow.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const messages = shadow.querySelector<HTMLElement>('.messages')!;

  function setOpen(open: boolean) {
    state.open = open;
    panel.hidden = !open;
    launcher.hidden = open;
    if (open) input.focus();
  }

  function appendMessage(role: 'user' | 'assistant', text: string) {
    const node = document.createElement('div');
    node.className = `msg ${role}`;
    node.textContent = text;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
    return node;
  }

  async function send(text: string) {
    if (state.busy) return;
    state.busy = true;
    submit.disabled = true;
    appendMessage('user', text);
    const assistantNode = appendMessage('assistant', '');
    let assistantText = '';
    try {
      const visitorId = await visitorIdPromise;
      const res = await fetch(`${apiBaseUrl}/api/install/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: config.siteId,
          visitorId,
          message: text,
          pageSnapshot: scan().config,
          history: state.history,
        }),
      });
      if (!res.body) throw new Error(`Chat failed: ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          const ev = JSON.parse(data);
          if (ev.kind === 'text') {
            assistantText += ev.text;
            assistantNode.textContent = assistantText;
          }
          if (ev.kind === 'patch') applyPatch(ev.patch as Patch);
          if (ev.kind === 'error') assistantNode.textContent = ev.message;
        }
      }
      state.history.push({ role: 'user', content: text }, { role: 'assistant', content: assistantText || 'Done.' });
      if (!assistantNode.textContent) assistantNode.textContent = 'Done.';
    } catch (error) {
      assistantNode.textContent = (error as Error).message;
    } finally {
      state.busy = false;
      submit.disabled = false;
    }
  }

  close.addEventListener('click', () => setOpen(false));
  resetButton.hidden = !config.debug;
  resetButton.addEventListener('click', async () => {
    resetButton.disabled = true;
    try {
      await reset();
    } catch (error) {
      appendMessage('assistant', (error as Error).message);
      resetButton.disabled = false;
    }
  });
  launcher.addEventListener('click', () => setOpen(true));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    void send(text);
  });

  appendMessage('assistant', 'Tell me how you want this page to feel.');

  return {
    destroy() {
      host.remove();
    },
  };
}
