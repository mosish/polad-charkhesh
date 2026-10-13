import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicError } from '../api/http-errors';

void test('database errors distinguish conflicts, temporary locks and internal failures without leaking details', () => {
  assert.equal(publicError({ code: 'ERR_SQLITE_ERROR', errcode: 2067 }).status, 409);
  assert.equal(publicError({ code: 'ERR_SQLITE_ERROR', errcode: 1555 }).status, 409);
  assert.equal(publicError({ code: 'ERR_SQLITE_ERROR', errcode: 5 }).status, 503);
  assert.equal(publicError({ code: 'ERR_SQLITE_ERROR', errcode: 11, message: '/private/db corrupted' }).status, 500);
  assert.ok(!JSON.stringify(publicError(new Error('/private/path'))).includes('/private/'));
  assert.equal(publicError({ status: 413 }).status, 413);
  assert.equal(publicError({ status: 400 }).status, 400);
});
