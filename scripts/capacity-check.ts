// Bounded local sample against a disposable production process, never a supplied URL.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import net from 'node:net';

const temp = mkdtempSync(path.join(tmpdir(), 'polad-capacity-'));
const port = await new Promise<number>((resolve) => {
  const socket = net.createServer();
  socket.listen(0, '127.0.0.1', () => {
    const address = socket.address();
    assert.ok(address && typeof address !== 'string');
    socket.close(() => resolve(address.port));
  });
});
const server = spawn(process.execPath, ['dist/server/index.js'], {
  env: { ...process.env, NODE_ENV: 'production', TEST_IMPORT: '', HOST: '127.0.0.1', PORT: String(port),
    DATABASE_PATH: path.join(temp, 'platform.sqlite'), UPLOAD_DIR: path.join(temp, 'uploads'),
    ALLOW_INITIALIZE_DATABASE: '1', SESSION_SECRET: randomBytes(32).toString('hex'),
    COOKIE_SECRET: randomBytes(32).toString('hex'), SETUP_TOKEN: randomBytes(32).toString('hex') },
  stdio: ['ignore', 'ignore', 'pipe'],
});
let errorOutput = '';
server.stderr.on('data', (chunk) => { errorOutput = (errorOutput + String(chunk)).slice(-2000); });
const base = `http://127.0.0.1:${port}`;
try {
  let healthy = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try { healthy = (await fetch(base + '/api/health', { signal: AbortSignal.timeout(1000) })).ok; } catch { /* startup */ }
    if (healthy) break;
    assert.equal(server.exitCode, null, errorOutput);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(healthy, 'Disposable server did not start');
  const times: number[] = [];
  const start = performance.now();
  const routes = ['/', '/catalog', '/engineering', '/api/products', '/product/6204-2rs'];
  await Promise.all(Array.from({ length: 5 }, async () => {
    for (let i = 0; i < 10; i++) {
      const before = performance.now();
      const response = await fetch(base + routes[i % routes.length], { signal: AbortSignal.timeout(10_000) });
      assert.equal(response.status, 200);
      await response.arrayBuffer();
      times.push(performance.now() - before);
    }
  }));
  times.sort((a, b) => a - b);
  const procStatus = process.platform === 'linux' ? readFileSync(`/proc/${server.pid}/status`, 'utf8') : '';
  console.log(JSON.stringify({ platform: process.platform, node: process.version, requests: times.length, concurrency: 5,
    elapsedMs: Math.round(performance.now() - start), p95Ms: Math.round(times[Math.ceil(times.length * .95) - 1]),
    processRssKiB: Number(procStatus.match(/^VmRSS:\s+(\d+)/m)?.[1]) || null,
    scope: 'Loopback HTTP, seeded disposable database, no TLS/browser rendering. Not a traffic capacity guarantee.' }, null, 2));
} finally {
  if (server.exitCode === null && server.signalCode === null) {
    await new Promise<void>((resolve) => {
      const deadline = setTimeout(() => server.kill('SIGKILL'), 12_000);
      server.once('exit', () => { clearTimeout(deadline); resolve(); });
      server.kill('SIGTERM');
    });
  }
  assert.equal(path.dirname(path.resolve(temp)), path.resolve(tmpdir()));
  assert.ok(path.basename(temp).startsWith('polad-capacity-'));
  rmSync(temp, { recursive: true, force: true });
}
