import type { BearingProduct } from '../domain/product';
import { parse, type PublishedSettings } from './records';
import { object } from './content-validation';
export { parse } from './records';
import { seoDefaults, upgradeSeo, fillProductSeo } from '../domain/seo';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { bearingProducts } from '../domain/catalog';
import { skfCatalogAdditions } from '../domain/skf-catalog-additions';
import { COMPANY_INFO, upgradeCompanyGeography } from '../domain/company';
import { upgradeContent, textKey, correctLegacyPersianCopy } from '../domain/site-content';
import { correctCompanyCopy, correctCompanyName } from '../domain/company-identity';
if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.DATABASE_PATH || !path.isAbsolute(process.env.DATABASE_PATH))
)
  throw new Error('DATABASE_PATH must be an absolute persistent path in production.');
const filename =
  process.env.DATABASE_PATH || path.resolve('data/platform.sqlite');
if (process.env.NODE_ENV === 'production' &&
    (!existsSync(filename) || statSync(filename).size === 0) &&
    process.env.ALLOW_INITIALIZE_DATABASE !== '1') {
  throw new Error('Production database is missing or empty. Restore the verified database, or explicitly set ALLOW_INITIALIZE_DATABASE=1 for a new installation.');
}
mkdirSync(path.dirname(filename), { recursive: true });
export const db = new DatabaseSync(filename);
const newCatalog = !db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products'").get();
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY,code TEXT COLLATE NOCASE UNIQUE NOT NULL,slug TEXT UNIQUE NOT NULL,category TEXT NOT NULL,archived INTEGER NOT NULL DEFAULT 0,data TEXT NOT NULL CHECK(json_valid(data)));
CREATE INDEX IF NOT EXISTS product_discovery ON products(archived,category);
CREATE TABLE IF NOT EXISTS settings(kind TEXT PRIMARY KEY,data TEXT NOT NULL CHECK(json_valid(data)));
CREATE TABLE IF NOT EXISTS admins(id TEXT PRIMARY KEY,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN('superadmin','editor')));
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,admin_id TEXT REFERENCES admins(id) ON DELETE CASCADE,expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS session_admin ON sessions(admin_id);
CREATE INDEX IF NOT EXISTS session_expiry ON sessions(expires);
CREATE TABLE IF NOT EXISTS session_assurance(token_hash TEXT PRIMARY KEY REFERENCES sessions(token_hash) ON DELETE CASCADE,mfa_verified INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS admin_mfa(admin_id TEXT PRIMARY KEY REFERENCES admins(id) ON DELETE CASCADE,secret TEXT,pending_secret TEXT,pending_expires INTEGER NOT NULL DEFAULT 0,last_step INTEGER NOT NULL DEFAULT -1,recovery TEXT NOT NULL DEFAULT '[]');
CREATE TABLE IF NOT EXISTS login_failures(key TEXT PRIMARY KEY,count INTEGER NOT NULL,reset INTEGER NOT NULL,locked_until INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS inquiries(id TEXT PRIMARY KEY,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,status TEXT NOT NULL,data TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS inquiry_status ON inquiries(status,created_at);
CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit_logs(id TEXT PRIMARY KEY,timestamp TEXT NOT NULL,actor TEXT NOT NULL,action TEXT NOT NULL,entity TEXT);
CREATE TABLE IF NOT EXISTS backup_snapshots(id TEXT PRIMARY KEY,created_at TEXT NOT NULL,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,reset INTEGER NOT NULL);`);
db.exec(`CREATE TABLE IF NOT EXISTS website_pageviews(
  day TEXT NOT NULL,domain TEXT NOT NULL,path TEXT NOT NULL,language TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(day,domain,path,language));
CREATE TABLE IF NOT EXISTS website_statistics_metadata(id INTEGER PRIMARY KEY CHECK(id=1),started_at TEXT NOT NULL);`);
db.prepare('INSERT OR IGNORE INTO website_statistics_metadata VALUES(1,?)').run(new Date().toISOString());
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
    .map(row => parse<BearingProduct>(row));
export const product = (id: string) =>
  parse<BearingProduct>(
    db.prepare('SELECT data FROM products WHERE id=? OR slug=?').get(id, id),
  );
export function putProduct(p: BearingProduct) {
  db.prepare(
    'INSERT INTO products(id,code,slug,category,archived,data) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET code=excluded.code,slug=excluded.slug,category=excluded.category,archived=excluded.archived,data=excluded.data',
  ).run(
    p.id,
    p.code,
    p.slug ?? null,
    p.category,
    p.isArchived ? 1 : 0,
    JSON.stringify(fillProductSeo(p)),
  );
}
// Published defaults are installed during module initialization before callers run.
export function setting<K extends keyof PublishedSettings>(kind: K): PublishedSettings[K];
export function setting(kind: string): unknown;
export function setting(kind: string): unknown {
  return parse(db.prepare('SELECT data FROM settings WHERE kind=?').get(kind));
}
export function putSetting(kind: string, data: unknown) {
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
if (newCatalog) {
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
const defaults = {
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

// Once per database: do not overwrite subsequent owner changes on restart.
if (!setting('content.persian-copy-2026-10-20')) {
  transaction(() => {
    const { content, count } = correctLegacyPersianCopy(setting('content'));
    if (count) {
      putSetting('content', content);
      audit('system', 'content.persian-copy.corrected', String(count));
    }
    putSetting('content.persian-copy-2026-10-20', {
      appliedAt: new Date().toISOString(),
      count,
    });
  });
}

// Owner-requested identity correction, once per database. Keep all unrelated data.
if (!setting('company.identity-arian-tech-2026-10')) {
  transaction(() => {
    for (const kind of ['company', 'content', 'seo']) {
      const value = correctCompanyCopy(setting(kind));
      if (!object(value)) throw new Error('Missing published settings during identity migration.');
      if (kind === 'company') {
        value.nameEn = value.legalNameEn = COMPANY_INFO.nameEn;
        value.nameFa = value.legalNameFa = COMPANY_INFO.nameFa;
      }
      if (kind === 'content' && object(value.copy)) {
        value.copy = Object.fromEntries(Object.values(value.copy).map(entry => {
          if (!object(entry) || typeof entry.original !== 'string') throw new Error('Invalid stored copy entry.');
          return [textKey(entry.original), entry];
        }));
      }
      putSetting(kind, value);
    }
    // Existing generated metadata carries the old brand; technical records stay intact.
    for (const p of allProducts(true)) {
      let changed = false;
      for (const field of ['metaTitleEn', 'metaTitleFa', 'metaDescriptionEn', 'metaDescriptionFa'] as const) {
        if (typeof p[field] !== 'string') continue;
        const next = correctCompanyName(p[field]);
        if (next !== p[field]) { p[field] = next; changed = true; }
      }
      if (changed) db.prepare('UPDATE products SET data=? WHERE id=?').run(JSON.stringify(p), p.id);
    }
    putSetting('company.identity-arian-tech-2026-10', { appliedAt: new Date().toISOString() });
    audit('system', 'company.identity.corrected', COMPANY_INFO.nameEn);
  });
}

// SEO-only enrichment: preserve every technical field and nonblank custom override.
const upgradedCompany = upgradeCompanyGeography(setting('company'));
if (JSON.stringify(upgradedCompany) !== JSON.stringify(setting('company')))
  putSetting('company', upgradedCompany);
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
