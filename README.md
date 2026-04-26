# spr26-Team-17 (sliders branch)

Browser extension **PageTune** in `extension/`: a collapsible side panel with **sliders** for text and image size, **heuristic page analysis** (no network), optional **OpenAI** summary and a **separate chat** for page-specific help (not a product filter like the `main` prototype).

## Run in Chrome (dev)

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. **Load unpacked** → choose the `extension` folder inside this repo (not the repo root)

4. **Options** (set an API key for AI features): extension tile → “Options” or the toolbar menu → “Options (API key)”

### Test from Cursor (no manual “Load unpacked”)

The editor’s **Simple Browser** cannot load your unpacked extension, so use a **Task** that starts Chrome with `--load-extension`:

1. **Command Palette** (`Cmd+Shift+P`) → **Tasks: Run Task**
2. Choose **PageTune: open Chrome with extension (test page)**

That opens Chrome in a separate window (still launched from Cursor) with PageTune enabled and a Wikipedia article loaded. The profile folder is `.chrome-pagetune-profile/` (gitignored).

## Safari

Safari 14+ can wrap the same web extension. In Xcode: **File → New → Project → Multiplatform / Safari Extension App** (or add a “Safari Web Extension” target), then use Apple’s [converter or manual copy](https://developer.apple.com/documentation/safariservices/safari_web_extensions) to import the `extension` folder. The manifest and paths match Chrome-style MV3; host permissions and APIs may need small Xcode / entitlements checks.

## What works without AI

- **Static analysis**: main-like region, text length, search hints, form/link counts.
- **Sliders**: scales root text size and media zoom for the current tab.

## What needs an API key

- **AI summary** button (uses static snapshot + one model call)
- **Chat** (full conversational turns, page context in the system layer)

## Privacy

- Analysis runs locally until you use AI. API calls are made from the **service worker** to OpenAI; only the data you see in the panel context is sent. Review keys and terms for your class.

## Team

- Kwame Asante, Ein Jun, Victor P. (and current contributors) — list names here as the roster settles.
