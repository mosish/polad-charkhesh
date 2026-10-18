import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bearingProducts } from '../domain/catalog';
import { COMPANY_INFO } from '../domain/company';
import { seoDefaults } from '../domain/seo';
import { planRestore } from '../api/backup-plan';
import { readProductRecord } from '../api/product-record';
import { planCatalogImport } from '../api/catalog-import';
import { planCatalogReviewPatch } from '../api/catalog-review-patch';
import { parse } from '../api/records';

const settings = {
  company: COMPANY_INFO,
  content: {
    hero: {},
    about: {},
    why: {},
    industries: {},
    engineering: {},
    contact: {},
    footer: {},
  },
  seo: seoDefaults,
};
const backup = () => ({
  version: 1,
  products: [structuredClone(bearingProducts[0])],
  ...structuredClone(settings),
  inquiries: [],
  media: [],
});

void test('product persistence contract accepts catalog fixtures and rejects malformed optional fields', () => {
  for (const product of bearingProducts)
    assert.deepEqual(readProductRecord(product).errors, [], product.id);
  for (const delta of [
    { id: 10 },
    { id: '' },
    { inStock: 'yes' },
    { featured: 1 },
    { descriptionEn: {} },
    { applicationsEn: [null] },
    { speedReferenceType: {} },
    { createdAt: [] },
    {
      technicalSources: [
        {
          manufacturer: 'SKF',
          reference: 'catalog',
          sourceType: 'official_catalog',
          verifiedAt: '2026-10-18',
          url: false,
        },
      ],
    },
    {
      technicalSources: [
        {
          manufacturer: 'SKF',
          reference: 'catalog',
          sourceType: 'official_catalog',
        },
      ],
    },
  ]) {
    const result = readProductRecord({ ...bearingProducts[0], ...delta });
    assert.equal(result.product, null, JSON.stringify(delta));
    assert.ok(result.errors.length);
  }
});

void test('invalid import batches expose no persistable products and leave existing records unchanged', () => {
  const existing = structuredClone(bearingProducts.slice(0, 2));
  const before = structuredClone(existing);
  const result = planCatalogImport(
    [
      { code: existing[0].code, nameEn: 'Valid row' },
      { code: existing[1].code, inStock: 'invalid' },
    ],
    existing,
  );
  assert.ok(result.errors.length);
  assert.deepEqual(result.products, []);
  assert.deepEqual(existing, before);
});

void test('review parser rejects malformed nested records without coercing their shapes', () => {
  const product = bearingProducts[0];
  const row = {
    id: product.id,
    identity: product,
    guards: {},
    changes: [
      {
        field: 'descriptionEn',
        before: { present: true, value: product.descriptionEn },
        after: { present: true, value: 'Reviewed description' },
        evidence: ['source'],
      },
    ],
  };
  for (const invalid of [
    null,
    [],
    1,
    { ...row, identity: [] },
    { ...row, guards: [] },
    { ...row, changes: [null] },
    { ...row, changes: [{ ...row.changes[0], evidence: [1] }] },
  ]) {
    const result = planCatalogReviewPatch(
      { schemaVersion: 1, baselineSha256: 'a'.repeat(64), rows: [invalid] },
      [product],
    );
    assert.ok(result.errors.length);
    assert.deepEqual(result.products, []);
  }
  assert.ok(
    planCatalogReviewPatch(
      { schemaVersion: 1, baselineSha256: ['a'.repeat(64)], rows: [row] },
      [product],
    ).errors.length,
  );
});

void test('restore upgrades legacy settings without mutating the supplied backup', () => {
  const input = backup();
  const legacySeo = { ...input.seo } as Partial<typeof input.seo>;
  delete legacySeo.pages;
  const legacy = { ...input, seo: legacySeo };
  const before = structuredClone(legacy);
  const result = planRestore(legacy, settings);
  assert.ok(result.backup, result.error);
  assert.deepEqual(result.backup.seo, seoDefaults);
  assert.deepEqual(legacy, before);
  assert.deepEqual(result.backup.products, input.products);
});

void test('restore rejects malformed or duplicate collection rows before producing a write plan', () => {
  const inquiry = {
    id: 'inquiry',
    created_at: '2026-10-18',
    updated_at: '2026-10-18',
    status: 'new',
    data: '{"message":"test"}',
  };
  const media = {
    id: 'media',
    data: '{"mime":"image/png","url":"/uploads/test.png"}',
  };
  assert.ok(
    planRestore({ ...backup(), inquiries: [inquiry], media: [media] }, settings)
      .backup,
  );
  for (const delta of [
    { inquiries: [null] },
    { inquiries: [{ ...inquiry, created_at: null }] },
    { inquiries: [{ ...inquiry, data: 'null' }] },
    { inquiries: [inquiry, inquiry] },
    { media: [null] },
    { media: [media, media] },
    { media: [{ ...media, data: '{}' }] },
    {
      media: [
        { ...media, data: '{"mime":"image/png","url":"/uploads/../secret"}' },
      ],
    },
    {
      media: [
        {
          ...media,
          data: '{"mime":"image/png","url":"/uploads/test.png","__proto__":{}}',
        },
      ],
    },
    { products: [{ ...bearingProducts[0], id: null }] },
  ]) {
    const result = planRestore({ ...backup(), ...delta }, settings);
    assert.ok(result.error, JSON.stringify(delta));
    assert.equal(result.backup, undefined);
  }
});

void test('stored JSON decoder distinguishes missing rows, invalid columns and invalid JSON', () => {
  assert.equal(parse(undefined), null);
  assert.deepEqual(parse({ data: '{"value":0}' }), { value: 0 });
  assert.throws(() => parse({ data: 42 }), /JSON text column/);
  assert.throws(() => parse({ data: '{' }), SyntaxError);
});
