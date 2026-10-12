import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('hosting probe recovers committed WAL, rechecks persistence and detects modified uploads without touching existing data', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'polad-hosting-test-'));
  const run = (...args: string[]) => spawnSync(process.execPath, ['scripts/hosting-check.mjs', ...args], { encoding: 'utf8', timeout: 30000 });
  try {
    const sentinel = path.join(root, 'platform.sqlite');
    writeFileSync(sentinel, 'existing owner data must remain untouched');
    const result = run(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.phase, 'initial-probe');
    assert.equal(path.dirname(report.probeDirectory), root);
    assert.equal(run('--verify', report.probeDirectory).status, 0);
    writeFileSync(path.join(report.probeDirectory, 'uploads', 'probe.txt'), 'corrupted');
    assert.notEqual(run('--verify', report.probeDirectory).status, 0);
    assert.equal(readFileSync(sentinel, 'utf8'), 'existing owner data must remain untouched');
    assert.notEqual(run('--verify', root).status, 0);
    assert.notEqual(run('relative/path').status, 0);
  } finally {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(tmpdir()));
    assert.ok(path.basename(root).startsWith('polad-hosting-test-'));
    rmSync(root, { recursive: true, force: true });
  }
});
