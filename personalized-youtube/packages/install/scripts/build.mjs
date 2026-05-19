import { rm, mkdir } from 'node:fs/promises';
import { build } from 'esbuild';

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  sourcemap: true,
});

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/showcase-install.iife.js',
  bundle: true,
  format: 'iife',
  globalName: 'ShowcasePersonalize',
  platform: 'browser',
  target: 'es2020',
  sourcemap: true,
});
