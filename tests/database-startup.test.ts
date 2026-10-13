import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

void test('restarting an initialized empty catalog does not repopulate deleted owner records', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'polad-empty-catalog-'));
  const run = (code: string) => spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', code], {
    env: { ...process.env, DATABASE_PATH: path.join(directory, 'platform.sqlite'), NODE_ENV: 'test' },
    encoding: 'utf8', timeout: 15000,
  });
  try {
    const first = run("import {db} from './api/database.ts'; db.exec('DELETE FROM products'); db.close();");
    assert.equal(first.status, 0, first.stderr);
    const second = run("import {db} from './api/database.ts'; console.log(db.prepare('SELECT count(*) n FROM products').get().n); db.close();");
    assert.equal(second.status, 0, second.stderr);
    assert.equal(second.stdout.trim(), '0');
  } finally {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(tmpdir()));
    assert.ok(path.basename(directory).startsWith('polad-empty-catalog-'));
    rmSync(directory, { recursive: true, force: true });
  }
});
