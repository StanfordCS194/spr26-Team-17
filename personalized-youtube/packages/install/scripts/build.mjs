import { copyFile, mkdir, rm } from 'node:fs/promises';
import { build } from 'esbuild';

// Start from a clean package output directory on every build.
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });

// ESM build for npm-style imports, tests, and future bundler consumers.
await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  sourcemap: true,
});

// IIFE build for direct <script> tag installs on static customer sites.
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

// Copy the browser bundle into the demo site's public folder for local testing.
const demoDir = '../../apps/web/public/install-demo';
await mkdir(demoDir, { recursive: true });
await copyFile('dist/showcase-install.iife.js', `${demoDir}/showcase-install.iife.js`);
