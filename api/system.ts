import { requestBody, sessionUser, type ApiRequest } from './request';
import { planRestore } from './backup-plan';
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
import { websiteStatistics } from './analytics';
import { serverMetrics } from './server-metrics';
export const system = Router();
system.use(authenticated);
system.get('/dashboard', async (_req, res) => {
  const server = await serverMetrics();
  res.json({ sampledAt: new Date().toISOString(), website: websiteStatistics(), server });
});
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
    securityAlerts: db.prepare("SELECT timestamp,action FROM audit_logs WHERE action LIKE 'SECURITY_ALERT_%' ORDER BY timestamp DESC LIMIT 10").all(),
  });
});
system.get('/audit', superadmin, (_req, res) =>
  res.json({
    logs: db
      .prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 300')
      .all(),
  }),
);
system.get('/backup', superadmin, (req: ApiRequest, res) => {
  audit(sessionUser(req).username, 'BACKUP_EXPORTED');
  res.attachment('polad-charkhesh-backup.json').json(snapshot());
});
system.post('/restore', superadmin, (req: ApiRequest, res) => {
  const body = requestBody(req);
  if (body.confirm !== 'RESTORE') return res.status(400).json({ error: 'Invalid backup or confirmation.' });
  const result = planRestore(body.backup, { company: setting('company'), content: setting('content'), seo: setting('seo') });
  if (!result.backup) return res.status(400).json({ error: result.error });
  const b = result.backup;
  transaction(() => {
    db.prepare('INSERT INTO backup_snapshots VALUES(?,?,?)').run(
      crypto.randomUUID(),
      new Date().toISOString(),
      JSON.stringify(snapshot()),
    );
    db.exec('DELETE FROM products;DELETE FROM inquiries;DELETE FROM media;');
    b.products.forEach(putProduct);
    for (const k of ['company', 'content', 'seo'] as const) putSetting(k, b[k]);
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
    audit(sessionUser(req).username, 'BACKUP_IMPORTED');
  });
  res.json({ success: true });
});
