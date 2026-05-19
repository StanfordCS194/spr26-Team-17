import { copyFile, mkdir, rm } from 'node:fs/promises';
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

const demoDir = '../../apps/web/public/install-demo';
await mkdir(demoDir, { recursive: true });
await copyFile('dist/showcase-install.iife.js', `${demoDir}/showcase-install.iife.js`);
