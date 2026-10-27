import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { DashboardSnapshot } from '../domain/dashboard';

process.env.TEST_IMPORT = '1';
process.env.MFA_REQUIRED = 'true';
process.env.MFA_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
process.env.DATABASE_PATH = path.join(
  mkdtempSync(path.join(tmpdir(), 'polad-dashboard-')),
  'test.sqlite',
);
process.env.UPLOAD_DIR = path.join(
  path.dirname(process.env.DATABASE_PATH),
  'uploads',
);
let server: Server,
  base: string,
  cookie = '';
let database: typeof import('../api/database'),
  analytics: typeof import('../api/analytics');
before(async () => {
  const { app } = await import('../api/index');
  database = await import('../api/database');
  analytics = await import('../api/analytics');
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;
});
after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  database.db.close();
});
async function report(body: unknown, headers: Record<string, string> = {}) {
  return fetch(base + '/api/analytics/pageview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: base,
      'User-Agent': 'StatisticsIntegrationTest',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

void test('private dashboard requires an assured session; editor may read coarse metrics', async () => {
  assert.equal((await fetch(base + '/api/system/dashboard')).status, 401);
  // Obtain a real signed enrollment cookie through the existing account flow.
  const setup = await fetch(base + '/api/auth/setup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'dashboard-owner',
      password: 'Synthetic-dashboard-test-only',
    }),
  });
  cookie = setup.headers.get('set-cookie')!.split(';')[0];
  assert.equal(setup.status, 201);
  assert.equal(
    (
      await fetch(base + '/api/system/dashboard', {
        headers: { Cookie: cookie },
      })
    ).status,
    401,
  );
  const token = database.db
    .prepare('SELECT token_hash FROM sessions')
    .get()!.token_hash;
  database.db
    .prepare('UPDATE session_assurance SET mfa_verified=1 WHERE token_hash=?')
    .run(token);
  database.db.exec("UPDATE admins SET role='editor'");
  const response = await fetch(base + '/api/system/dashboard', {
    headers: { Cookie: cookie },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const value = (await response.json()) as DashboardSnapshot;
  assert.equal(value.server.database, 'connected');
  assert.equal(value.server.application, 'online');
  assert.ok(value.server.memory.totalBytes > 0);
  assert.ok(value.server.applicationUptimeSeconds >= 0);
  assert.ok(
    value.server.cpuPercent === null ||
      (value.server.cpuPercent >= 0 && value.server.cpuPercent <= 100),
  );
  assert.equal(value.website.daily.length, 7);
  const text = JSON.stringify(value);
  for (const forbidden of [
    'password_hash',
    'token_hash',
    'DATABASE_PATH',
    'SESSION_SECRET',
    'platform.sqlite',
    'username',
    'user-agent',
  ])
    assert.ok(!text.includes(forbidden));
});

void test('aggregate collection validates public routes and ignores privacy/bot reports', async () => {
  assert.equal(
    (
      await report(
        { path: '/', language: 'en' },
        { Origin: 'https://other.example' },
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await report(
        { path: '/', language: 'en' },
        { 'Sec-Fetch-Site': 'cross-site' },
      )
    ).status,
    403,
  );
  for (const route of [
    '',
    '//',
    '/admin',
    '/api/health',
    '/catalog?email=private',
    '/catalog#private',
    '/product/not-published',
    '/catalog/../../admin',
    '/product/%ZZ',
  ])
    assert.equal(
      (await report({ path: route, language: 'en' })).status,
      400,
      route,
    );
  assert.equal((await report({ path: '/', language: 'xx' })).status, 400);
  assert.equal(
    (await report({ path: '/', language: 'en', visitor: 'private' })).status,
    400,
  );
  assert.equal(
    (await report({ path: '/', language: 'en', extra: 'x'.repeat(1100) }))
      .status,
    413,
  );
  for (const headers of [
    { DNT: '1' },
    { 'Sec-GPC': '1' },
    { 'User-Agent': 'Googlebot' },
  ] as Record<string, string>[])
    assert.equal(
      (await report({ path: '/', language: 'en' }, headers)).status,
      204,
    );
  assert.equal(analytics.websiteStatistics().today, 0);
  database.db
    .prepare('INSERT INTO website_pageviews VALUES(?,?,?,?,?)')
    .run('2000-01-01', 'poladcharkhesh.ir', '/', 'fa', 9);
  assert.equal((await report({ path: '/', language: 'en' })).status, 204);
  assert.equal(
    database.db
      .prepare(
        "SELECT COUNT(*) n FROM website_pageviews WHERE day='2000-01-01'",
      )
      .get()!.n,
    0,
  );
  assert.equal(
    (await report({ path: '/catalog/ball-bearings', language: 'fa' })).status,
    204,
  );
  assert.equal(analytics.websiteStatistics().today, 2);
  const columns = database.db
    .prepare('PRAGMA table_info(website_pageviews)')
    .all()
    .map((row) => row.name);
  assert.deepEqual(columns, ['day', 'domain', 'path', 'language', 'views']);
  assert.equal((await fetch(base + '/api/analytics/pageview')).status, 404);
});

void test('Tehran day boundaries and zero-filled trends preserve exact totals', () => {
  assert.equal(
    analytics.statisticsDay(new Date('2026-10-27T20:29:59Z')),
    '2026-10-27',
  );
  assert.equal(
    analytics.statisticsDay(new Date('2026-10-27T20:30:00Z')),
    '2026-10-28',
  );
  database.db.exec('DELETE FROM website_pageviews');
  const insert = database.db.prepare(
    'INSERT INTO website_pageviews VALUES(?,?,?,?,?)',
  );
  for (const [day, domain, route, views] of [
    ['2026-10-27', 'poladcharkhesh.ir', '/', 5],
    ['2026-10-27', 'poladcharkhesh.com', '/catalog', 3],
    ['2026-10-26', 'poladcharkhesh.ir', '/', 2],
    ['2026-10-21', 'poladcharkhesh.com', '/engineering', 4],
    ['2026-09-28', 'poladcharkhesh.com', '/', 7],
    ['2026-09-27', 'poladcharkhesh.ir', '/', 99],
    ['2026-10-28', 'poladcharkhesh.ir', '/', 100],
  ] as const)
    insert.run(day, domain, route, 'en', views);
  const value = analytics.websiteStatistics(new Date('2026-10-27T12:00:00Z'));
  assert.equal(value.today, 8);
  assert.equal(value.yesterday, 2);
  assert.equal(value.last7Days, 14);
  assert.equal(value.last30Days, 21);
  assert.deepEqual(
    value.daily.map((row) => row.views),
    [4, 0, 0, 0, 0, 2, 8],
  );
  assert.deepEqual(
    value.domains.map((row) => row.views),
    [7, 14],
  );
  assert.equal(value.topPages[0].path, '/');
  assert.equal(value.topPages[0].views, 14);
});

void test('excessive reports do not affect website health', async () => {
  database.db.exec('DELETE FROM website_pageviews');
  let limited = false;
  for (let index = 0; index < 65; index++)
    if ((await report({ path: '/', language: 'en' })).status === 429)
      limited = true;
  assert.equal(limited, true);
  assert.equal((await fetch(base + '/api/health')).status, 200);
});

void test('scheduled cleanup prunes expired aggregates even without new visitors', () => {
  database.db
    .prepare('INSERT INTO website_pageviews VALUES(?,?,?,?,?)')
    .run('2000-01-01', 'poladcharkhesh.ir', '/', 'fa', 9);
  analytics.pruneWebsiteStatistics(new Date(Date.now() + 86_400_000));
  assert.equal(
    database.db
      .prepare(
        "SELECT COUNT(*) n FROM website_pageviews WHERE day='2000-01-01'",
      )
      .get()!.n,
    0,
  );
  assert.ok(
    Number(
      database.db.prepare('SELECT SUM(views) n FROM website_pageviews').get()!
        .n,
    ) > 0,
  );
});
