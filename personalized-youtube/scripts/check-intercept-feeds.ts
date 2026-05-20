/**
 * Smoke-test intercept adapters (Amazon search HTML + Instagram timeline JSON).
 * Run from personalized-youtube/: pnpm check:feeds
 */

import { getAmazonSearchFeed } from '../apps/web/lib/amazon/client';
import { getInstagramTimelineFeed } from '../apps/web/lib/instagram/client';

async function main() {
  console.log('--- Amazon (GET /s?k=… + Chrome cookies) ---');
  const amazon = await getAmazonSearchFeed();
  if (amazon.kind === 'ok') {
    console.log(`OK: ${amazon.videos.length} products — sample: ${amazon.videos[0]?.title}`);
  } else {
    console.log(`unavailable: ${amazon.reason}`);
  }

  console.log('\n--- Instagram (GET /api/v1/feed/timeline/ + Chrome cookies) ---');
  const ig = await getInstagramTimelineFeed();
  if (ig.kind === 'ok') {
    console.log(`OK: ${ig.videos.length} posts — sample: @${ig.videos[0]?.channel.name} — ${ig.videos[0]?.title}`);
  } else {
    console.log(`unavailable: ${ig.reason}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
