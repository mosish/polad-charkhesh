import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { db, audit } from './database';
const pbkdf2 = promisify(crypto.pbkdf2);
export const production = process.env.NODE_ENV === 'production';
if (
  production &&
  (!process.env.SESSION_SECRET?.trim() || !process.env.COOKIE_SECRET?.trim())
)
  throw new Error(
    'SESSION_SECRET and COOKIE_SECRET are required in production.',
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
export function getUser(req: any) {
  const token = req.signedCookies?.pc_session;
  if (typeof token !== 'string') return null;
  return db
    .prepare(
      'SELECT a.id,a.username,a.role FROM sessions s JOIN admins a ON a.id=s.admin_id WHERE s.token_hash=? AND s.expires>?',
    )
    .get(hashToken(token), Date.now()) as any;
}
export function authenticated(req: any, res: any, next: any) {
  req.user = getUser(req);
  if (!req.user)
    return res
      .status(401)
      .json({ error: 'Your session has expired. Please sign in.' });
  next();
}
export function superadmin(req: any, res: any, next: any) {
  if (req.user?.role !== 'superadmin')
    return res.status(403).json({ error: 'Super-admin access required.' });
  next();
}
export function issueSession(req: any, res: any, user: any) {
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(
    hashToken(token),
    user.id,
    Date.now() + 12 * 3600 * 1000,
  );
  res.cookie('pc_session', token, cookieOptions);
  audit(user.username, 'LOGIN');
}
export function limit(scope: string, max: number, windowMs: number) {
  return (req: any, res: any, next: any) => {
    const now = Date.now(),
      key = scope + ':' + req.ip;
    const row = db
      .prepare('SELECT * FROM rate_limits WHERE key=?')
      .get(key) as any;
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
