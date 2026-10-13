import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { correctCompanyCopy, correctCompanyName } from '../domain/company-identity';
import { bearingProducts } from '../domain/catalog';
import { seoDefaults } from '../domain/seo';
import { textKey } from '../domain/site-content';

void test('company name correction is repeatable and leaves asset URLs and identifiers intact', () => {
  const name = correctCompanyName('Polad Charkhesh / POLAD CHARKHESH / PoladCharkhesh / پولاد چرخِش');
  assert.equal(correctCompanyName(name), name);
  assert.match(name, /پولاد چرخش آرین تک/);
  const copy = { title: 'Welcome to Polad Charkhesh', logoUrl: '/uploads/PoladCharkhesh.png', id: 'PoladCharkhesh', link: 'https://example.com/PoladCharkhesh', email: 'PoladCharkhesh@example.com' };
  assert.deepEqual(correctCompanyCopy(copy), { ...copy, title: 'Welcome to Polad Charkhesh Arian Tech' });
});

void test('identity migration updates saved names and SEO while preserving technical and owner data', async () => {
  const filename = path.join(mkdtempSync(path.join(tmpdir(), 'polad-identity-')), 'site.sqlite');
  const original = { ...bearingProducts[0], descriptionEn: 'Owner technical note', metaTitleEn: '6204 | Polad Charkhesh' };
  const prior = new DatabaseSync(filename);
  prior.exec('CREATE TABLE settings(kind TEXT PRIMARY KEY,data TEXT NOT NULL); CREATE TABLE products(id TEXT PRIMARY KEY,code TEXT UNIQUE NOT NULL,slug TEXT UNIQUE NOT NULL,category TEXT NOT NULL,archived INTEGER NOT NULL DEFAULT 0,data TEXT NOT NULL)');
  prior.prepare('INSERT INTO products VALUES(?,?,?,?,?,?)').run(original.id, original.code, original.slug || original.id, original.category, 0, JSON.stringify(original));
  const company = { nameEn: 'PoladCharkhesh', nameFa: 'پولاد چرخِش', primaryPhone: 'owner-number', email: 'owner@example.com' };
  const override = { original: 'POLAD CHARKHESH', en: 'POLAD CHARKHESH — owner subtitle', fa: 'پولاد چرخش — متن مالک', group: 'Shell' };
  for (const [kind, value] of Object.entries({ company, content: { hero: { titleEn: 'Owner headline' }, copy: { [textKey(override.original)]: override } }, seo: seoDefaults, 'catalog.skf-sealed-2026-09': true, 'seo.catalog-2026-10': true })) prior.prepare('INSERT INTO settings VALUES(?,?)').run(kind, JSON.stringify(value));
  prior.close();
  process.env.DATABASE_PATH = filename;
  const database = await import('../api/database');
  try {
    assert.equal(database.setting('company').nameEn, 'Polad Charkhesh Arian Tech');
    assert.equal(database.setting('company').nameFa, 'پولاد چرخش آرین تک');
    assert.equal(database.setting('company').primaryPhone, company.primaryPhone);
    assert.equal(database.setting('company').email, company.email);
    assert.equal(database.setting('content').hero.titleEn, 'Owner headline');
    assert.equal(database.setting('content').copy[textKey('POLAD CHARKHESH ARIAN TECH')].en, 'POLAD CHARKHESH ARIAN TECH — owner subtitle');
    assert.deepEqual(database.product(original.id), { ...original, metaTitleEn: '6204 | Polad Charkhesh Arian Tech' });
    assert.ok(database.setting('company.identity-arian-tech-2026-10'));
  } finally { database.db.close(); }
});
