import { requestBody, sessionUser, type ApiRequest } from './request';
import type { AdminRecord, SessionUser } from './records';
import { Router } from 'express';
import crypto from 'node:crypto';
import { db, audit, transaction } from './database';
import {
  authenticated,
  cookieOptions,
  getUser,
  hashPassword,
  verifyPassword,
  issueSession,
  hashToken,
  limit,
  production,
  getSessionUser, accountLocked, failedLogin, clearLoginFailures,
} from './security';
import { mfaRequired, mfaAvailable, newTotpSecret, sealSecret, openSecret, matchTotp, newRecoveryCodes, recoveryHash } from './mfa';
interface MfaRecord { secret: string | null; pending_secret: string | null; pending_expires: number; last_step: number; recovery: string }
const mfaRecord = (id: string) => db.prepare('SELECT * FROM admin_mfa WHERE admin_id=?').get(id) as MfaRecord | undefined;
const locked = (res: import('express').Response) => res.status(429).set('Retry-After', '900').json({ error: 'Too many attempts. Please try again in 15 minutes.' });
function consumeFactor(user: SessionUser, code: unknown, allowRecovery = true) {
  const record = mfaRecord(user.id);
  if (!record?.secret || typeof code !== 'string') return false;
  const step = matchTotp(openSecret(record.secret, user.id), code.trim(), record.last_step);
  if (step !== null) {
    return Number(db.prepare('UPDATE admin_mfa SET last_step=? WHERE admin_id=? AND last_step<?').run(step, user.id, step).changes) === 1;
  }
  if (!allowRecovery || !/^(?:[a-f0-9]{8}-){3}[a-f0-9]{8}$/i.test(code.trim())) return false;
  const hash = recoveryHash(code.trim());
  return transaction(() => {
    const hashes: string[] = JSON.parse(mfaRecord(user.id)!.recovery);
    if (!hashes.includes(hash)) return false;
    db.prepare('UPDATE admin_mfa SET recovery=? WHERE admin_id=?').run(JSON.stringify(hashes.filter(h => h !== hash)), user.id);
    db.prepare('DELETE FROM sessions WHERE admin_id=?').run(user.id);
    audit(user.username, 'SECURITY_ALERT_MFA_RECOVERY_USED');
    console.warn(JSON.stringify({ event: 'SECURITY_ALERT_MFA_RECOVERY_USED', adminId: user.id }));
    return true;
  });
}
export const auth = Router();
const configured = () =>
  Number(db.prepare('SELECT count(*) n FROM admins').get()?.n) > 0;
