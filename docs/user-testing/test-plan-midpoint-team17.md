# Midpoint user-flow script — draft (from voice memo)

**What this is:** A **working draft** moderator outline derived from the team voice discussion around **Demo Day 2** / `New Recording 8`. Use it as raw material while authoring **[`user-testing-plan.md`](./user-testing-plan.md)**.

**What this is not:** The submitted **CS194W user testing plan** on its own — complete `user-testing-plan.md` for external testers.

**Product focus:** Personalizable YouTube showcase (chat-driven layout, theme, and feed behavior; mock catalog by default).  
**Source materials:** Course doc *Planning To Learn From User Testing* + team voice memo. **In this repo:** [`new-recording-8.m4a`](./new-recording-8.m4a) and Whisper transcripts [`new-recording-8-transcript-whisper-small.txt`](./new-recording-8-transcript-whisper-small.txt) / [`…-plain`](./new-recording-8-transcript-whisper-small-plain.txt).

**Companion (quote-level synthesis from Demo Day 2):** [demo-day-2-feedback.md](./demo-day-2-feedback.md)

**Wiki / PM:** Hub page — [User Testing Plan](https://github.com/StanfordCS194/spr26-Team-17/wiki/User-Testing-Plan) on the GitHub Wiki. Capture feedback in **one** medium (see Section 4).

---

## 1. Learning goals (what we want to learn)

From the voice discussion (where audio was clear), we care especially about:

- Whether testers **understand** that the page can **change sequentially** (over the conversation) rather than as a one-shot “flash” update.
- How **different audiences** (e.g. comfort with density, age, familiarity with YouTube-like UIs) react to **the same underlying app** when the chat steers emphasis (information density, layout, what’s surfaced first).
- Whether **chat-first personalization** feels acceptable vs. implicit tracking: do users grasp that **conversation supplies intent** and the site adapts from that?
- Whether the experience feels useful for **information-heavy** or **commerce-adjacent** narratives (present content the way the user wants to consume it).

Map these to the assignment’s buckets:

| Assignment area | How we’ll touch it in this test |
|-----------------|----------------------------------|
| Basic functionality | Home loads, chat sends, visible page updates, reload persistence (cookie visitor). |
| UI / experience comparison | Optional A/B: two starter prompts (minimal vs. rich UI) — same build, different chat instructions. |
| Core benefit | “Site matches how I want to browse/watch” — qualitative + task success. |
| Performance (light) | Long session: several prompts in a row; note lag, failed patches, stuck UI. |

---

## 2. Welcome & orientation (≤2 min)

**Script (facilitator):**

- Thanks for helping; this is a **prototype**, not production YouTube.
- **Built for:** people who want a familiar video homepage that **reshapes** (layout, theme, filters) based on **what they ask for in chat**.
- **Today:** ~10–15 minutes; we’re testing the experience, not you.
- **Today’s mode:** mock video catalog unless your team has explicitly enabled real YouTube mode.
- **Think-aloud encouraged:** say what you expect before you click; react out loud.

---

## 3. Tester profile (capture on intake)

Record: age range (optional), rough “how often do you use YouTube?”, comfort with AI/chat in products.

**Why:** aligns with discussion about older vs younger users and different consumption preferences.

---

## 4. Feedback mechanism (pick one for the session)

Recommended for speed: **observer + structured notes** (or **GitHub issues** after the session with a template).

- If **observer notes:** use a single doc with columns: time | observation | severity (low/med/high) | suggested label (bug / UX / idea).
- If **form:** same questions every time (see Section 7).

Keep **one** medium per assignment guidance.

---

## 5. Intervention policy

- By default: **try on your own**; use chat as you would with a product.
- If stuck **>2 minutes** on the same subtask, facilitator may give **one** hint.
- If a **crash or blank page** occurs, stop timer, note it, restart if possible.

---

## 6. Task flow (target 10–15 min)

**Pre-baked starter (course suggests at least one):**

1. **Land on home** — “What do you think this site is for?” (open question, no leading.)
2. **First chat** — Use one team-approved starter prompt (e.g. theme or layout). *Success:* visible change within ~30s or clear system feedback.
3. **Second chat** — Change something *different* (e.g. density, rows, hide shorts, mood). *Success:* two distinct changes or explained limitation.
4. **Reload test** — Refresh. *Success:* personalization **mostly** survives (visitor cookie); note gaps.
5. **Watch path** — Open a video if your build supports it. *Success:* player or clear affordance.
6. **Stretch (optional)** — “Imagine you’ll use this weekly for a month” — what would you **distrust** or **want locked**?

After step 6, invite open exploration until time ends.

---

## 7. Post-session debrief (5 min)

Ask the same four every time:

1. What felt **most valuable**?
2. What felt **confusing or risky** (especially **chat** vs **tracking**)?
3. Did changes feel **one-off** or **something that could evolve** over a session?
4. One change you’d **ship first** vs **never ship**?

---

## 8. Deliverables checklist (assignment)

- [ ] Test plan linked from **team Wiki**
- [ ] **Printed or on a screen** at midpoint review
- [ ] **Actionable results:** groomed issues / table of findings with owners

---

## 9. Appendix — Voice memo themes (partial transcript)

*Use as design rationale, not as verbatim tester script.*

- Sequential / evolving page changes vs a single “flash” update.
- Serving **different demographics** with different emphasis through the same shell.
- **Chat** as the way to learn intent vs silent tracking.
- Presenting dense information in the shape the viewer wants (discussion referenced examples like adapting how one scrolls or reads archives).
- Reducing burden through **conversation** rather than guessing from behavior alone.

*Prefer the Whisper transcript linked at the top for full wording; legacy auto-transcription missed many segments.*
