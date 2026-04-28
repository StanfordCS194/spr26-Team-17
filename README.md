Kwame Asante
 
Ein Jun

Victor P.

Akira Tran

---

# spr26-Team-17

Course project repo: marketing prototypes, tooling, and the **PulseWear** AI-assisted storefront experiment.



## Where the main PulseWear app lives

- **`react-prototype/prototype/`** — React + Vite site (home + PulseBand / PulseRing / PulseWatch), AI overlay, Gemini-backed chat API under `/api/gemini-chat`.
- **`react-prototype/prototype/server/geminiHandler.js`** — Handles chat `POST`s: **canonical/static rules run first**, then **Google Gemini** with JSON personalization when nothing matches (`SKIP_CANONICAL_CASES=1` skips rules and forces the model).
- **`react-prototype/prototype/server/chatTestMatrix.js`** — Deterministic intents + replies + personalization for demos and QA (saves quota on matched prompts).

Full run instructions, `.env`, and routes are in **`react-prototype/prototype/README.md`**.

## Behavioral spec & tests

- **`react-prototype/prototype/test_promtps.txt`** — User prompts, expected chat lines, expected site behaviors, plus extra edge cases for review.

## Other folders you might see

- **`prototype/`** — Original StrideOS-style static storefront (`index.html`).
- **`prototypes/adaptive-layer/`** — Separate embed prototype (not required for PulseWear React).

## Quick start (PulseWear React)

```bash
cd react-prototype/prototype
npm install
npm run dev
```

For the LLM path, copy **`react-prototype/prototype/.env.example`** to **`.env`**, paste your **`GEMINI_API_KEY`**, and set **`GEMINI_MODEL=gemini-2.5-flash`** — see **`react-prototype/prototype/README.md`**. Canonical prompts work without an API key.

