# Demo Day 2 — User Feedback Report

**Team 17 · Spring 2026 · CS194**
**Session:** New Recording 8 · **Transcript:** `new-recording-8-transcript-whisper-small.txt`

> This document captures direct user feedback from Demo Day 2 plus transcript-sourced themes. It is a product feedback artifact — see [`user-testing-plan.md`](./user-testing-plan.md) for the formal course test plan assignment.

---

## Summary

| Priority  | Count |
| --------- | ----- |
| 🔴 High   | 4     |
| 🟡 Medium | 3     |
| 🟢 Low    | 2     |
| **Total** | **9** |

---

## Feedback Log

### 🔴 High Priority

---

#### FB-01 · Reels-only filter

| Field      | Detail                          |
| ---------- | ------------------------------- |
| **User**   | User 1                          |
| **Quote**  | _"Can we only show the reels."_ |
| **Theme**  | Content Filtering               |
| **Source** | Demo Day 2 — direct             |

Users want a mode or toggle that restricts the video grid to short-form / Reels content only, removing long-form videos entirely from view.

---

#### FB-02 · Vertical scroll feed

| Field      | Detail                                                 |
| ---------- | ------------------------------------------------------ |
| **User**   | User 2                                                 |
| **Quote**  | _"Can I scroll the videos instead of original setup."_ |
| **Theme**  | Navigation / Layout                                    |
| **Source** | Demo Day 2 — direct                                    |

Users expect a TikTok / Reels-style vertical scroll feed as an alternative to the current grid layout. The original grid felt unfamiliar and counter-intuitive for short-form content consumption.

---

#### FB-03 · Real-time personalization lag — theme & color changes

| Field           | Detail                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------- |
| **User**        | Multiple                                                                                           |
| **Quote**       | _"Change the color of the website and theme of the videos — it made changes but it took a while."_ |
| **Observed at** | ~1:06 PM, Demo Day 2                                                                               |
| **Theme**       | Edge Cases / Performance                                                                           |
| **Source**      | Demo Day 2 — direct                                                                                |

Users triggered a prompt to change the site's color scheme and video theme. The changes did eventually apply but with a noticeable delay. Users noticed and flagged it — this breaks the perception of a "live" personalization assistant. Needs a loading indicator at minimum, and a performance investigation for why core UI changes are slower than expected.

---

#### FB-04 · Core feature changes feel unreliable (edge case behaviour)

| Field      | Detail                   |
| ---------- | ------------------------ |
| **User**   | Multiple                 |
| **Theme**  | Edge Cases / Reliability |
| **Source** | Demo Day 2 — direct      |

Alongside the color/theme lag (FB-03), users surfaced a broader concern: prompts that touch core features (layout structure, theme, color system) do not always fully apply or do not apply at the same speed as lighter changes. Edge case handling for these deeper personalization requests needs explicit testing and scoping.

---

### 🟡 Medium Priority

---

#### FB-05 · Transition animations feel like a hard flash

| Field      | Detail                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **User**   | Multiple                                                                                                                              |
| **Quote**  | _"Making the transitions kind of smoother — more modern rather than just a flash and everything."_ / _"Maybe a sequential changing."_ |
| **Theme**  | UI Polish                                                                                                                             |
| **Source** | Demo Day 2 transcript `[05:23–05:35]`                                                                                                 |

When personalization updates apply, the entire page re-renders instantly ("flash"). Users want sequential, animated transitions that feel deliberate and modern rather than a sudden swap.

---

#### FB-06 · Preferences not obviously restored after reload

| Field      | Detail                                                    |
| ---------- | --------------------------------------------------------- |
| **User**   | Multiple                                                  |
| **Quote**  | _"When I reload the page it brings back my preferences."_ |
| **Theme**  | Persistence                                               |
| **Source** | Demo Day 2 transcript `[04:44–05:00]`, `[12:25–12:30]`    |

Persistence works in the backend but users are uncertain whether their layout survived a reload. No visible confirmation or indicator is shown. Needs either a toast / banner ("Your preferences were restored") or a visible version stamp.

---

#### FB-07 · Inspiration reference — Google Magic Pointer / AI cursor

| Field      | Detail                             |
| ---------- | ---------------------------------- |
| **User**   | Multiple                           |
| **Theme**  | Product Direction / Inspiration    |
| **Source** | Demo Day 2 — direct recommendation |

Users highlighted Google DeepMind's recently unveiled **Magic Pointer** (announced May 12 2026) as a potential source of inspiration. The project integrates Gemini AI directly into the mouse cursor, allowing users to point at on-screen elements and issue natural-language voice commands without switching to a separate chat window — the AI follows the cursor across all apps.

**Relevance to our product:** our current model requires users to type into a chat box to trigger personalization. Magic Pointer's "point-and-speak" paradigm (and its core design principle of eliminating app-switching between tools and AI) directly challenges whether a chat interface is the right interaction model long-term. Worth examining for the next design iteration.

**Try it:** experimental demos are live in [Google AI Studio](https://aistudio.google.com). Magic Pointer is rolling out in Gemini in Chrome and will be a headline feature of Googlebook laptops (due Fall 2026, via Acer, ASUS, Dell, HP, Lenovo).

---

### 🟢 Low Priority

---

#### FB-08 · Demo vs. real YouTube unclear to testers

| Field      | Detail                                |
| ---------- | ------------------------------------- |
| **User**   | Multiple                              |
| **Quote**  | _"It's not YouTube. It's not real."_  |
| **Theme**  | Onboarding Clarity                    |
| **Source** | Demo Day 2 transcript `[05:44–05:52]` |

Testers were confused about whether they were interacting with real YouTube or a demo shell. A first-load banner or onboarding tooltip should make this explicit.

---

#### FB-09 · Echo chamber / personalization ethics concern

| Field      | Detail                                                                                |
| ---------- | ------------------------------------------------------------------------------------- |
| **User**   | Multiple                                                                              |
| **Quote**  | _"It's an echo chamber — I'm not in favor of guiding the project in that direction."_ |
| **Theme**  | Ethics / Trust                                                                        |
| **Source** | Demo Day 2 transcript `[10:02–10:08]`                                                 |

Some testers raised discomfort that aggressive personalization could narrow content exposure. Consider documenting and surfacing the personalization boundaries (what the assistant will not optimize for) and adding opt-out or diversity controls.

---

## Themes Overview

| Theme                                  | Feedback Items |
| -------------------------------------- | -------------- |
| Edge Cases / Performance & Reliability | FB-03, FB-04   |
| Navigation / Layout                    | FB-01, FB-02   |
| UI Polish                              | FB-05          |
| Persistence                            | FB-06          |
| Product Direction / Inspiration        | FB-07          |
| Onboarding Clarity                     | FB-08          |
| Ethics / Trust                         | FB-09          |

_Source audio: [`new-recording-8.m4a`](./new-recording-8.m4a) · Transcript: [`new-recording-8-transcript-whisper-small.txt`](./new-recording-8-transcript-whisper-small.txt) · Speakers not diarized — attribute to "participant(s), Demo Day 2 transcript" unless names are assigned later._
