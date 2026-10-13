import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

void test('health returns unavailable when SQLite cannot be queried', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'polad-health-'));
  process.env.TEST_IMPORT = '1';
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_PATH = path.join(directory, 'platform.sqlite');
  process.env.UPLOAD_DIR = path.join(directory, 'uploads');
  const { app } = await import('../api/index');
  const { db } = await import('../api/database');
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const url = `http://127.0.0.1:${address.port}/api/health`;
    assert.equal((await fetch(url)).status, 200);
    db.close();
    const failed = await fetch(url);
    assert.equal(failed.status, 503);
    assert.deepEqual(await failed.json(), { status: 'unavailable' });
  } finally {
    if (db.isOpen) db.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(tmpdir()));
    assert.ok(path.basename(directory).startsWith('polad-health-'));
    rmSync(directory, { recursive: true, force: true });
  }
});
