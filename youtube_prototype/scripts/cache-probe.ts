import Anthropic from '@anthropic-ai/sdk';

const TOOLS = [
  {
    name: 'update_theme',
    description: 'Change theme settings.',
    input_schema: { type: 'object', properties: { mode: { type: 'string' } } } as const,
  },
];

const LONG = 'A '.repeat(2500); // ~2500 tokens, above the 1024 token cache minimum

async function main() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const system = [
    { type: 'text' as const, text: 'You are a test bot.' + LONG, cache_control: { type: 'ephemeral' as const } },
  ];

  // Turn 1
  console.log('--- Turn 1 ---');
  const r1 = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 60,
    system,
    tools: TOOLS as never,
    messages: [{ role: 'user', content: 'say hi' }],
  });
  console.log('usage:', r1.usage);

  // Turn 2 with same system
  console.log('--- Turn 2 (same system) ---');
  const r2 = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 60,
    system,
    tools: TOOLS as never,
    messages: [{ role: 'user', content: 'say hi again' }],
  });
  console.log('usage:', r2.usage);
}
main().catch((e) => { console.error(e); process.exit(1); });
