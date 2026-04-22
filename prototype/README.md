# StrideOS Conversational Storefront

A self-contained prototype for a chat-driven sportswear storefront. The shopper types a request in natural language, and the page updates the catalogue, active filters, shopping brief, and comparison view.

## Open It

Open `index.html` in a browser. No build step or local server is required.

## Deploy on Vercel

Import the GitHub repository into Vercel and use these project settings:

- Framework Preset: Other
- Root Directory: `prototype`
- Build Command: leave blank
- Output Directory: `.`

The included `vercel.json` keeps the static prototype serving from `index.html`, including direct visits to nested paths.

## What It Demonstrates

- Chat messages become structured storefront state.
- Product cards update without page navigation.
- The catalogue contains 50 hand-authored sportswear items interleaved with 50 generated filler items for larger-scale testing.
- The UI supports activity, product type, brand, color, price, size, fit, use case, and performance feature filters.
- The assistant can compare the top two visible products.
- Product cards use 100 cached real product photos in `assets/search-images`, selected from image-search results to match each item name; canvas drawings remain as a fallback if a local image cannot load.

## Production Path

The current intent parser is deterministic JavaScript so the prototype runs anywhere. In production, replace `parseIntent()` in `app.js` with a backend or LLM call that returns the same shape of structured filters and actions.

Recommended production flow:

```txt
User chat message
  -> intent extraction
  -> product database/search query
  -> structured UI state
  -> adaptive frontend render
```
