import Anthropic from '@anthropic-ai/sdk';
import { TOOL_DEFINITIONS } from '@showcase/shared';
import { buildSystemBlocks } from '../apps/web/lib/prompts/system';

async function main() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const sys = buildSystemBlocks();

  const role = sys.role.text;
  const cat = sys.schemaCatalog.text;
  const rules = sys.editingRules.text;

  const r1 = await client.messages.countTokens({
    model: 'claude-opus-4-7',
    system: [{ type: 'text', text: role }],
    messages: [{ role: 'user', content: 'x' }],
  });
  const r2 = await client.messages.countTokens({
    model: 'claude-opus-4-7',
    system: [{ type: 'text', text: cat }],
    messages: [{ role: 'user', content: 'x' }],
  });
  const r3 = await client.messages.countTokens({
    model: 'claude-opus-4-7',
    system: [{ type: 'text', text: rules }],
    messages: [{ role: 'user', content: 'x' }],
  });
  const r4 = await client.messages.countTokens({
    model: 'claude-opus-4-7',
    tools: TOOL_DEFINITIONS as never,
    messages: [{ role: 'user', content: 'x' }],
  });
  const rAll = await client.messages.countTokens({
    model: 'claude-opus-4-7',
    system: [sys.role, sys.schemaCatalog, sys.editingRules],
    tools: TOOL_DEFINITIONS as never,
    messages: [{ role: 'user', content: 'x' }],
  });

  console.log('role chars:', role.length, 'tokens:', r1.input_tokens);
  console.log('catalog chars:', cat.length, 'tokens:', r2.input_tokens);
  console.log('rules chars:', rules.length, 'tokens:', r3.input_tokens);
  console.log('tools tokens:', r4.input_tokens);
  console.log('--- ALL combined input tokens:', rAll.input_tokens);
}

main().catch((e) => { console.error(e); process.exit(1); });
