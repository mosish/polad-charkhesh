import { sameShape } from './settings-shape';
import { upgradeContent } from '../domain/site-content';
import { Router } from 'express';
import crypto from 'node:crypto';
import {
  db,
  allProducts,
  setting,
  putSetting,
  putProduct,
  transaction,
  audit,
} from './database';
import { authenticated, superadmin } from './security';
import { validateProduct, validateSettings, safeObject } from './validation';
export const system = Router();
system.use(authenticated);
export function snapshot() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    products: allProducts(true),
    company: setting('company'),
    content: setting('content'),
    seo: setting('seo'),
    inquiries: db.prepare('SELECT * FROM inquiries').all(),
    media: db.prepare('SELECT * FROM media').all(),
  };
}
system.get('/status', (_req, res) => {
  const products = allProducts(true);
  const brands = new Set<string>(products.flatMap((p) => Array.isArray(p.brands) ? p.brands.filter((brand: unknown): brand is string => typeof brand === 'string' && brand.length > 0) : []));
  const count = (sql: string) => Number((db.prepare(sql).get() as { n: number }).n);
  res.json({
    version: '2026.1',
    database: 'connected',
    products: products.length,
    active: products.filter((p) => !p.isArchived).length,
    archived: products.filter((p) => p.isArchived).length,
    inquiries: count('SELECT count(*) n FROM inquiries'),
    newInquiries: count("SELECT count(*) n FROM inquiries WHERE status='new'"),
    media: count('SELECT count(*) n FROM media'),
    auditEvents: count('SELECT count(*) n FROM audit_logs'),
    brands: brands.size,
    factorsRecorded: products.filter((p) => !p.isArchived && [p.calculationFactorE,p.calculationFactorY,p.calculationFactorF0].some((v) => typeof v === 'number' && Number.isFinite(v))).length,
  });
});
system.get('/audit', (_req, res) =>
  res.json({
    logs: db
      .prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 300')
      .all(),
  }),
);
system.get('/backup', (req: any, res) => {
  audit(req.user.username, 'BACKUP_EXPORTED');
  res.attachment('polad-charkhesh-backup.json').json(snapshot());
});
system.post('/restore', superadmin, (req: any, res) => {
  const { backup: b, confirm } = req.body;
  if (
    confirm !== 'RESTORE' ||
    !b ||
    b.version !== 1 ||
    !safeObject(b) ||
    !Array.isArray(b.products) ||
    !b.products.length ||
    b.products.length > 10000
  )
    return res.status(400).json({ error: 'Invalid backup or confirmation.' });
  for (const p of b.products) {
    const errors = validateProduct(p);
    if (errors.length) return res.status(400).json({ error: errors.join(' ') });
  }
  if (
    new Set(b.products.map((p: any) => p.id)).size !== b.products.length ||
    new Set(b.products.map((p: any) => p.slug)).size !== b.products.length ||
    new Set(b.products.map((p: any) => p.code.toLowerCase())).size !==
      b.products.length
  )
    return res
      .status(400)
      .json({ error: 'Duplicate product identities in backup.' });
  if(!b.content||typeof b.content!=='object'||Array.isArray(b.content))return res.status(400).json({error:'Invalid backup content.'});
  b.content = upgradeContent(b.content);
  for (const k of ['company', 'content', 'seo'])
    if (
      validateSettings(k, b[k]).length ||
      (k !== 'content' && !sameShape(b[k], setting(k)))
    )
      return res.status(400).json({ error: 'Invalid backup settings.' });
  if (!Array.isArray(b.inquiries) || !Array.isArray(b.media))
    return res.status(400).json({ error: 'Invalid backup collections.' });
  for (const i of b.inquiries) {
    let value;
    try {
      value = JSON.parse(i.data);
    } catch {
      return res.status(400).json({ error: 'Invalid inquiry record.' });
    }
    if (
      typeof i.id !== 'string' ||
      !['new', 'reviewed', 'contacted', 'closed'].includes(i.status) ||
      !value ||
      typeof value.message !== 'string' ||
      !safeObject(value)
    )
      return res.status(400).json({ error: 'Invalid inquiry record.' });
  }
  for (const m of b.media) {
    let value;
    try {
      value = JSON.parse(m.data);
    } catch {
      return res.status(400).json({ error: 'Invalid media record.' });
    }
    if (
      !value ||
      typeof m.id !== 'string' ||
      !['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(
        value.mime,
      ) ||
      !/^\/uploads\/[a-z0-9.-]+$/.test(value.url)
    )
      return res.status(400).json({ error: 'Invalid media metadata.' });
  }
  transaction(() => {
    db.prepare('INSERT INTO backup_snapshots VALUES(?,?,?)').run(
      crypto.randomUUID(),
      new Date().toISOString(),
      JSON.stringify(snapshot()),
    );
    db.exec('DELETE FROM products;DELETE FROM inquiries;DELETE FROM media;');
    b.products.forEach(putProduct);
    for (const k of ['company', 'content', 'seo']) putSetting(k, b[k]);
    for (const i of b.inquiries)
      db.prepare('INSERT INTO inquiries VALUES(?,?,?,?,?)').run(
        i.id,
        i.created_at,
        i.updated_at,
        i.status,
        i.data,
      );
    for (const m of b.media)
      db.prepare('INSERT INTO media VALUES(?,?)').run(m.id, m.data);
    audit(req.user.username, 'BACKUP_IMPORTED');
  });
  res.json({ success: true });
});
