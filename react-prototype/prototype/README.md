# PulseWear Marketing Site

A polished React marketing site for a fictional smart wearable company called PulseWear. The site includes a modern home page plus dedicated marketing pages for PulseBand, PulseRing, and PulseWatch.

## Stack

- React
- React Router
- Tailwind CSS
- Framer Motion
- Vite

## Run locally

```bash
npm install
npm run dev
```

## Gemini setup

1. In **`react-prototype/prototype/`** (same folder as `package.json`), copy the template and add your key:

   ```bash
   cp .env.example .env
   ```

2. Edit **`.env`** — no quotes around the key value unless your shell requires escaping:

```bash
GEMINI_API_KEY=paste_your_real_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Do **not** commit `.env` (see `.gitignore`). **`.env.example`** is tracked with empty `GEMINI_API_KEY` as a checklist.

Restart `npm run dev` after editing `.env` so Vite reloads secrets into the **`/api/gemini-chat`** middleware.

**Prompt routing:** deterministic matches (`server/chatTestMatrix.js`) run **before** Gemini. To exercise the API with your key quickly, send a message **not** in `test_promtps.txt`, or add `SKIP_CANONICAL_CASES=1` (also in `.env.example` notes) — same variable works on **Vercel** env vars for `api/gemini-chat.js`.

The React app calls **`POST /api/gemini-chat`**. In dev this is wired in **`vite.config.js`**; deployed behavior uses **`api/gemini-chat.js`** — set **`GEMINI_API_KEY`** and **`GEMINI_MODEL`** there as well (e.g. in the Vercel dashboard).

## Test prompts & expected behavior

See **`test_promtps.txt`** in this folder for scripted cases, expected assistant lines, and suggested edge cases for team review.

## Build

```bash
npm run build
```

## Routes

- `/`
- `/pulseband`
- `/pulsering`
- `/pulsewatch`

## Deploy on Vercel

This repo includes Vercel config for both flows:

- Deploying from the repo root
- Deploying with `prototype` as the Root Directory

If you import the whole repo on Vercel, use:

- Framework Preset: `Other`
- Root Directory: leave default

The root `vercel.json` handles install, build, and SPA output for the `prototype` app.
