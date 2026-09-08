import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bearingProducts } from '../domain/catalog';
import { searchProducts, fitRange } from '../lib/showroom';
import { basicLife } from '../lib/engineering';
test('showroom supports Persian digits, dimension triplets, combined filters and archived exclusions', () => {
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
test('fit ranges use worst-case mating limits and reject invalid intervals', () => {
  assert.equal(fitRange(20, 20.01, 19.98, 19.99).kind, 'clearance');
  assert.equal(fitRange(20, 20.01, 20.02, 20.03).kind, 'interference');
  const r = fitRange(20, 20.01, 20.005, 20.015);
  assert.equal(r.kind, 'transition');
  assert.ok(Math.abs(r.min + 15) < 1e-8);
  assert.ok(Math.abs(r.max - 5) < 1e-8);
  assert.throws(() => fitRange(21, 20, 20, 21));
  assert.throws(() => fitRange(NaN, 20, 20, 21));
});
test('known-load life rejects overflow instead of displaying infinity', () =>
  assert.throws(() => basicLife(1e300, 1e-300, 1, false)));
