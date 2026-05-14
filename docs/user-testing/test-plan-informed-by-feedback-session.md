# Test plan grounding — sourced from feedback session transcript

This document translates an **internal team / feedback conversation** into **measurable user-testing themes** aligned with **Planning To Learn From User Testing** (welcome → setup → feedback mechanism → interventions → concrete tasks).

**Citation rule:** Quotations below are **verbatim strings** taken from [`new-recording-8-transcript-whisper-small.txt`](./new-recording-8-transcript-whisper-small.txt) (machine transcription, **OpenAI Whisper `small`**, VAD enabled). Speakers are **not diarized**; attribute only to *“participant(s), feedback session transcript”* unless your team assigns names afterward. Timestamps **`[MM:SS.xx]`** point to segment starts in that file.

---

## 1. What to submit / have ready (assignment checklist)

Mirror of course expectations—you still need:

1. **Test plan linked from team Wiki** (this file or a shortened wiki page linking here).
2. **Printed / on-screen copy** during midpoint review beside the prototype.
3. **Actionable outcomes** afterward (Issues, backlog, labeled findings) **cross-linked from Wiki**.
4. **Canvas / syllabus** — confirm separately whether staff expect an additional portal upload or deadline (not spelled out on the excerpt we summarized here).

Quotes here support **motivation & scope**, not substitutes for facilitator script or Issues.

---

## 2. Product thesis & realism (welcome / tester orientation helpers)

Tell testers plainly that the chrome is **YouTube-shaped** but may be **demo / mock**:

> "It's not YouTube." / "It's not real." / "Yeah."  
> — Transcript **`[05:44.52]`–`[05:52.52]`**

Contrast **one-shot flashy updates** vs **smooth, sequential personalization**—this emerged as desired polish:

> "I think also like making the transitions kind of smoother. So it looks more like ... More modern rather than just like a flash and everything."  
> — **`[05:23.52]`–`[05:30.52]`**

> "I think it's more like a ... Maybe a sequential changing."  
> — **`[05:34.52]`–`[05:35.52]`**

**Tester-facing angle:** Ask whether redesigns felt **immediate “flash cuts”** or **coherent unfolding** across prompts.

---

## 3. Demographics & tailoring (core benefit / exploratory tasks)

Hypothesis surfaced: **different people need different densities and UX emphasis**, not “one layout”:

> "So we have different demographics ... Like an old person engaging with ... lots of information versus a young person ... There are ... different kind of aspects that we want to focus ... we kind of ask ... a user ... How you wanna see the website ... And ... it's not only the algorithm ... It's also ... the UX design of the website ..."  
> — **`[06:34.52]`–`[07:04.68]`**

**Suggested task:** Rotate two **persona primes** verbally (minimal vs maximal information density before opening chat) → observe **first prompts** testers type.

---

## 4. Value beyond video grid (comparison / extrapolation prompts)

Discussants imagine **catalog / narrative / archival** contexts—usable as **bonus exploration** tasks after core YouTube-shell tasks.

**Wikipedia / reading-style layouts**

> "For example like Wikipedia ... It's the same in facts but ... If you want to scroll the information in a different way ... it can ... Present the information to you as you want to consume it."  
> — **`[08:20.10]`–`[08:44.10]`**

**E-commerce narrative**

> "... any e-commerce basically if you are buying something ... prepares all of the website and the narrative of the website ... For a tennis player viewing the website Not like ... just normal runner ... It's fine tuned to the user."  
> — **`[08:44.10]`–`[09:10.10]`**

**Other surfaces (Instagram)—expect pushback feasibility**

> "I feel like Instagram is one of the most ... Instagram is a bunch of stuff that I just don't want to see."  
> — **`[07:49.10]`–`[07:51.10]`**

**Interpretation:** keep **comparison questions optional** (“Where else would you want this wrapper?”)—note **confidence & ethical comfort**, not only feature requests.

---

## 5. Data pipeline & ethics (observe & probe without leading)

Discussants contrast **silent tracking vs explicit chat**:

> "But I think it depends on what is the pipeline of data is flowing ... we initially thought ... we are tracking the user's information ... Or and then we realize maybe we have to chat with the user ... And get that information ... And then change the website based on that."  
> — **`[09:13.10]`–`[09:28.10]`**

Concern about **commercial “echo chamber” pressure**:

> "So ... it's ... an echo chamber ... I'm not ... In favor of just guiding that project to that direction"  
> — **`[10:02.61]`–`[10:08.61]`**

**Interview probes:** *“When did personalization feel helpful versus creepy?”* *“What would you forbid the assistant from optimizing?”*

---

## 6. Memory, persistence & multi-session (functional + long-horizon)

Persistence & versioning expectations:

