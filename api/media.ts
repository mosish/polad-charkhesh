import { Router } from 'express';
import crypto from 'node:crypto';
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';
import { authenticated } from './security';
import { db, parse, audit } from './database';
export const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'data/uploads');
mkdirSync(uploadDir, { recursive: true });
export const media = Router();
media.use(authenticated);
media.get('/', (_req, res) =>
  res.json({
    media: db
      .prepare('SELECT * FROM media ORDER BY rowid DESC')
      .all()
      .map(parse),
  }),
);
media.post('/', (req: any, res) => {
  const { name, mime, base64 } = req.body;
  if (
    typeof name !== 'string' ||
    name.length > 200 ||
    typeof base64 !== 'string' ||
    base64.length > 8 * 1024 * 1024
  )
    return res
      .status(400)
      .json({ error: 'Choose an image or PDF up to 5 MB.' });
  const b = Buffer.from(base64, 'base64');
  if (b.length > 5 * 1024 * 1024 || !b.length)
    return res.status(400).json({ error: 'Maximum file size is 5 MB.' });
  const valid =
    mime === 'image/png'
      ? b.subarray(0, 8).toString('hex') === '89504e470d0a1a0a'
      : mime === 'image/jpeg'
        ? b[0] === 255 && b[1] === 216 && b[2] === 255
        : mime === 'image/webp'
          ? b.toString('ascii', 0, 4) === 'RIFF' &&
            b.toString('ascii', 8, 12) === 'WEBP'
          : mime === 'application/pdf'
            ? b.toString('ascii', 0, 5) === '%PDF-'
            : false;
  if (!valid)
    return res.status(400).json({
      error: 'File contents do not match an allowed image or PDF format.',
    });
  const id = crypto.randomUUID(),
    ext = (
      {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/webp': 'webp',
        'application/pdf': 'pdf',
      } as any
    )[mime],
    filename = id + '.' + ext;
  writeFileSync(path.join(uploadDir, filename), b, { flag: 'wx' });
  const item = {
    id,
    name: name.replace(/[<>]/g, ''),
    mime,
    size: b.length,
    url: '/uploads/' + filename,
    createdAt: new Date().toISOString(),
  };
  db.prepare('INSERT INTO media VALUES(?,?)').run(id, JSON.stringify(item));
  audit(req.user.username, 'MEDIA_UPLOADED', id);
  res.status(201).json({ media: item });
});
media.delete('/:id', (req: any, res) => {
  const m = parse(
    db.prepare('SELECT * FROM media WHERE id=?').get(req.params.id),
  );
  if (!m) return res.status(404).json({ error: 'Media not found.' });
  if (req.body.confirm !== m.name)
    return res.status(400).json({ error: 'Confirm the filename.' });
  if (
    db
      .prepare('SELECT id FROM products WHERE instr(data,?)>0 LIMIT 1')
      .get(m.url) ||
    db
      .prepare('SELECT kind FROM settings WHERE instr(data,?)>0 LIMIT 1')
      .get(m.url)
  )
    return res
      .status(409)
      .json({ error: 'This media is in use. Replace its associations first.' });
  const p = path.join(uploadDir, path.basename(m.url));
  if (existsSync(p)) unlinkSync(p);
  db.prepare('DELETE FROM media WHERE id=?').run(m.id);
  audit(req.user.username, 'MEDIA_DELETED', m.id);
  res.json({ success: true });
});
