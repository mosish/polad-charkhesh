import { sameShape } from './settings-shape';
import { Router } from 'express';
import crypto from 'node:crypto';
import { setting, putSetting, db, audit, parse } from './database';
import { authenticated, limit } from './security';
import { validateSettings } from './validation';
export const content = Router();
for (const kind of ['company', 'content', 'seo']) {
  content.get('/' + kind, (_req, res) => res.json({ data: setting(kind) }));
  content.put('/' + kind, authenticated, (req: any, res) => {
    const errors = validateSettings(kind, req.body);
    if (kind !== 'content' && !sameShape(req.body, setting(kind)))
      errors.push(
        'All existing settings fields must be preserved with their original types.',
      );
    if (errors.length) return res.status(400).json({ error: errors.join(' ') });
    putSetting(kind, req.body);
    audit(req.user.username, kind.toUpperCase() + '_UPDATED');
    res.json({ data: setting(kind) });
  });
}
content.post('/inquiries', limit('inquiries', 5, 3600000), (req, res) => {
  const {
    name,
    phone,
    company = '',
    email = '',
    message,
    website = '',
  } = req.body;
  if (website) return res.status(400).json({ error: 'Invalid submission.' });
  if (
    typeof name !== 'string' ||
    name.trim().length < 2 ||
    name.length > 120 ||
    typeof phone !== 'string' ||
    !/^[+0-9()\s-]{7,30}$/.test(phone) ||
    typeof message !== 'string' ||
    message.trim().length < 10 ||
    message.length > 5000 ||
    typeof company !== 'string' ||
    company.length > 200 ||
    typeof email !== 'string' ||
    email.length > 200 ||
    (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  )
    return res.status(400).json({
      error: 'Check your name, phone and message (at least 10 characters).',
    });
  const id = crypto.randomUUID(),
    now = new Date().toISOString();
  db.prepare('INSERT INTO inquiries VALUES(?,?,?,?,?)').run(
    id,
    now,
    now,
    'new',
    JSON.stringify({
      name: name.trim(),
      phone,
      company,
      email,
      message: message.trim(),
    }),
  );
  res.status(201).json({ id, success: true });
});
content.get('/inquiries', authenticated, (_req, res) =>
  res.json({
    inquiries: db
      .prepare('SELECT * FROM inquiries ORDER BY created_at DESC')
      .all()
      .map((r: any) => ({ ...r, ...parse(r), data: undefined })),
  }),
);
content.patch('/inquiries/:id', authenticated, (req: any, res) => {
  const status = req.body.status;
  if (!['new', 'reviewed', 'contacted', 'closed'].includes(status))
    return res.status(400).json({ error: 'Invalid status.' });
  const r = db
    .prepare('UPDATE inquiries SET status=?,updated_at=? WHERE id=?')
    .run(status, new Date().toISOString(), req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Inquiry not found.' });
  audit(
    req.user.username,
    'INQUIRY_STATUS_CHANGED',
    req.params.id + ':' + status,
  );
  res.json({ success: true });
});
