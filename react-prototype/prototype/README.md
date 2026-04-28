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

Create a local `.env` in `react-prototype/prototype` with:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

The React app sends assistant requests to `/api/gemini-chat`. In local Vite dev, that route is handled by the Vite server middleware. In deployment, the same path is served by `api/gemini-chat.js`.

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