> "We ... save ... Preferences in a database ... when I ... Reload the page ... I can ... quit ... reopen ... And then it'll ... Load this ... Reference ... a previous version ... Like it'll do that."  
> — **`[04:44.52]`–`[05:00.52]`**

> "If you're able to keep user personalization ... Whenever someone reloads that page It brings back"  
> — **`[12:25.61]`–`[12:30.61]`**

**Suggested tasks:**

| # | Instruction to tester |
|---|------------------------|
| T1 | Send **two materially different prompts** → confirm visible layout/theme shift |
| T2 | **Hard refresh** → does prior personalization **persist**? |
| T3 | (Stretch) Mention **prior state** verbally—does tester expect time-travel / revert? Capture gap vs product |

---

## 7. Context & conversation design (interaction pattern)

Discussants reaffirm explicit chat over silent inference:

> "... how does it know I'm changing The UX ... Because user tells it ... You ... have to ... Chat type it."  
> — **`[12:11.61]`–`[12:20.61]`**

> "It lifts the ... burden ... from ... us."  
> — **`[11:55.61]`**

**Observe:** hesitation (“maybe”, “probably”) versus certainty after visual confirmation—markers of **trust calibration**.

---

## 8. Midpoint runbook (setup → intervention → scripted flow)

### 8.1 Tester setup & environment (rubric **setup**)

Cover this in **welcome**, before testers touch UI:

| Item | Decide / state aloud |
|------|----------------------|
| URL & entry | Stable demo link; bookmark or QR if allowed |
| Browser / device | One supported combo (avoid “doesn’t work on Safari” drift) |
| Demo vs prod | Explicit: **not real YouTube**; what is mocked vs live (see Section 2 quotes) |
| Accounts / deps | OAuth, `.env`, or seed—pre-flight so testers don’t unblock you |
| Data reset | Fresh session vs persisted state for this run (tie to Tasks T2–T3) |

Print or pin this mini-table beside the midpoint station.

### 8.2 When to intervene

Moderator norms—adapt to midpoint chaos:

| Intervene | Example |
|-----------|---------|
| **Prototype limits** | “This part is mocked; ignore auth errors beyond …” |
| **Stuck \> ~90 s same screen** | One nudge (“try saying X in chat”) then pause |
| **Scope creep** | Defer—“note for backlog”—return to scripted flow (**8.3**) |
| **Leading** | Don’t propose solutions until tester names friction first |

Stay otherwise **silent during think-aloud** unless safety or deadlock.

### 8.3 Pre-baked flow (5–12 minute backbone)

| Phase | Tester action |
|-------|----------------|
| 0 | Silent **30 s** skim home—think-aloud expectation |
| 1 | Prompt A: **pure aesthetic/theme** tweak |
| 2 | Prompt B: **differentiated content/category** cue (example “Only tech”; transcript **`[02:54.10]`–`[02:57.10]`**) |
| 3 | Reload → verbal rating **persistence clarity** (motifs at **`[04:48.52]`–`[05:00.52]`**) |
| 4 | Open-ended: name **another surface** besides YouTube (ties themes in Section 4) |

---

## 9. Feedback capture (pick **one** channel for study integrity)

| Mechanism | When to choose |
|-----------|----------------|
| Silent observer sheet | Busy midpoint; minimizes context switching |
| GitHub Issues template post-session | If engineering triage wins |

Minimal **observer fields:** time | verbatim utterance | screen state | `{bug, UX friction, expectation gap, ethics flag}` severity.

---

## 10. After midpoint → actionable backlog (submission III)

Normalize notes into Issues with labels **`user-test`**, **`priority`**, **`transcript-quote-id`** (timestamp) for traceability to sections above.

| Issue title | Supporting quote anchors |
|-------------|---------------------------|
| Transitions feel like single flash reload | **`[05:23.52]`**, **`[05:35.52]`** |
| Unclear persistence after hard refresh *(if observed)* | **`[04:48.52]`–`[05:00.52]`**, **`[12:25.61]`–`[12:30.61]`** |
| Tester unease—“echo chamber” framing | **`[09:13.10]`**, **`[10:02.61]`** |

---

## 11. Limits of source material

Automated transcripts may garble jargon (**“SDK”** heard as **“STK”** around **`[06:04.52]`** / **`[06:16.52]`**) or mis-hear uncommon words (**“neurodiverny”** ~ **`[10:14.61]`**—verify against raw audio).

**Responsible quoting:** use **`[…]`** only for omissions that **do not change sense** of the anchored segment.

---

## Source files

- Original audio (**M4A**): [`new-recording-8.m4a`](./new-recording-8.m4a)
- Timestamped: [`new-recording-8-transcript-whisper-small.txt`](./new-recording-8-transcript-whisper-small.txt)
- Plain stitched: [`new-recording-8-transcript-whisper-small-plain.txt`](./new-recording-8-transcript-whisper-small-plain.txt)
