import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const directory = process.argv[2];
assert.ok(directory && path.isAbsolute(directory), 'Pass the absolute snapshot directory to verify.');
const snapshot = path.resolve(directory);
assert.ok(!existsSync(path.join(snapshot, 'INCOMPLETE')), 'This backup is marked incomplete.');
const manifest = JSON.parse(readFileSync(path.join(snapshot, 'manifest.json'), 'utf8')) as {
  version: number;
  products: number;
  mediaRecords: number;
  databaseSha256: string;
  uploads: { name: string; sha256: string }[];
};
assert.equal(manifest.version, 1, 'Unsupported backup manifest.');
const hash = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');
const databaseFile = path.join(snapshot, 'platform.sqlite');
assert.equal(hash(databaseFile), manifest.databaseSha256, 'SQLite file hash differs from the manifest.');
const uploadsDir = path.join(snapshot, 'uploads');
const names = readdirSync(uploadsDir, { withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
assert.deepEqual(names, manifest.uploads.map((item) => item.name).sort(), 'Uploaded file list differs from the manifest.');
for (const item of manifest.uploads) {
  assert.equal(path.basename(item.name), item.name, 'Invalid upload filename in manifest.');
  assert.equal(hash(path.join(uploadsDir, item.name)), item.sha256, `Upload hash differs: ${item.name}`);
}
const db = new DatabaseSync(databaseFile);
try {
  assert.equal((db.prepare('PRAGMA integrity_check').get() as { integrity_check: string }).integrity_check, 'ok');
  assert.equal(Number((db.prepare('SELECT count(*) AS n FROM products').get() as { n: number }).n), manifest.products);
  const mediaRows = db.prepare('SELECT data FROM media').all() as { data: string }[];
  assert.equal(mediaRows.length, manifest.mediaRecords);
  for (const row of mediaRows) {
    const url = (JSON.parse(row.data) as { url?: string }).url || '';
    assert.match(url, /^\/uploads\/[a-zA-Z0-9.-]+$/);
    assert.ok(names.includes(path.basename(url)), `Referenced media is absent: ${url}`);
  }
} finally {
  db.close();
}
console.log(`Backup verified: ${snapshot} (${manifest.products} products, ${names.length} uploaded files)`);
