import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const root = path.resolve('dist/client');
const manifest = JSON.parse(readFileSync(path.join(root, '.vite/manifest.json'), 'utf8'));
const initial = new Set();
function visit(key) {
  if (initial.has(key)) return;
  initial.add(key);
  for (const dependency of manifest[key].imports || []) visit(dependency);
}
visit('index.html');
let initialGzip = 0;
const files = [...new Set(Object.values(manifest).map(chunk => chunk.file))].filter(file => file.endsWith('.js'));
const sizes = files.map(file => ({ file, bytes: readFileSync(path.join(root, file)).length }));
for (const item of sizes) assert.ok(item.bytes <= 450_000, `${item.file} exceeds the 450 KB JavaScript chunk budget (${item.bytes} bytes)`);
for (const key of initial) initialGzip += gzipSync(readFileSync(path.join(root, manifest[key].file))).length;
assert.ok(initialGzip <= 100_000, `Initial JS exceeds the 100 KB gzip budget (${initialGzip} bytes)`);
for (const key of initial) assert.ok(!/three|HeroBearingScene|Admin\.tsx|pdf\.ts/.test(key), `${key} must remain outside the initial static module graph`);
const largest = sizes.sort((a, b) => b.bytes - a.bytes)[0];
console.log(`Bundle budgets passed: initial JS ${(initialGzip / 1000).toFixed(1)} KB gzip; largest chunk ${(largest.bytes / 1000).toFixed(1)} KB; ${files.length} JS chunks. Lazy features download when used.`);
