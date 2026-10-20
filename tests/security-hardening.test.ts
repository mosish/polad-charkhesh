import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { generateKeyPair, exportJWK, SignJWT, createLocalJWKSet } from 'jose';
import { protectedAccessPath, verifyAccessToken } from '../api/access';
import { jsonForHtml } from '../domain/seo';

process.env.TEST_IMPORT = '1';
process.env.MFA_REQUIRED = 'true';
process.env.MFA_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
process.env.DATABASE_PATH = path.join(mkdtempSync(path.join(tmpdir(), 'polad-mfa-')), 'test.sqlite');
process.env.UPLOAD_DIR = path.join(path.dirname(process.env.DATABASE_PATH), 'uploads');
let server: Server, base: string, cookie = '', pendingCookie = '', secret = '', recovery: string[];
let database: typeof import('../api/database'), security: typeof import('../api/security'), mfa: typeof import('../api/mfa');
const password = 'Synthetic-test-password-only';
before(async () => {
  const { app } = await import('../api/index');
  database = await import('../api/database'); security = await import('../api/security'); mfa = await import('../api/mfa');
  await new Promise<void>((resolve, reject) => { server = app.listen(0, '127.0.0.1', error => error ? reject(error) : resolve()); });
  base = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;
});
after(() => { server?.close(); database?.db.close(); });
async function request(route: string, body?: unknown, session = cookie, method = body === undefined ? 'GET' : 'POST') {
  const response = await fetch(base + '/api' + route, {
    method, headers: { 'Content-Type': 'application/json', Cookie: session },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] || '' };
}
void test('TOTP matches RFC 6238 SHA-1 reference vectors and rejects replay', () => {
  const rfcSecret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
  for (const [time, expected] of [[59, '94287082'], [1111111109, '07081804'], [1111111111, '14050471'], [1234567890, '89005924'], [2000000000, '69279037'], [20000000000, '65353130']] as const)
    assert.equal(mfa.totp(rfcSecret, Math.floor(time / 30), 8), expected);
  assert.equal(mfa.matchTotp(rfcSecret, '287082', -1, 59000), 1);
  assert.equal(mfa.matchTotp(rfcSecret, '287082', 1, 59000), null);
  const encrypted = mfa.sealSecret(rfcSecret, 'admin-a');
  assert.equal(mfa.openSecret(encrypted, 'admin-a'), rfcSecret);
  assert.throws(() => mfa.openSecret(encrypted, 'admin-b'));
});
void test('mandatory enrollment session cannot read private data or mutate the catalog', async () => {
  const setup = await request('/auth/setup', { username: 'owner', password });
  assert.equal(setup.status, 201); cookie = pendingCookie = setup.cookie;
  const status = await request('/auth/status');
  assert.equal(status.data.user, null); assert.equal(status.data.enrollmentRequired, true);
  for (const route of ['/system/backup', '/system/audit', '/inquiries', '/media'])
    assert.equal((await request(route)).status, 401);
  assert.equal((await request('/products', {})).status, 401);
  assert.equal((await request('/auth/mfa/start', { password: 'wrong' })).status, 401);
  const start = await request('/auth/mfa/start', { password });
  assert.equal(start.status, 200); secret = start.data.secret;
  assert.match(secret, /^[A-Z2-7]{32}$/);
  const row = database.db.prepare('SELECT pending_secret FROM admin_mfa').get()!;
  assert.ok(!String(row.pending_secret).includes(secret));
});
void test('confirmed MFA revokes pending sessions and returns recovery codes only once', async () => {
  const confirmed = await request('/auth/mfa/confirm', { code: mfa.totp(secret, Math.floor(Date.now() / 30000)) });
  assert.equal(confirmed.status, 200); cookie = confirmed.cookie; recovery = confirmed.data.recoveryCodes;
  assert.equal(recovery.length, 10); assert.equal(new Set(recovery).size, 10);
  assert.equal((await request('/auth/status')).data.mfaEnabled, true);
  assert.equal((await request('/system/status', undefined, pendingCookie)).status, 401);
  assert.equal((await request('/system/status')).status, 200);
  const stored = database.db.prepare('SELECT recovery FROM admin_mfa').get()!;
  for (const code of recovery) assert.ok(!String(stored.recovery).includes(code));
  assert.equal((await request('/auth/mfa/confirm', { code: '000000' })).status, 400);
});
void test('password alone and replayed OTP cannot authenticate; recovery codes are one-time', async () => {
  const firstSession = cookie;
  assert.equal((await request('/auth/login', { username: 'owner', password }, '')).status, 401);
  assert.equal((await request('/auth/login', { username: 'owner', password, code: mfa.totp(secret, Number(database.db.prepare('SELECT last_step FROM admin_mfa').get()!.last_step)) }, '')).status, 401);
  const login = await request('/auth/login', { username: 'owner', password, code: recovery[0] }, '');
  assert.equal(login.status, 200); cookie = login.cookie;
  assert.equal((await request('/system/status', undefined, firstSession)).status, 401);
  assert.equal((await request('/auth/login', { username: 'owner', password, code: recovery[0] }, '')).status, 401);
  assert.equal(database.db.prepare("SELECT count(*) n FROM audit_logs WHERE action='SECURITY_ALERT_MFA_RECOVERY_USED'").get()!.n, 1);
});
void test('account-level failures survive IP limiter resets; lock expiry permits recovery', async () => {
  security.clearLoginFailures('owner');
  for (let i = 0; i < 5; i++) {
    database.db.exec('DELETE FROM rate_limits');
    assert.equal((await request('/auth/login', { username: 'OWNER', password: 'incorrect' }, '')).status, 401);
  }
  database.db.exec('DELETE FROM rate_limits');
  assert.equal((await request('/auth/login', { username: 'owner', password, code: recovery[1] }, '')).status, 429);
  assert.equal(database.db.prepare("SELECT count(*) n FROM audit_logs WHERE action='SECURITY_ALERT_ACCOUNT_LOCKED'").get()!.n, 1);
  database.db.exec('UPDATE login_failures SET reset=0,locked_until=0');
  const login = await request('/auth/login', { username: 'owner', password, code: recovery[1] }, '');
  assert.equal(login.status, 200); cookie = login.cookie;
});
void test('editors cannot export backups, read security audit or restore; cleanup preserves active sessions', async () => {
  database.db.exec("UPDATE admins SET role='editor'");
  for (const route of ['/system/backup', '/system/audit']) assert.equal((await request(route)).status, 403);
  assert.equal((await request('/system/restore', { confirm: 'RESTORE' })).status, 403);
  assert.equal((await request('/system/status')).status, 200);
  database.db.exec("INSERT INTO sessions SELECT 'expired',id,0 FROM admins LIMIT 1; INSERT INTO session_assurance VALUES('expired',1); INSERT INTO rate_limits VALUES('expired',9,0)");
  security.cleanupSecurityState();
  assert.equal(database.db.prepare("SELECT count(*) n FROM sessions WHERE token_hash='expired'").get()!.n, 0);
  assert.equal(database.db.prepare("SELECT count(*) n FROM session_assurance WHERE token_hash='expired'").get()!.n, 0);
  assert.equal((await request('/system/status')).status, 200);
});
void test('Cloudflare token validation rejects forged, expired and wrong-audience assertions', async () => {
  const pair = await generateKeyPair('RS256'), jwk = await exportJWK(pair.publicKey);
  const keys = createLocalJWKSet({ keys: [{ ...jwk, kid: 'test', alg: 'RS256' }] });
  const issuer = 'https://example.cloudflareaccess.com';
  const signed = (aud: string, expires = '5m') => new SignJWT({ email: 'test@example.com', type: 'app' })
    .setProtectedHeader({ alg: 'RS256', kid: 'test' }).setIssuer(issuer).setAudience(aud)
    .setSubject('test').setIssuedAt().setExpirationTime(expires).sign(pair.privateKey);
  assert.equal((await verifyAccessToken(await signed('valid'), issuer, ['valid'], keys)).sub, 'test');
  await assert.rejects(verifyAccessToken(await signed('wrong'), issuer, ['valid'], keys));
  await assert.rejects(verifyAccessToken(await signed('valid', '-1m'), issuer, ['valid'], keys));
  await assert.rejects(verifyAccessToken('forged', issuer, ['valid'], keys));
  for (const [p, method, q] of [['/admin/', 'GET', {}], ['/api/auth/login', 'POST', {}], ['/api/products', 'PUT', {}], ['/api/products', 'GET', { includeArchived: 'true' }], ['/api/inquiries', 'GET', {}], ['/', 'GET', { preview: '1' }]] as const)
    assert.equal(protectedAccessPath(p, method, q), true);
  assert.equal(protectedAccessPath('/api/inquiries', 'POST', {}), false);
  assert.equal(protectedAccessPath('/api/products', 'GET', {}), false);
});
void test('embedded JSON round-trips script delimiters and Unicode separators safely', () => {
  const value = { text: '</script><img src=x onerror=alert(1)>&\u2028\u2029' };
  const json = jsonForHtml(value);
  assert.ok(!/[<>&\u2028\u2029]/.test(json)); assert.deepEqual(JSON.parse(json), value);
});
