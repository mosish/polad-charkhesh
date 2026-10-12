import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, realpathSync, statSync, statfsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Standalone probe: no application imports, environment files or live databases.
const marker = 'polad-hosting-probe-v1';
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const script = fileURLToPath(import.meta.url);
let probeDirectory;

async function main() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  assert.ok(major > 22 || (major === 22 && minor >= 16), 'Node.js 22.16 or newer is required.');
  const { DatabaseSync, backup } = await import('node:sqlite');
  const args = process.argv.slice(2);
  const verify = args[0] === '--verify';
  const worker = args[0] === '--writer';
  assert.equal(args.length, verify || worker ? 2 : 1, 'Usage: node scripts/hosting-check.mjs ABSOLUTE_DATA_DIRECTORY | --verify ABSOLUTE_PROBE_DIRECTORY');
  const supplied = args[verify || worker ? 1 : 0];
  assert.ok(supplied && path.isAbsolute(supplied), 'Pass an existing absolute directory.');
  const directory = realpathSync(supplied);
  assert.ok(statSync(directory).isDirectory(), 'The supplied path must be a directory.');

  function inspectManifest(root) {
    assert.ok(path.basename(root).startsWith('polad-hosting-probe-'), 'This is not a probe directory.');
    const manifest = JSON.parse(readFileSync(path.join(root, 'probe.json'), 'utf8'));
    assert.equal(manifest.format, marker, 'Unrecognized probe manifest.');
    assert.match(manifest.token, /^[0-9a-f-]{36}$/);
    return manifest;
  }

  if (worker) {
    const manifest = inspectManifest(directory);
    const db = new DatabaseSync(path.join(directory, 'probe.sqlite'), { open: true });
    assert.equal(db.prepare('PRAGMA journal_mode=WAL').get().journal_mode, 'wal');
    db.exec('PRAGMA wal_autocheckpoint=0; PRAGMA synchronous=FULL; CREATE TABLE probe(token TEXT PRIMARY KEY);');
    db.prepare('INSERT INTO probe VALUES (?)').run(manifest.token);
    // Intentionally exit without close/checkpoint to exercise committed WAL recovery.
    process.exit(0);
  }

  if (verify) {
    probeDirectory = directory;
    const manifest = inspectManifest(directory);
    for (const filename of ['probe.sqlite', 'snapshot.sqlite']) {
      const db = new DatabaseSync(path.join(directory, filename), { readOnly: true });
      try {
        assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
        assert.deepEqual(db.prepare('SELECT token FROM probe ORDER BY token').all().map(row => row.token), [manifest.token]);
      } finally { db.close(); }
    }
    assert.equal(digest(readFileSync(path.join(directory, 'uploads', 'probe.txt'))), manifest.uploadSha256, 'Probe upload is missing or changed.');
    return { status: 'passed', phase: 'persistence-recheck', createdAt: manifest.createdAt, probeDirectory: directory,
      checks: ['database integrity and record', 'backup integrity and record', 'uploaded file hash'],
      limitation: 'This proves only that these probe files survive until this check. Confirm the host was actually restarted or redeployed separately.' };
  }

  const fsType = Number(statfsSync(directory).type) >>> 0;
  assert.ok(![0x6969, 0xff534d42, 0xfe534d42].includes(fsType), 'Detected NFS/SMB/CIFS filesystem: unsuitable for this SQLite WAL deployment.');
  probeDirectory = mkdtempSync(path.join(directory, 'polad-hosting-probe-'));
  const token = randomUUID();
  const manifest = { format: marker, token, createdAt: new Date().toISOString(), uploadSha256: digest(token) };
  writeFileSync(path.join(probeDirectory, 'probe.json'), JSON.stringify(manifest, null, 2), { flag: 'wx', mode: 0o600 });
  mkdirSync(path.join(probeDirectory, 'uploads'), { mode: 0o700 });
  writeFileSync(path.join(probeDirectory, 'uploads', 'probe.txt'), token, { flag: 'wx', mode: 0o600 });
  const child = spawnSync(process.execPath, [script, '--writer', probeDirectory], { encoding: 'utf8', timeout: 15000 });
  assert.equal(child.status, 0, child.error?.message || child.stderr || 'SQLite writer process failed.');
  assert.ok(statSync(path.join(probeDirectory, 'probe.sqlite-wal')).size > 0, 'The test did not leave committed WAL data to recover.');

  const db = new DatabaseSync(path.join(probeDirectory, 'probe.sqlite'));
  const reader = new DatabaseSync(path.join(probeDirectory, 'probe.sqlite'));
  try {
    assert.equal(db.prepare('PRAGMA journal_mode').get().journal_mode, 'wal');
    assert.equal(db.prepare('SELECT token FROM probe').get().token, token, 'Committed WAL record was not recovered.');
    db.exec('BEGIN IMMEDIATE');
    db.prepare('INSERT INTO probe VALUES (?)').run('uncommitted');
    assert.equal(reader.prepare('SELECT count(*) AS n FROM probe').get().n, 1, 'A concurrent reader saw an uncommitted write.');
    db.exec('ROLLBACK');
    await backup(db, path.join(probeDirectory, 'snapshot.sqlite'));
  } finally { reader.close(); db.close(); }
  const recheck = spawnSync(process.execPath, [script, '--verify', probeDirectory], { encoding: 'utf8', timeout: 15000 });
  assert.equal(recheck.status, 0, recheck.error?.message || recheck.stderr || 'Backup/persistence verification failed.');
  return { status: 'passed', phase: 'initial-probe', node: process.versions.node, platform: process.platform,
    filesystemType: `0x${fsType.toString(16)}`, probeDirectory,
    checks: ['writable data and upload directories', 'WAL enabled', 'committed WAL recovery after process exit', 'reader during write transaction', 'SQLite backup and integrity', 'upload hash'],
    nextCheck: ['node', script, '--verify', probeDirectory],
    limitation: 'Not deployment approval. This cannot certify storage architecture, service restart, real host reboot/redeployment, HTTPS, resource capacity or provider backups. No existing application data was opened.' };
}

try { console.log(JSON.stringify(await main(), null, 2)); }
catch (error) {
  console.error(JSON.stringify({ status: 'failed', error: error.message, probeDirectory }, null, 2));
  process.exitCode = 1;
}
