# User Testing Plan — Personalizable YouTube

## Wiki Index Entry

Link this page from the team Wiki as:

- [User Testing Plan — Personalizable YouTube](./USER_TESTING_PLAN.md)
- [User Testing Feedback Log](./USER_TESTING_FEEDBACK.md)

## Purpose

We are testing a broader idea: websites should be adaptive and dynamic, so users can control the interface live instead of being locked into one fixed design. This prototype uses a YouTube-like homepage as the test environment because recommendation feeds are familiar, personal, and full of layout/content choices.

The main thing we want to learn is whether users understand and value being able to express intent in plain English and immediately see the website adapt. We care about whether the page changes feel useful, trustworthy, responsive, and worth using again.

## Target Testers

- People who regularly use YouTube or recommendation feeds.
- People who have strong preferences about how media feeds should look or behave.
- People who may not know anything about our implementation, Claude, Supabase, or the config system.

## Session Length

Plan for 8-12 minutes per tester.

- 1 minute: welcome and setup.
- 5-7 minutes: guided tasks.
- 2-4 minutes: free exploration and questions.

## Welcome Script

Thanks for trying our prototype. The larger idea behind this project is adaptive dynamic websites: sites that users can control live through natural language instead of accepting a one-size-fits-all interface. We are using a YouTube-shaped homepage as our test case because video feeds are familiar and highly personal.

You can ask the page to change its appearance, layout, or feed behavior while you use it. We are testing the product, not you. If something is confusing, slow, awkward, or surprisingly useful, that is exactly what we want to learn.

Please think out loud as much as you can. You can tell us what you expected, what you noticed, and what you would want to happen next.

## Setup

Before testing:

1. Open the app at `http://localhost:3000`.
2. Use mock mode unless YouTube mode is already working reliably.
3. Reset preferences before each tester.
4. Confirm the chat panel is visible.
5. Have one teammate observe and take notes in `docs/USER_TESTING_FEEDBACK.md`.

Do not explain implementation details unless the tester asks. The goal is to observe how well the experience communicates itself.

## Feedback Capture Method

Use teammate note-taking as the primary feedback mechanism.

Why this method:

- Testers stay immersed in the app.
- Notes can be converted directly into issues.
- The observer can capture confusion, pauses, and unexpected behavior that users may not write down later.

The observer should capture:

- Direct quotes.
- Task success/failure.
- Where the tester hesitated.
- Prompts the tester tried.
- Whether the app response matched their expectation.
- Bugs, enhancement ideas, and product-value reactions.

Use `docs/USER_TESTING_FEEDBACK.md` to organize notes into issues.

## When To Intervene

Let testers try to recover on their own for about 30-45 seconds if they are stuck. Intervene if:

- They cannot find the chat input.
- A server/keychain/API issue blocks the test.
- They are stuck in a way that prevents testing the next core behavior.

When intervening, give the smallest possible hint. Example: "Try typing what you want the page to do into the chat box."

## Core Questions

1. Do users understand the broader concept of a live, user-controlled adaptive website?
2. Do users understand that chat can change appearance, layout, and feed behavior?
3. Do users trust that the page actually changed based on their request?
4. Are the available changes useful, or do they feel like visual gimmicks?
5. What changes do users ask for that our current schema cannot support?
6. Do users notice persistence and reset behavior?
7. Does the interface feel smooth and modern enough during layout/theme changes?

## Guided Tasks

### Task 1: First Impression

Ask the tester to look at the page for 20 seconds before touching anything.

Prompt:

> What do you think this app does?

Capture:

- Do they recognize the YouTube-like feed?
- Do they notice the chat panel?
- Do they understand that the page itself is meant to be user-controlled and adaptive?

Success signal:

- Tester can describe the app as a live adaptive website or customizable/personalized video feed without heavy explanation.

### Task 2: Appearance Personalization

Ask the tester:

> Make the page look more like a calm late-night study space.

Let them choose their own wording.

Capture:

- Exact prompt typed.
- Whether Claude changes theme/layout appropriately.
- Whether the tester notices the change.
- Whether the change feels tasteful, too subtle, or too dramatic.

Success signal:

- Tester believes the page responded meaningfully to their aesthetic intent.

### Task 3: Layout Personalization

Ask the tester:

> Move or reorganize something on the page to make it easier for you to browse.

If they need examples, offer only after they hesitate:

- Move the sidebar.
- Make the grid compact.
- Hide shorts.
- Show videos as a list.

Capture:

