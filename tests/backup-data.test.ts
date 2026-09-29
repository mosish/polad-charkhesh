import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

test('offline backup contains a consistent SQLite snapshot and uploaded files', () => {
  const sourceRoot = mkdtempSync(path.join(tmpdir(), 'polad-backup-source-'));
  const backupRoot = mkdtempSync(path.join(tmpdir(), 'polad-backup-target-'));
  try {
    const databasePath = path.join(sourceRoot, 'platform.sqlite');
    const uploadDir = path.join(sourceRoot, 'uploads');
    mkdirSync(uploadDir);
    writeFileSync(path.join(uploadDir, 'sample.pdf'), '%PDF-1.7\nexample');
    const db = new DatabaseSync(databasePath);
    db.exec('PRAGMA journal_mode=WAL; CREATE TABLE products(id TEXT); CREATE TABLE media(data TEXT);');
    db.prepare('INSERT INTO products VALUES(?)').run('test-bearing');
    db.prepare('INSERT INTO media VALUES(?)').run(JSON.stringify({ url: '/uploads/sample.pdf' }));
    db.close();

    const result = spawnSync(
      process.execPath,
      ['node_modules/tsx/dist/cli.mjs', 'scripts/backup-data.ts', backupRoot],
      {
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_PATH: databasePath, UPLOAD_DIR: uploadDir },
        encoding: 'utf8',
      },
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const snapshotDir = path.join(backupRoot, readdirSync(backupRoot)[0]);
    const manifest = JSON.parse(readFileSync(path.join(snapshotDir, 'manifest.json'), 'utf8'));
    assert.equal(manifest.products, 1);
    assert.equal(manifest.mediaRecords, 1);
    assert.equal(manifest.uploads.length, 1);
    assert.equal(readFileSync(path.join(snapshotDir, 'uploads', 'sample.pdf'), 'utf8'), '%PDF-1.7\nexample');
    const verify = () => spawnSync(
      process.execPath,
      ['node_modules/tsx/dist/cli.mjs', 'scripts/verify-backup.ts', snapshotDir],
      { cwd: process.cwd(), encoding: 'utf8' },
    );
    assert.equal(verify().status, 0, 'A newly created backup verifies successfully.');
    const copy = new DatabaseSync(path.join(snapshotDir, 'platform.sqlite'));
    try {
      assert.equal((copy.prepare('PRAGMA integrity_check').get() as { integrity_check: string }).integrity_check, 'ok');
      assert.equal((copy.prepare('SELECT id FROM products').get() as { id: string }).id, 'test-bearing');
    } finally {
      copy.close();
    }
    writeFileSync(path.join(snapshotDir, 'uploads', 'sample.pdf'), 'changed');
    assert.notEqual(verify().status, 0, 'A changed upload fails verification.');
  } finally {
    for (const target of [sourceRoot, backupRoot]) {
      const resolved = path.resolve(target);
      assert.ok(path.dirname(resolved) === path.resolve(tmpdir()) && path.basename(resolved).startsWith('polad-backup-'));
      rmSync(resolved, { recursive: true, force: true });
    }
  }
});
