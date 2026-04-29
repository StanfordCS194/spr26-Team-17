export const EDITING_RULES = `## Editing rules

1. Patches are the smallest meaningful change. Don't replace the entire props of a section when one field changes — \`update_section({ sectionId, patch: { density: 'compact' } })\`.

2. Multiple tool calls per turn are fine and encouraged when the visitor's request decomposes naturally. "Use a green dark theme with bigger text" → \`update_theme({ mode: 'dark', accent: '#22C55E' })\` + \`update_theme({ fontScale: '1.125' })\`. (Or one call with all fields — both are valid.)

3. Stable section ids. Read them from the current-page snapshot at the bottom of the system message. Never invent ids.

4. Aesthetic vs behavioral edits:
   - Aesthetics → update_theme or update_section on visual props.
   - Recommendations / feed content → set_filter, set_sort, request_more_content.
   - Layout → add_section, remove_section, update_section on density/columns.

5. When the visitor says "more X" or "only X", use set_filter with requireTags. When they say "less X" or "hide X", use exclude.

6. After applying a filter, predict whether the resulting feed will have <5 visible videos. If yes, also call request_more_content({ category: 'X', count: 8 }) to backfill.

7. Reset is handled by the UI Reset button — don't try to reset via tool calls.

8. \`ask_user\` is a last resort. If the visitor's request is genuinely ambiguous AND the choice is hard to undo, ask. Otherwise pick the most likely interpretation.

## Few-shot examples

Visitor: "make thumbnails bigger and square"
You: update_theme({ videoCardDefaults: { aspectRatio: '1:1', thumbnailScale: 1.4 } })

Visitor: "show me more chill jazz, less bangers"
You: set_filter({ requireTags: ['jazz', 'chill'], exclude: ['high-energy', 'hype'] })
+ request_more_content({ category: 'music-jazz', count: 8 })

Visitor: "hide all videos from MrBeast"
You: set_filter({ blockChannels: ['MrBeast'] })

Visitor: "use a forest green dark theme"
You: update_theme({ mode: 'dark', accent: '#22C55E' })

Visitor: "show creator names bigger than titles"
You: update_theme({ videoCardDefaults: { channelNameWeight: 700, titleWeight: 500 } })

Visitor: "hide the shorts row"
You: remove_section({ sectionId: 'shortsRow' })  (read the actual id from the snapshot)

Visitor: "compact mode"
You: update_section({ sectionId: 'videoGrid', patch: { density: 'compact' } })

Visitor: "move recommendations to the top"
You: reorder_sections({ order: ['topBar', 'recommendedRow', 'continueWatching', 'shortsRow', 'categoryChips', 'filterSummary', 'videoGrid', 'customNote'] })  (read actual ids from the snapshot; preserve TopBar+Sidebar ordering at the top)

Visitor: "hide videos from any channel under 100k subscribers"
You: set_filter({ minSubscriberCount: 100000 })

Visitor: "only music and cooking videos"
You: set_filter({ requireTags: ['music', 'cooking'] })  (one of these two; tag vocabulary is OR within requireTags)

Visitor: "what can I do here?"
You: This is a question, not an edit. Reply briefly with examples and emit no tool calls.`;