auth.get('/status', (req, res) => {
  const user = getUser(req), pending = getSessionUser(req, false);
  res.json({ isConfigured: configured(), user,
    enrollmentRequired: !user && !!pending && !mfaRecord(pending.id)?.secret,
    mfaEnabled: !!user && !!mfaRecord(user.id)?.secret, mfaAvailable, mfaRequired });
});
auth.post('/setup', limit('setup', 5, 900000), async (req: ApiRequest, res) => {
  const body = requestBody(req);
  if (configured())
    return res.status(403).json({ error: 'Administrator already configured.' });
  if (
    production &&
    (!process.env.SETUP_TOKEN ||
      body.setupToken !== process.env.SETUP_TOKEN)
  )
    return res
      .status(403)
      .json({ error: 'A valid server setup token is required.' });
  if (
    typeof body.username !== 'string' ||
    !/^[a-zA-Z0-9._-]{3,64}$/.test(body.username) ||
    typeof body.password !== 'string' ||
    body.password.length < 12 ||
    body.password.length > 256
  )
    return res.status(400).json({
      error: 'Use a valid username and a password of 12–256 characters.',
    });
  const h = await hashPassword(body.password);
  const username = body.username.toLowerCase();
  const user = transaction((): SessionUser => {
    if (configured()) throw new Error('Setup already completed.');
    const user: SessionUser = {
      id: crypto.randomUUID(),
      username,
      role: 'superadmin',
    };
    db.prepare('INSERT INTO admins VALUES(?,?,?,?)').run(
      user.id,
      user.username,
      h,
      user.role,
    );
    return user;
  });
  issueSession(res, user);
  audit(user.username, 'ADMIN_PROVISIONED');
  res.status(201).json({ user });
});
auth.post('/login', limit('login', 15, 900000), async (req: ApiRequest, res) => {
  const body = requestBody(req);
  const { username, password } = body;
  if (
    typeof username !== 'string' ||
    !/^[a-zA-Z0-9._-]{3,64}$/.test(username) ||
    typeof password !== 'string' ||
    password.length > 256
  )
    return res.status(400).json({ error: 'Enter your username and password.' });
  if (accountLocked(username)) return locked(res);
  const user = db
    .prepare('SELECT * FROM admins WHERE username=?')
    .get(username.toLowerCase()) as AdminRecord | undefined;
  const dummy =
    '210000:000000000000000000000000000000000000000000000000:' +
    '00'.repeat(64);
  const valid = await verifyPassword(password, user?.password_hash || dummy);
  if (!user || !valid) {
    failedLogin(username);
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }
  if (accountLocked(username)) return locked(res);
  const enrolled = Boolean(mfaRecord(user.id)?.secret);
  if (enrolled && !consumeFactor(user, body.code)) {
    if (body.code) failedLogin(username);
    return res.status(401).json({ error: 'Enter a current authenticator code or an unused recovery code.', mfaRequired: true });
  }
  clearLoginFailures(username);
  issueSession(res, user, enrolled);
  res.json({ user: { id: user.id, username: user.username, role: user.role } });
});
auth.post('/logout', (req: ApiRequest, res) => {
  const user = getSessionUser(req, false);
  if (!user) return res.status(401).json({ error: 'Please sign in.' });
  db.prepare('DELETE FROM sessions WHERE token_hash=?').run(
    hashToken(req.signedCookies.pc_session),
  );
  res.clearCookie('pc_session', cookieOptions);
  audit(user.username, 'LOGOUT');
  res.json({ success: true });
});
auth.post('/mfa/start', limit('mfa-start', 5, 900_000), async (req: ApiRequest, res) => {
  const user = getSessionUser(req, false);
  if (!user) return res.status(401).json({ error: 'Please sign in again.' });
  if (!mfaAvailable) return res.status(503).json({ error: 'MFA encryption must be configured by the server administrator.' });
  if (mfaRecord(user.id)?.secret) return res.status(409).json({ error: 'MFA is already enabled.' });
  if (accountLocked(user.username)) return locked(res);
  const { password } = requestBody(req);
  const admin = db.prepare('SELECT password_hash FROM admins WHERE id=?').get(user.id) as { password_hash: string };
  if (typeof password !== 'string' || password.length > 256 || !await verifyPassword(password, admin.password_hash)) {
    failedLogin(user.username);
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }
  const secret = newTotpSecret();
  db.prepare(`INSERT INTO admin_mfa(admin_id,pending_secret,pending_expires) VALUES(?,?,?)
    ON CONFLICT(admin_id) DO UPDATE SET pending_secret=excluded.pending_secret,pending_expires=excluded.pending_expires`
  ).run(user.id, sealSecret(secret, user.id), Date.now() + 600_000);
  audit(user.username, 'MFA_ENROLLMENT_STARTED');
  res.json({ secret, uri: `otpauth://totp/${encodeURIComponent('Polad Charkhesh:' + user.username)}?secret=${secret}&issuer=Polad%20Charkhesh&algorithm=SHA1&digits=6&period=30` });
});
auth.post('/mfa/confirm', limit('mfa-confirm', 10, 900_000), (req: ApiRequest, res) => {
  const user = getSessionUser(req, false);
  if (!user) return res.status(401).json({ error: 'Please sign in again.' });
  if (accountLocked(user.username)) return locked(res);
  const record = mfaRecord(user.id);
  if (record?.secret || !record?.pending_secret || record.pending_expires <= Date.now())
    return res.status(400).json({ error: 'Restart authenticator enrollment.' });
  const step = matchTotp(openSecret(record.pending_secret, user.id), requestBody(req).code);
  if (step === null) {
    failedLogin(user.username);
    return res.status(400).json({ error: 'Invalid authenticator code.' });
  }
  const recovery = newRecoveryCodes();
  transaction(() => {
    db.prepare('UPDATE admin_mfa SET secret=pending_secret,pending_secret=NULL,pending_expires=0,last_step=?,recovery=? WHERE admin_id=?').run(step, recovery.hashes, user.id);
    db.prepare('DELETE FROM sessions WHERE admin_id=?').run(user.id);
    clearLoginFailures(user.username);
    issueSession(res, user, true);
    audit(user.username, 'MFA_ENABLED');
  });
  res.json({ recoveryCodes: recovery.codes });
});
auth.post('/mfa/recovery-codes', authenticated, limit('mfa-recovery', 5, 900_000), async (req: ApiRequest, res) => {
  const user = sessionUser(req), { password, code } = requestBody(req);
  if (accountLocked(user.username)) return locked(res);
  const admin = db.prepare('SELECT password_hash FROM admins WHERE id=?').get(user.id) as { password_hash: string };
  if (typeof password !== 'string' || password.length > 256 ||
      !await verifyPassword(password, admin.password_hash) || !consumeFactor(user, code, false)) {
    failedLogin(user.username);
    return res.status(401).json({ error: 'Password or authenticator code is incorrect.' });
  }
  const recovery = newRecoveryCodes();
  db.prepare('UPDATE admin_mfa SET recovery=? WHERE admin_id=?').run(recovery.hashes, user.id);
  clearLoginFailures(user.username);
  audit(user.username, 'MFA_RECOVERY_CODES_REPLACED');
  res.json({ recoveryCodes: recovery.codes });
});
auth.post(
  '/change-password',
  authenticated,
  limit('password', 10, 900000),
  async (req: ApiRequest, res) => {
    const body = requestBody(req);
    const { currentPassword, newPassword } = body;
    if (
      typeof currentPassword !== 'string' ||
      currentPassword.length > 256 ||
      typeof newPassword !== 'string' ||
      newPassword.length < 12 ||
      newPassword.length > 256
    )
      return res
        .status(400)
        .json({ error: 'New password must contain 12–256 characters.' });
    const u = db
      .prepare('SELECT * FROM admins WHERE id=?')
      .get(sessionUser(req).id) as AdminRecord | undefined;
    if (!u || !(await verifyPassword(currentPassword, u.password_hash)))
      return res.status(400).json({ error: 'Current password is incorrect.' });
    const h = await hashPassword(newPassword);
    transaction(() => {
      db.prepare('UPDATE admins SET password_hash=? WHERE id=?').run(h, u.id);
      db.prepare('DELETE FROM sessions WHERE admin_id=?').run(u.id);
    });
    res.clearCookie('pc_session', cookieOptions);
    audit(u.username, 'PASSWORD_CHANGED');
    res.json({ success: true });
  },
);
