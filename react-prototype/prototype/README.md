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
