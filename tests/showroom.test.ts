import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bearingProducts } from '../domain/catalog';
import { searchProducts, fitRange, dimensionOptions, emptyDimensions } from '../lib/showroom';
import { basicLife } from '../lib/engineering';
void test('showroom supports Persian digits, dimension triplets, combined filters and archived exclusions', () => {
  const p = bearingProducts[0];
  assert.ok(searchProducts(bearingProducts, '۶۲۰۴').some((x) => x.id === p.id));
  assert.ok(
    searchProducts(bearingProducts, `${p.d} × ${p.D} × ${p.B}`).some(
      (x) => x.id === p.id,
    ),
  );
  assert.ok(
    searchProducts(
      bearingProducts,
      '',
      p.category,
      String(p.d),
      String(p.D),
      String(p.B),
    ).every((x) => x.d === p.d && x.D === p.D && x.B === p.B),
  );
  assert.equal(searchProducts([{ ...p, isArchived: true }], '').length, 0);
  assert.equal(
    searchProducts([p], '', 'all', '', '', String(p.B + 1)).length,
    0,
  );
});
void test('dimension choices retain sibling sizes and respect the other filters', () => {
  const base = bearingProducts[0];
  const records = [
    { ...base, id: 'a', code: 'TEST-1', d: 20, D: 47, B: 14 },
    { ...base, id: 'b', code: 'TEST-2', d: 25, D: 47, B: 14 },
    { ...base, id: 'c', code: 'TEST-3', d: 20, D: 52, B: 14 },
    { ...base, id: 'd', code: 'TEST-4', d: 20, D: 47, B: 16 },
    { ...base, id: 'archive', code: 'TEST-5', d: 30, D: 47, B: 14, isArchived: true },
    { ...base, id: 'other', code: 'OTHER', d: 10, D: 47, B: 14 },
    { ...base, id: 'family', code: 'TEST-6', category: 'roller' as const, d: 15, D: 47, B: 14 },
  ];
  const before = JSON.stringify(records);
  assert.deepEqual(dimensionOptions(records, 'TEST', base.category, { d: '20', D: '47', B: '14' }), {
    d: [20, 25], D: [47, 52], B: [14, 16],
  });
  assert.deepEqual(searchProducts(records, 'TEST', base.category, '۲۰', '۴۷', '۱۴').map(p => p.id), ['a']);
  assert.equal(JSON.stringify(records), before, 'facets must not rewrite catalog values');
});
void test('size choices omit unknown values, deduplicate, sort numerically and recover from no matches', () => {
  const base = bearingProducts[0];
  const records = [20, 5, 20, 100, 0].map((d, i) => ({ ...base, id: String(i), d }));
  assert.deepEqual(dimensionOptions(records, '', 'all', emptyDimensions()).d, [5, 20, 100]);
  const impossible = { d: '999', D: '', B: '' };
  assert.equal(searchProducts(records, '', 'all', impossible.d).length, 0);
  const choices = dimensionOptions(records, '', 'all', impossible);
  assert.deepEqual(choices.d, [5, 20, 100], 'the selected dimension still offers alternatives');
  assert.deepEqual(choices.D, [], 'other dimensions obey the conflicting selection');
});
void test('fit ranges use worst-case mating limits and reject invalid intervals', () => {
  assert.equal(fitRange(20, 20.01, 19.98, 19.99).kind, 'clearance');
  assert.equal(fitRange(20, 20.01, 20.02, 20.03).kind, 'interference');
  const r = fitRange(20, 20.01, 20.005, 20.015);
  assert.equal(r.kind, 'transition');
  assert.ok(Math.abs(r.min + 15) < 1e-8);
  assert.ok(Math.abs(r.max - 5) < 1e-8);
  assert.throws(() => fitRange(21, 20, 20, 21));
  assert.throws(() => fitRange(NaN, 20, 20, 21));
});
void test('known-load life rejects overflow instead of displaying infinity', () =>
  assert.throws(() => basicLife(1e300, 1e-300, 1, false)));
