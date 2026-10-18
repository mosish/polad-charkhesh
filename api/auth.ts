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
} from './security';
export const auth = Router();
const configured = () =>
  Number(db.prepare('SELECT count(*) n FROM admins').get()?.n) > 0;
auth.get('/status', (req, res) =>
  res.json({ isConfigured: configured(), user: getUser(req) }),
);
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
    typeof password !== 'string' ||
    password.length > 256
  )
    return res.status(400).json({ error: 'Enter your username and password.' });
  const user = db
    .prepare('SELECT * FROM admins WHERE username=?')
    .get(username.toLowerCase()) as AdminRecord | undefined;
  const dummy =
    '210000:000000000000000000000000000000000000000000000000:' +
    '00'.repeat(64);
  const valid = await verifyPassword(password, user?.password_hash || dummy);
  if (!user || !valid)
    return res.status(401).json({ error: 'Incorrect username or password.' });
  issueSession(res, user);
  res.json({ user: { id: user.id, username: user.username, role: user.role } });
});
auth.post('/logout', authenticated, (req: ApiRequest, res) => {
  db.prepare('DELETE FROM sessions WHERE token_hash=?').run(
    hashToken(req.signedCookies.pc_session),
  );
  res.clearCookie('pc_session', cookieOptions);
  audit(sessionUser(req).username, 'LOGOUT');
  res.json({ success: true });
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
