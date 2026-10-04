import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bearingProducts } from '../domain/catalog';
import { productGaps, catalogReview, relatedComponents } from '../lib/catalog-quality';
import { planCatalogImport } from '../api/catalog-import';

void test('catalog coverage distinguishes references, documents and language gaps', () => {
  const p = bearingProducts[0];
  assert.ok(productGaps(p).includes('image'));
  const linked={...p,technicalSources:[{...p.technicalSources![0],url:'https://example.com/catalog.pdf'}]};
  assert.ok(productGaps(linked).includes('documents'));
  assert.equal(productGaps(linked).includes('sources'),false);
  assert.equal(catalogReview(linked).exactPhotoCandidates.length,0);
  assert.ok(catalogReview({...linked,weightKg:0}).missingFields.includes('weightKg'));
  assert.ok(catalogReview(linked).reviewReasons.length>0);
  const complete = { ...p, imageUrl: '/uploads/exact-code.webp', pdfUrl: '/uploads/catalog.pdf' };
  assert.equal(productGaps(complete).includes('image'), false);
  assert.equal(productGaps(complete).includes('documents'), false);
  assert.ok(productGaps({ ...complete, descriptionFa: '' }).includes('translations'));
  assert.ok(productGaps({ ...complete, crKn: 0 }).includes('specifications'));
  const seal = bearingProducts.find(p => p.category === 'seal')!;
  assert.equal(productGaps({ ...seal, crKn: 0, corKn: 0, speedGreaseRpm: 0, speedOilRpm: 0 }).includes('specifications'), false);
});
void test('related discovery ranks geometry and excludes archived or different families', () => {
  const p = bearingProducts[0];
  const closest = { ...p, id: 'close', code: 'CLOSE', d: p.d };
  const distant = { ...p, id: 'far', code: 'FAR', d: p.d + 10 };
  const archived = { ...closest, id: 'archived', isArchived: true };
  assert.deepEqual(relatedComponents(p, [p, distant, archived, closest]).map(p => p.id), ['close', 'far']);
});
void test('import plans preserve unspecified data and reject conflicting or unsafe rows', () => {
  const p = bearingProducts[0];
  const partial = planCatalogImport([{ code: p.code, nameEn: 'Revised name' }], [p]);
  assert.deepEqual(partial.errors, []);
  assert.equal(partial.products[0].id, p.id);
  assert.equal(partial.products[0].imageUrl, p.imageUrl);
  assert.equal(partial.rows[0].action, 'update');
  const fresh = { ...p, code: 'NEW-CODE', slug: 'new-code' };
  assert.deepEqual(planCatalogImport([fresh], [p]).errors, []);
  assert.ok(planCatalogImport([fresh, fresh], [p]).errors.length);
  assert.ok(planCatalogImport([{ ...fresh, slug: p.slug }], [p]).errors.length);
  assert.ok(planCatalogImport([{ ...fresh, imageUrl: 'javascript:alert(1)' }], [p]).errors.length);
  assert.ok(planCatalogImport([{ ...fresh, featured: 'yes' }], [p]).errors.length);
  assert.ok(planCatalogImport([{ ...fresh, applicationsEn: null }], [p]).errors.length);
  assert.ok(planCatalogImport([{ ...fresh, contactAngle: { value: 15 } }], [p]).errors.length);
  assert.ok(planCatalogImport([{ ...fresh, technicalSources: [{ ...p.technicalSources![0], catalogCode: {} }] }], [p]).errors.length);
  assert.ok(planCatalogImport(JSON.parse('[{"__proto__":{}}]'), [p]).errors.length);
});
