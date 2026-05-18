# User Testing Feedback Log

Use this page during midpoint testing to capture feedback and convert it into actionable work. Do not rewrite tester comments into polished product language too early; preserve direct quotes when possible.

## Session Log

| Tester | Date | Persona / Context | Mode | Notes Link |
| --- | --- | --- | --- | --- |
| T1 |  |  | Mock / YouTube |  |
| T2 |  |  | Mock / YouTube |  |
| T3 |  |  | Mock / YouTube |  |
| T4 |  |  | Mock / YouTube |  |

## Raw Notes Template

Copy this block for each tester.

```md
### Tester T__

Context:
- Uses YouTube: daily / weekly / rarely
- Main use case: entertainment / learning / music / background / research
- Tested mode: mock / YouTube

Task outcomes:
- First impression:
- Appearance personalization:
- Layout personalization:
- Feed behavior personalization:
- Persistence/reset:
- Free exploration:

Prompts tried:
- ""
- ""
- ""

Direct quotes:
- ""
- ""

Observed friction:
- 

Positive signals:
- 

Open questions:
- 
```

## Groomed Issue List

Use priority labels:

- `P0`: blocks testing or core flow.
- `P1`: major usability/product issue.
- `P2`: important improvement.
- `P3`: polish or nice-to-have.

Use type labels:

- `bug`
- `ux`
- `feature`
- `performance`
- `content`
- `research`

| Priority | Type | Issue | Evidence / Quote | Suggested Action | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | ux | Users may not realize chat can change layout, not just theme. |  | Add onboarding hint or starter chips that include layout examples. |  | Open |
| P1 | performance | YouTube mode can stall on Chrome keychain access. |  | Add visible fallback/error state explaining Chrome Safe Storage permission. |  | Open |
| P2 | ux | Layout changes may feel abrupt or hard to follow. |  | Keep improving motion and add small "Applied changes" summary. |  | Open |
| P2 | feature | Users may ask for higher-level modes like focus, study, music, or minimal. |  | Add experience presets that map one prompt to multiple config patches. |  | Open |
| P2 | research | Need to learn whether users value visual customization or feed control more. |  | Ask post-test question and tag responses by primary value. |  | Open |

## Feedback Pattern Tracker

Update counts after each test.

| Pattern | Count | Example Evidence | Product Implication |
| --- | ---: | --- | --- |
| Did not notice chat panel | 0 |  | Improve affordance / onboarding |
| Prompt produced unexpected change | 0 |  | Improve schema catalog or editing rules |
| Wanted more feed control | 0 |  | Expand filters/sort/grouping |
| Wanted more layout control | 0 |  | Add layout presets and section controls |
| Wanted explanation of what changed | 0 |  | Add applied-change summary / undo |
| Found YouTube mode setup confusing | 0 |  | Improve setup/error states |
| Liked aesthetic personalization | 0 |  | Emphasize visual customization |
| Liked behavioral personalization | 0 |  | Emphasize feed control |

## Post-Test Synthesis

Fill this out after all sessions.

### Biggest Validated Strength

-

### Biggest Usability Problem

-

### Most Requested Missing Capability

-

### Highest Priority Fixes Before Next Demo

1.
2.
3.

### Product Direction Signal

Did testers care more about:

- Visual customization?
- Better recommendations/filtering?
- Layout/workflow control?
- Something else?

Summary:

-
