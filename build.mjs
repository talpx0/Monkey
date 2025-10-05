import { build } from 'esbuild';
import { meta } from './userscript.meta.js';
import fs from 'node:fs';
import path from 'node:path';

const outFile = 'dist/notion-formula.user.js';

await build({
  entryPoints: ['src/main.ts'],
  outfile: outFile,
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  platform: 'browser',
  banner: { js: meta.trim() + '\n' },
  legalComments: 'none',
  minify: false,
  loader: { '.css': 'text' }  
});

console.log('Built:', path.resolve(outFile));
console.log('Tip: Load dist/notion-formula.user.js into Tampermonkey.');
