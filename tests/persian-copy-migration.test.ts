import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { siteExtras, textKey } from '../domain/site-content';

void test('stored Persian placeholders are repaired once without replacing later CMS edits', () => {
  const filename = path.join(mkdtempSync(path.join(tmpdir(), 'polad-persian-copy-')), 'site.sqlite');
  const prior = new DatabaseSync(filename);
  prior.exec('CREATE TABLE settings(kind TEXT PRIMARY KEY,data TEXT NOT NULL)');
  const copy = structuredClone(siteExtras.copy);
  const side = textKey('SIDE VIEW');
  const roller = textKey('Roller bearings');
  copy[side].fa = 'SIDE VIEW';
  copy[roller].fa = 'رولبرینگ سفارشی مالک';
  prior.prepare('INSERT INTO settings VALUES(?,?)').run(
    'content', JSON.stringify({ hero: { titleFa: 'عنوان مالک' }, copy }),
  );
  prior.close();
  const start = () => {
    const moduleUrl = pathToFileURL(path.resolve('api/database.ts')).href;
    const child = spawnSync(process.execPath, [
      '--import', 'tsx', '--input-type=module', '-e',
      `const {db} = await import(${JSON.stringify(moduleUrl)}); db.close();`,
    ], { env: { ...process.env, DATABASE_PATH: filename, NODE_ENV: 'test' }, encoding: 'utf8' });
    assert.equal(child.status, 0, child.stderr);
  };
  start();
  const db = new DatabaseSync(filename);
  try {
    const read = (kind: string) => JSON.parse(String(
      (db.prepare('SELECT data FROM settings WHERE kind=?').get(kind) as { data: string }).data,
    ));
    const migrated = read('content');
    assert.equal(migrated.copy[side].fa, 'نمای جانبی');
    assert.equal(migrated.copy[roller].fa, copy[roller].fa);
    assert.deepEqual(migrated.hero, { titleFa: 'عنوان مالک' });
    const marker = read('content.persian-copy-2026-10-20');
    assert.equal(marker.count, 1);
    const eventsBefore = db.prepare('SELECT * FROM audit_logs ORDER BY id').all();
    // An owner can intentionally change even a repaired string after migration.
    migrated.copy[side].fa = 'SIDE VIEW';
    db.prepare('UPDATE settings SET data=? WHERE kind=?').run(JSON.stringify(migrated), 'content');
    start();
    assert.deepEqual(read('content'), migrated);
    assert.deepEqual(read('content.persian-copy-2026-10-20'), marker);
    assert.deepEqual(db.prepare('SELECT * FROM audit_logs ORDER BY id').all(), eventsBefore);
  } finally {
    db.close();
  }
});
