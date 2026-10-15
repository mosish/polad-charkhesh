import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { planCatalogReviewPatch, fieldValue, type CatalogReviewPatch } from '../api/catalog-review-patch';
import type { BearingProduct } from '../domain/product';
const baseline: BearingProduct[] = JSON.parse(readFileSync('docs/catalog-review/baseline.json', 'utf8')).products;
const old = baseline.find(p => p.id === 'skf-6002-2z')!;
const makePatch = (): CatalogReviewPatch => ({ schemaVersion: 1, baselineSha256: 'a'.repeat(64), rows: [{
  id: old.id, identity: { code: old.code, slug: old.slug, brands: old.brands, category: old.category, schematicType: old.schematicType },
  guards: { d: fieldValue(old, 'd'), corKn: fieldValue(old, 'corKn') },
  changes: [{ field: 'rMin', before: fieldValue(old, 'rMin'), after: { present: true, value: 0.3 }, evidence: ['skf-dgbb-ja:PDF60'] }],
}] });
void test('review patches preserve unrelated owner edits and all stable identities', () => {
  const current = baseline.map(p => p.id === old.id ? { ...p, descriptionEn: 'Owner update', featured: true } : p);
  const plan = planCatalogReviewPatch(makePatch(), current);
  assert.deepEqual(plan.errors, []);
  assert.equal(plan.products[0].descriptionEn, 'Owner update');
  assert.equal(plan.products[0].featured, true);
  assert.equal(plan.products[0].id, old.id);
  assert.equal(plan.products[0].slug, old.slug);
  assert.equal(plan.products[0].rMin, 0.3);
  assert.equal(old.rMin, undefined);
});
void test('baseline changes, manufacturer changes and removed IDs stop the entire batch', () => {
  for (const delta of [{d:16}, {brands:['other']}, {rMin:1}, {code:'renamed'}, {id:'replacement'}]) {
    const plan = planCatalogReviewPatch(makePatch(), baseline.map(p=>p.id===old.id?{...p,...delta}:p));
    assert.ok(plan.errors.length, JSON.stringify(delta)); assert.equal(plan.products.length, 0);
  }
  const duplicate = makePatch(); duplicate.rows.push(duplicate.rows[0]);
  assert.equal(planCatalogReviewPatch(duplicate, baseline).products.length, 0);
});
void test('explicit absence differs from zero and protected/unsafe changes are rejected', () => {
  const patch = makePatch();
  patch.rows[0].changes = [{field:'speedReferenceRpm', before:fieldValue(old,'speedReferenceRpm'),after:{present:false},evidence:['source']}];
  const result = planCatalogReviewPatch(patch, baseline);
  assert.deepEqual(result.errors, []);
  assert.equal(Object.hasOwn(result.products[0], 'speedReferenceRpm'), false);
  for (const field of ['id','slug','code','brands','createdAt','unknown']) {
    patch.rows[0].changes = [{field,before:fieldValue(old,field),after:{present:true,value:'bad'},evidence:['source']}];
    assert.ok(planCatalogReviewPatch(patch,baseline).errors.length,field);
  }
  assert.ok(planCatalogReviewPatch(JSON.parse('{"__proto__":{}}'),baseline).errors.length);
  for(const field of ['clearanceOptions','descriptionEn','inStock','unknown']) {
    patch.rows[0].changes=[{field,before:fieldValue(old,field),after:{present:false},evidence:['source']}];
    assert.ok(planCatalogReviewPatch(patch,baseline).errors.length,`Required/unknown removal: ${field}`);
  }
});
