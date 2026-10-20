import { requestBody, sessionUser, type ApiRequest } from './request';
import type { MediaRecord } from './records';
import { Router } from 'express';
import crypto from 'node:crypto';
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';
import { authenticated } from './security';
import { db, parse, audit } from './database';
import { normalizeMedia, MediaValidationError } from './media-processing';
if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.UPLOAD_DIR || !path.isAbsolute(process.env.UPLOAD_DIR))
)
  throw new Error('UPLOAD_DIR must be an absolute persistent path in production.');
export const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'data/uploads');
mkdirSync(uploadDir, { recursive: true });
export const media = Router();
media.use(authenticated);
media.get('/', (_req, res) =>
  res.json({
    media: db
      .prepare('SELECT * FROM media ORDER BY rowid DESC')
      .all()
      .map(row => parse<MediaRecord>(row)),
  }),
);
media.post('/', async (req: ApiRequest, res) => {
  const body = requestBody(req);
  const { name, mime, base64 } = body;
  if (
    typeof name !== 'string' ||
    name.length > 200 ||
    typeof mime !== 'string' ||
    typeof base64 !== 'string' ||
    base64.length > 8 * 1024 * 1024
  )
    return res
      .status(400)
      .json({ error: 'Choose an image or PDF up to 5 MB.' });
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64))
    return res.status(400).json({ error: 'Invalid base64 encoding.' });
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
  let normalized;
  try { normalized = await normalizeMedia(b, mime); }
  catch (error) {
    if (error instanceof MediaValidationError) {
      if (error.status === 503) res.set('Retry-After', '30');
      return res.status(error.status).json({ error: error.message });
    }
    throw error;
  }
  const id = crypto.randomUUID(),
    ext = normalized.ext,
    filename = id + '.' + ext;
  writeFileSync(path.join(uploadDir, filename), normalized.bytes, { flag: 'wx', mode: 0o600 });
  const item = {
    id,
    name: name.replace(/[<>]/g, ''),
    mime: normalized.mime,
    size: normalized.bytes.length,
    url: '/uploads/' + filename,
    createdAt: new Date().toISOString(),
  };
  try { db.prepare('INSERT INTO media VALUES(?,?)').run(id, JSON.stringify(item)); }
  catch (error) { unlinkSync(path.join(uploadDir, filename)); throw error; }
  audit(sessionUser(req).username, 'MEDIA_UPLOADED', id);
  res.status(201).json({ media: item });
});
media.delete('/:id', (req: ApiRequest, res) => {
  const body = requestBody(req);
  const m = parse<MediaRecord>(
    db.prepare('SELECT * FROM media WHERE id=?').get(req.params.id),
  );
  if (!m) return res.status(404).json({ error: 'Media not found.' });
  if (body.confirm !== m.name)
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
  audit(sessionUser(req).username, 'MEDIA_DELETED', m.id);
  res.json({ success: true });
});
