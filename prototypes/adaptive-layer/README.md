# Adaptive layer (first-party embed) — class prototype

This folder sketches how **website owners** could adapt a page using:

1. **Static analysis** of the DOM (main region, pricing/CTA cues, search, length).
2. **Lightweight intent labels** derived from those signals (not “demographics”).
3. **Rule-based** `data-pt-variant` (`default` | `focus-cta` | `search-first` | `reading`).
4. **Mock “AI fallback”** (`mockAiDirective`) — **no network**; swap for a backend LLM call **after consent** in a real product.

## Try it

Open `demo-page.html` in a normal browser (double-click or static server). The black panel shows the JSON profile and which path ran.

## Ethics / scope

For course exploration only. A production version needs **consent**, **data minimization**, and **no protected-class inference** from tracking.
