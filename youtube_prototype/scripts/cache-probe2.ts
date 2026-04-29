import Anthropic from '@anthropic-ai/sdk';
import { TOOL_DEFINITIONS } from '@showcase/shared';
import { buildSystemBlocks, buildVisitorState } from '../apps/web/lib/prompts/system';

async function call(client: Anthropic, label: string, visitorState: string, message: string) {
  const sys = buildSystemBlocks();
  const stream = client.messages.stream({
    model: 'claude-opus-4-7',
    max_tokens: 100,
    system: [sys.role, sys.schemaCatalog, sys.editingRules],
    tools: TOOL_DEFINITIONS as never,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: visitorState },
          { type: 'text', text: '\n\nVisitor: ' + message },
        ],
      },
    ],
  });
  const final = await stream.finalMessage();
  console.log(`--- ${label} ---`);
  console.log('usage:', final.usage);
}

async function main() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const state1 = buildVisitorState({ theme: { mode: 'light' }, sections: [] }, []);
  await call(client, 'Turn 1 (cache write)', state1, 'use dark mode');

  const state2 = buildVisitorState({ theme: { mode: 'dark' }, sections: [] }, [{ op: 'update_theme' }]);
  await call(client, 'Turn 2 (different state, same system)', state2, 'use bigger text');

  // Same system again, identical state — should hit cache
  await call(client, 'Turn 3 (same state as turn 2)', state2, 'something else');
}

main().catch((e) => { console.error(e); process.exit(1); });
