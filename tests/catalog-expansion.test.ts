import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { bearingProducts } from '../domain/catalog';
import { skfCatalogAdditions } from '../domain/skf-catalog-additions';

test('SKF expansion preserves an existing admin-edited catalog and runs once', async () => {
  const filename = path.join(mkdtempSync(path.join(tmpdir(), 'polad-skf-')), 'catalog.sqlite');
  const original = { ...bearingProducts[0], descriptionEn: 'Admin-edited description' };
  const prior = new DatabaseSync(filename);
  prior.exec('CREATE TABLE products(id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, slug TEXT UNIQUE NOT NULL, category TEXT NOT NULL, archived INTEGER NOT NULL DEFAULT 0, data TEXT NOT NULL)');
  prior.prepare('INSERT INTO products(id,code,slug,category,archived,data) VALUES(?,?,?,?,?,?)')
    .run(original.id, original.code, original.slug || original.id, original.category, 0, JSON.stringify(original));
  prior.close();

  process.env.DATABASE_PATH = filename;
  const database = await import('../api/database');
  try {
    assert.equal(database.product(original.id).descriptionEn, 'Admin-edited description');
    assert.equal(database.allProducts().length, 1 + skfCatalogAdditions.length);
    assert.equal(database.setting('catalog.skf-sealed-2026-09').count, skfCatalogAdditions.length);
    assert.equal(database.product(skfCatalogAdditions[0].id).code, skfCatalogAdditions[0].code);
  } finally {
    database.db.close();
  }
});
