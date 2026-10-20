import type { Request, RequestHandler, Response, NextFunction } from 'express';
import type { ApiRequest } from './request';
import type { SessionUser } from './records';
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { db, audit } from './database';
import { mfaRequired } from './mfa';
const pbkdf2 = promisify(crypto.pbkdf2);
export const production = process.env.NODE_ENV === 'production';
if (
  production &&
  ((process.env.SESSION_SECRET?.trim().length || 0) < 32 ||
    (process.env.COOKIE_SECRET?.trim().length || 0) < 32)
)
  throw new Error(
    'SESSION_SECRET and COOKIE_SECRET must each contain at least 32 characters in production.',
  );
if (
  production &&
  !(db.prepare('SELECT count(*) AS n FROM admins').get() as { n: number }).n &&
  (process.env.SETUP_TOKEN?.trim().length || 0) < 24
)
  throw new Error(
    'SETUP_TOKEN must contain at least 24 characters until the first administrator is created.',
  );
export const cookieSecret =
  process.env.COOKIE_SECRET || crypto.randomBytes(32).toString('hex');
const sessionSecret =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
export const hashToken = (token: string) =>
  crypto.createHmac('sha256', sessionSecret).update(token).digest('hex');
export async function hashPassword(p: string) {
  const salt = crypto.randomBytes(24).toString('hex');
  return `210000:${salt}:${(await pbkdf2(p, salt, 210000, 64, 'sha512')).toString('hex')}`;
}
export async function verifyPassword(p: string, h: string) {
  const [i, s, k] = h.split(':');
  const actual = await pbkdf2(p, s, Number(i), 64, 'sha512');
  const expected = Buffer.from(k, 'hex');
  return (
    actual.length === expected.length &&
    crypto.timingSafeEqual(actual, expected)
  );
}
export const cookieOptions = {
  httpOnly: true,
  secure: production,
  sameSite: 'strict' as const,
  signed: true,
  path: '/',
  maxAge: 12 * 3600 * 1000,
};
export function getSessionUser(req: Pick<Request, 'signedCookies'>, requireAssurance = true): SessionUser | null {
  const token: unknown = req.signedCookies?.pc_session;
  if (typeof token !== 'string') return null;
  return db
    .prepare(
      `SELECT a.id,a.username,a.role FROM sessions s JOIN admins a ON a.id=s.admin_id
       LEFT JOIN session_assurance v ON v.token_hash=s.token_hash
       LEFT JOIN admin_mfa m ON m.admin_id=a.id
       WHERE s.token_hash=? AND s.expires>? AND
       (?=0 OR (COALESCE(v.mfa_verified,0)=1 OR (?=0 AND m.secret IS NULL)))`,
    )
    .get(hashToken(token), Date.now(), requireAssurance ? 1 : 0, mfaRequired ? 1 : 0) as SessionUser | undefined ?? null;
}
export const getUser = (req: Pick<Request, 'signedCookies'>) => getSessionUser(req);
export function authenticated(req: ApiRequest, res: Response, next: NextFunction) {
  req.user = getUser(req);
  if (!req.user)
    return res
      .status(401)
      .json({ error: 'Your session has expired. Please sign in.' });
  next();
}
export function superadmin(req: ApiRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'superadmin')
    return res.status(403).json({ error: 'Super-admin access required.' });
  next();
}
export function issueSession(res: Response, user: SessionUser, verified = false) {
  const token = crypto.randomBytes(32).toString('base64url');
  const pending = !verified && (mfaRequired || Boolean(db.prepare('SELECT secret FROM admin_mfa WHERE admin_id=?').get(user.id)?.secret));
  const maxAge = pending ? 10 * 60_000 : cookieOptions.maxAge;
  db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(
    hashToken(token),
    user.id,
    Date.now() + maxAge,
  );
  db.prepare('INSERT INTO session_assurance VALUES(?,?)').run(hashToken(token), verified ? 1 : 0);
  res.cookie('pc_session', token, { ...cookieOptions, maxAge });
  audit(user.username, pending ? 'MFA_ENROLLMENT_SESSION' : 'LOGIN');
}
export function accountKey(username: string) { return hashToken('login-account:' + username.toLowerCase()); }
export function accountLocked(username: string) {
  return Number(db.prepare('SELECT locked_until FROM login_failures WHERE key=?').get(accountKey(username))?.locked_until || 0) > Date.now();
}
export function failedLogin(username: string) {
  const now = Date.now(), key = accountKey(username);
  db.prepare(`INSERT INTO login_failures VALUES(?,1,?,0)
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset>? THEN count+1 ELSE 1 END,
    reset=CASE WHEN reset>? THEN reset ELSE excluded.reset END,
    locked_until=CASE WHEN reset>? AND count>=4 THEN ? ELSE 0 END`
  ).run(key, now + 900_000, now, now, now, now + 900_000);
  audit('anonymous', 'AUTH_FAILURE', key);
  if (accountLocked(username)) {
    audit('system', 'SECURITY_ALERT_ACCOUNT_LOCKED', key);
    console.warn(JSON.stringify({ event: 'SECURITY_ALERT_ACCOUNT_LOCKED', account: key, at: new Date(now).toISOString() }));
  }
}
export function clearLoginFailures(username: string) {
  db.prepare('DELETE FROM login_failures WHERE key=?').run(accountKey(username));
}
export function cleanupSecurityState(now = Date.now()) {
  db.prepare('DELETE FROM sessions WHERE expires<=?').run(now);
  db.prepare('DELETE FROM rate_limits WHERE reset<=?').run(now);
  db.prepare('DELETE FROM login_failures WHERE reset<=? AND locked_until<=?').run(now, now);
  db.prepare('UPDATE admin_mfa SET pending_secret=NULL,pending_expires=0 WHERE pending_expires>0 AND pending_expires<=?').run(now);
}
export function limit(scope: string, max: number, windowMs: number): RequestHandler {
  return (req, res, next) => {
    const now = Date.now(),
      key = scope + ':' + req.ip;
    const row = db
      .prepare('SELECT * FROM rate_limits WHERE key=?')
      .get(key) as { reset: number; count: number } | undefined;
    if (row && row.reset > now && row.count >= max)
      return res
        .status(429)
        .json({ error: 'Too many attempts. Please try again later.' });
    db.prepare(
      'INSERT INTO rate_limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset>? THEN count+1 ELSE 1 END,reset=CASE WHEN reset>? THEN reset ELSE excluded.reset END',
    ).run(key, now + windowMs, now, now);
    next();
  };
}
