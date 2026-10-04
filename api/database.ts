import { seoDefaults, upgradeSeo, fillProductSeo } from '../domain/seo';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { bearingProducts } from '../domain/catalog';
import { skfCatalogAdditions } from '../domain/skf-catalog-additions';
import { COMPANY_INFO } from '../domain/company';
import { upgradeContent } from '../domain/site-content';
if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.DATABASE_PATH || !path.isAbsolute(process.env.DATABASE_PATH))
)
  throw new Error('DATABASE_PATH must be an absolute persistent path in production.');
const filename =
  process.env.DATABASE_PATH || path.resolve('data/platform.sqlite');
mkdirSync(path.dirname(filename), { recursive: true });
export const db = new DatabaseSync(filename);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY,code TEXT COLLATE NOCASE UNIQUE NOT NULL,slug TEXT UNIQUE NOT NULL,category TEXT NOT NULL,archived INTEGER NOT NULL DEFAULT 0,data TEXT NOT NULL CHECK(json_valid(data)));
CREATE INDEX IF NOT EXISTS product_discovery ON products(archived,category);
CREATE TABLE IF NOT EXISTS settings(kind TEXT PRIMARY KEY,data TEXT NOT NULL CHECK(json_valid(data)));
CREATE TABLE IF NOT EXISTS admins(id TEXT PRIMARY KEY,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN('superadmin','editor')));
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,admin_id TEXT REFERENCES admins(id) ON DELETE CASCADE,expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS session_admin ON sessions(admin_id);
CREATE TABLE IF NOT EXISTS inquiries(id TEXT PRIMARY KEY,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,status TEXT NOT NULL,data TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS inquiry_status ON inquiries(status,created_at);
CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit_logs(id TEXT PRIMARY KEY,timestamp TEXT NOT NULL,actor TEXT NOT NULL,action TEXT NOT NULL,entity TEXT);
CREATE TABLE IF NOT EXISTS backup_snapshots(id TEXT PRIMARY KEY,created_at TEXT NOT NULL,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,reset INTEGER NOT NULL);`);
export const parse = (r: any) => (r ? JSON.parse(r.data) : null);
export function transaction<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const r = fn();
    db.exec('COMMIT');
    return r;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
export const allProducts = (archived = false) =>
  db
    .prepare(
      `SELECT data FROM products ${archived ? '' : 'WHERE archived=0'} ORDER BY rowid`,
    )
    .all()
    .map(parse);
export const product = (id: string) =>
  parse(
    db.prepare('SELECT data FROM products WHERE id=? OR slug=?').get(id, id),
  );
export function putProduct(p: any) {
  db.prepare(
    'INSERT INTO products(id,code,slug,category,archived,data) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET code=excluded.code,slug=excluded.slug,category=excluded.category,archived=excluded.archived,data=excluded.data',
  ).run(
    p.id,
    p.code,
    p.slug,
    p.category,
    p.isArchived ? 1 : 0,
    JSON.stringify(fillProductSeo(p)),
  );
}
export const setting = (kind: string) =>
  parse(db.prepare('SELECT data FROM settings WHERE kind=?').get(kind));
export function putSetting(kind: string, data: any) {
  db.prepare(
    'INSERT INTO settings VALUES(?,?) ON CONFLICT(kind) DO UPDATE SET data=excluded.data',
  ).run(kind, JSON.stringify(data));
}
export function audit(actor: string, action: string, entity = '') {
  db.prepare('INSERT INTO audit_logs VALUES(?,?,?,?,?)').run(
    crypto.randomUUID(),
    new Date().toISOString(),
    actor,
    action,
    entity,
  );
}
if (!(db.prepare('SELECT count(*) n FROM products').get() as any).n) {
  transaction(() => bearingProducts.forEach((p) => putProduct(p)));
}
// Add the new sourced designations once on existing installations. INSERT OR
// IGNORE preserves admin-created, edited and archived records on any conflict.
if (!setting('catalog.skf-sealed-2026-09')) {
  transaction(() => {
    const insert = db.prepare(
      'INSERT OR IGNORE INTO products(id,code,slug,category,archived,data) VALUES(?,?,?,?,?,?)',
    );
    for (const p of skfCatalogAdditions)
      insert.run(p.id, p.code, p.slug || p.id, p.category, 0, JSON.stringify(p));
    putSetting('catalog.skf-sealed-2026-09', {
      appliedAt: new Date().toISOString(),
      count: skfCatalogAdditions.length,
    });
  });
}
const defaults: any = {
  company: COMPANY_INFO,
  content: {
    hero: {
      badgeEn: 'PRECISION IN EVERY REVOLUTION',
      badgeFa: 'دقت در انتخاب. اطمینان در حرکت.',
      titleEn: 'Engineered for\nwhat keeps\nindustry moving.',
      titleFa: 'مهندسی برای\nحرکتی مطمئن.',
      descriptionEn:
        'Industrial bearings. Informed selection. Technical expertise. From the right specification to reliable supply, we help you keep moving.',
      descriptionFa:
        'بیرینگ‌های صنعتی، انتخاب آگاهانه و پشتیبانی فنی؛ از شناسایی قطعه تا تأمین تخصصی.',
    },
    about: {
      titleEn: 'Small tolerances. Significant outcomes.',
      titleFa: 'تلرانس‌های کوچک. نتایج بزرگ.',
      descriptionEn:
        'Every application has its own demands. We connect industrial requirements with bearing expertise, helping you identify components by geometry, load, speed and operating conditions.',
      descriptionFa:
        'هر کاربرد صنعتی شرایط ویژه‌ای دارد. با بررسی ابعاد، بار، سرعت و محیط کار، در شناسایی و انتخاب بیرینگ مناسب همراه شما هستیم.',
    },
    why: {
      titleEn: 'Clarity before commitment.',
      titleFa: 'انتخاب آگاهانه، پیش از تأمین.',
      descriptionEn:
        'Technical identification, application review and manufacturer documentation guide every conversation.',
      descriptionFa:
        'شناسایی فنی، بررسی کاربرد و مستندات سازنده، مبنای مشاوره ماست.',
    },
    industries: {
      titleEn: 'Built for demanding environments.',
      titleFa: 'همراه صنایع در شرایط دشوار.',
    },
    engineering: {
      titleEn: 'Make the numbers work.',
      titleFa: 'انتخاب بر پایه محاسبه.',
    },
    contact: {
      titleEn: 'Let’s solve your next engineering challenge.',
      titleFa: 'برای چالش فنی بعدی، همراه شما هستیم.',
    },
    footer: {
      descriptionEn: 'Industrial bearings & technical supply',
      descriptionFa: 'تأمین تخصصی بیرینگ و قطعات صنعتی',
    },
  },
  seo: seoDefaults,
};
for (const [k, v] of Object.entries(defaults))
  if (!setting(k)) putSetting(k, v);
const upgradedContent = upgradeContent(setting('content'));
if (JSON.stringify(upgradedContent) !== JSON.stringify(setting('content')))
  putSetting('content', upgradedContent);

// SEO-only enrichment: preserve every technical field and nonblank custom override.
const upgradedSeo = upgradeSeo(setting('seo'));
if (JSON.stringify(upgradedSeo) !== JSON.stringify(setting('seo')))
  putSetting('seo', upgradedSeo);
if (!setting('seo.catalog-2026-10')) {
  transaction(() => {
    let count = 0;
    for (const p of allProducts(true)) {
      const enriched = fillProductSeo(p);
      if (JSON.stringify(enriched) !== JSON.stringify(p)) { putProduct(enriched); count++; }
    }
    putSetting('seo.catalog-2026-10', { appliedAt: new Date().toISOString(), count });
  });
}
