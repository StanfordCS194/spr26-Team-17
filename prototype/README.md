# StrideOS Conversational Storefront

A self-contained prototype for a chat-driven sneaker storefront. The shopper types a request in natural language, and the page updates the catalogue, active filters, shopping brief, and comparison view.

## Open It

Open `index.html` in a browser. No build step or local server is required.

## What It Demonstrates

- Chat messages become structured storefront state.
- Product cards update without page navigation.
- The UI supports sport, brand, color, price, size, width, court surface, and performance feature filters.
- The assistant can compare the top two visible products.
- Product cards use external demo image URLs gathered from web/product-CDN results, with local canvas drawings as a fallback if a third-party image fails to load.

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