- What layout change they request.
- Whether they expect a specific visual transition.
- Whether the movement feels smooth or jarring.

Success signal:

- Tester can cause a visible layout change and explain why they wanted it.

### Task 4: Feed Behavior Personalization

Ask the tester:

> Change the feed so it better matches what you would actually want to watch right now.

Examples if needed:

- "Only deep dives."
- "Less music, more cooking."
- "Hide videos from small channels."
- "Show me relaxing videos."

Capture:

- Whether the tester thinks in categories, moods, quality filters, or channel filters.
- Whether the resulting feed matches their intent.
- Whether they want more control or explanation.

Success signal:

- Tester feels the feed changed in a useful way, not just cosmetically.

### Task 5: Persistence And Reset

Ask the tester to refresh the page.

Then ask:

> What did you expect to happen after refresh?

Finally, ask them to reset preferences.

Capture:

- Whether persistence is expected or surprising.
- Whether reset is discoverable.
- Whether reset returns the app to a reasonable default.

Success signal:

- Tester understands that preferences persist and can be reset.

### Task 6: Free Exploration

Give the tester 2-3 minutes:

> Try anything you wish this kind of website could do if it could adapt to you live.

Capture:

- Unsupported prompts.
- Repeated themes across testers.
- Requests that reveal product value.
- Requests that reveal missing schema/tool support.

Success signal:

- Tester naturally asks for changes beyond the examples we gave.

## Optional A/B Comparisons

If time allows, compare two versions of the same concept.

### A/B 1: Finding Something To Watch

Goal: compare the real YouTube browsing experience against our adaptive chat-driven browsing experience.

Condition A — real YouTube browsing:

Open `https://youtube.com` in Chrome using the same logged-in account. Then ask:

> Imagine you want to find something genuinely interesting to watch right now. Browse your real YouTube homepage normally for up to 90 seconds and stop when you find a video you would actually click.

Condition B — adaptive browsing:

Open our app at `http://localhost:3000`. Reset preferences if needed. Then ask:

> Now use the chat to tell the page what you feel like watching right now. After the page adapts, browse again and stop when you find a video you would actually click.

To reduce ordering bias, alternate the order across testers:

- T1/T3: A then B.
- T2/T4: B then A.

Capture:

- What they looked for in each condition.
- Time to find a video they would click.
- Which video they selected in YouTube.
- Which video they selected in our app.
- The exact adaptive prompt they typed.
- Whether the adapted feed made choosing easier.
- Whether they trusted the adapted result more, less, or the same.
- Which experience felt more satisfying and why.

Success signal:

- Tester finds something interesting faster, with more confidence, or with less effort in the adaptive condition.

### A/B 2: Sidebar Position

- A: Default sidebar on left.
- B: Ask chat to move sidebar to right.

Question:

> Which side feels more natural for browsing, and why?

### A/B 3: Feed Density

- A: Default cozy grid.
- B: Compact 5-column grid.

Question:

> Which layout would you use for everyday browsing?

### A/B 4: Value Proposition

- A: "Customize YouTube's look."
- B: "Control a website live by telling it how you want it to adapt."
- C: "Tell a video feed what you want, and it reorganizes itself around you."

Question:

> Which description makes you more interested in using this?

## Performance Observations

During each test, note:

- Time from prompt submission to visible change.
- Whether streaming feedback appears soon enough.
- Whether page changes feel smooth.
- Any slow request, spinner, or freeze.
- Any browser/keychain issue in YouTube mode.

## Success Metrics

Track these across testers:

- Task completion: completed / partial / failed.
- Prompt success: matched expectation / partially matched / missed.
- Time to first successful personalization.
- Number of unsupported or misunderstood requests.
- Number of times tester needed help.
- Tester rating for the adaptive-website concept, 1-5.
- Tester rating for usefulness, 1-5.
- Tester rating for visual polish, 1-5.

## Post-Test Questions

Ask these at the end:

1. What was the most useful thing the app did?
2. What felt confusing or unreliable?
3. What would you ask it to do if websites in general could adapt to you live?
4. What would you ask it to do if this were your real YouTube homepage?
5. Did the changes feel like they matched your words?
6. Would you use this more for visual customization, feed control, layout control, or something else?
7. What would make you trust the personalization more?

## Materials To Have Ready

- Running app at `http://localhost:3000`.
- This test plan visible on a laptop/tablet or printed.
- `docs/USER_TESTING_FEEDBACK.md` open for the observer.
- A timer.
- A reset workflow between testers.
- Backup mock-mode setup in case YouTube mode/keychain fails.
