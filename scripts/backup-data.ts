import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { backup, DatabaseSync } from 'node:sqlite';

const destination = process.argv[2];
assert.ok(destination && path.isAbsolute(destination), 'Pass an absolute backup directory as the only argument.');
const databasePath = path.resolve(process.env.DATABASE_PATH || 'data/platform.sqlite');
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'data/uploads');
const backupRoot = path.resolve(destination);
assert.ok(existsSync(databasePath) && statSync(databasePath).isFile(), 'The source SQLite database does not exist.');

function inside(parent: string, child: string) {
  const relative = path.relative(parent, child);
  return !relative.startsWith('..') && !path.isAbsolute(relative);
}
assert.ok(!inside(path.dirname(databasePath), backupRoot), 'Keep backups outside the live database directory.');
assert.ok(!inside(uploadDir, backupRoot) && !inside(backupRoot, uploadDir), 'Backup and upload directories must be separate.');

mkdirSync(backupRoot, { recursive: true, mode: 0o700 });
const name = 'backup-' + new Date().toISOString().replaceAll(':', '-') + '-' + randomBytes(3).toString('hex');
const outputDir = path.join(backupRoot, name);
assert.ok(inside(backupRoot, outputDir) && outputDir !== backupRoot);
mkdirSync(outputDir, { mode: 0o700 });
const incompleteMarker = path.join(outputDir, 'INCOMPLETE');
writeFileSync(incompleteMarker, 'Backup was interrupted or failed verification. Do not restore this directory.\n', { mode: 0o600, flag: 'wx' });
const outputDb = path.join(outputDir, 'platform.sqlite');
const outputUploads = path.join(outputDir, 'uploads');
const source = new DatabaseSync(databasePath);
try {
  await backup(source, outputDb);
} finally {
  source.close();
}
chmodSync(outputDb, 0o600);
if (existsSync(uploadDir)) cpSync(uploadDir, outputUploads, { recursive: true, force: false, errorOnExist: true });
else mkdirSync(outputUploads);

const copy = new DatabaseSync(outputDb);
let productCount = 0;
let mediaRows: { data: string }[] = [];
try {
  const result = copy.prepare('PRAGMA integrity_check').get() as { integrity_check: string };
  assert.equal(result.integrity_check, 'ok', 'SQLite backup failed integrity_check.');
  productCount = Number((copy.prepare('SELECT count(*) AS n FROM products').get() as { n: number }).n);
  mediaRows = copy.prepare('SELECT data FROM media').all() as { data: string }[];
} finally {
  copy.close();
}

for (const row of mediaRows) {
  const item = JSON.parse(row.data) as { url?: string };
  assert.match(item.url || '', /^\/uploads\/[a-zA-Z0-9.-]+$/);
  assert.ok(existsSync(path.join(outputUploads, path.basename(item.url!))), `Missing uploaded media: ${item.url}`);
}
const hash = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');
const uploads = readdirSync(outputUploads, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => ({ name: entry.name, sha256: hash(path.join(outputUploads, entry.name)) }));
const manifest = {
  version: 1,
  createdAt: new Date().toISOString(),
  products: productCount,
  mediaRecords: mediaRows.length,
  databaseSha256: hash(outputDb),
  uploads,
};
const manifestPath = path.join(outputDir, 'manifest.json');
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
unlinkSync(incompleteMarker);
console.log(`Verified backup: ${outputDir} (${productCount} products, ${uploads.length} uploaded files)`);
