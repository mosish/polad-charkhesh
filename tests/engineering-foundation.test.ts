import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bearingProducts } from '../domain/catalog';
import { basicLife, calculate } from '../lib/engineering';
import { fitRange } from '../lib/showroom';
import { fixtureProfile } from './fixtures/calculation-profile';

function close(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) <= Math.max(1e-9, Math.abs(expected) * 1e-12), `${actual} != ${expected}`);
}

// Expected values are derived algebraically in methods/REGISTER.md, not by the implementation.
void test('independent ball and roller life benchmarks', () => {
  for (const [C, P, rpm, roller, revolutions, hours] of [
    [10, 1, 1000, false, 1000, 16666.666666666668],
    [8, 2, 2000, false, 64, 533.3333333333334],
    [3, 3, 60, false, 1, 277.77777777777777],
    [8, 1, 1000, true, 1024, 17066.666666666668],
    [27, 1, 900, true, 59049, 1093500],
    [5, 5, 120, true, 1, 138.88888888888889],
  ] as const) {
    const result = basicLife(C, P, rpm, roller);
    close(result.L10, revolutions);
    close(result.hours, hours);
  }
});

void test('life methods reject numeric underflow and overflow', () => {
  assert.throws(() => basicLife(1e-200, 1e200, 1000, false), /numerical range/);
  assert.throws(() => basicLife(1, 1, Number.MAX_VALUE, false), /numerical range/);
  assert.throws(() => basicLife(1e200, 1e-200, 1000, true), /numerical range/);
  const ball = bearingProducts[0];
  const underflow = { ...ball, crKn: 1e-200 };
  assert.throws(() => calculate(underflow, 1e200, 0, 1000, 90, false, fixtureProfile(underflow)), /numerical range/);
});

void test('product calculation rejects nonfinite ratings and invalid required factors', () => {
  const ball = bearingProducts[0];
  for (const invalid of [undefined, NaN, Infinity, -Infinity, 0, -1]) {
    for (const key of ['crKn', 'corKn', 'calculationFactorF0'] as const) {
      const product = { ...ball, [key]: invalid };
      assert.throws(() => calculate(product, 2, 1, 1500, 90, false, fixtureProfile(product)), /ratings|factor/);
    }
  }
  const spherical = bearingProducts.find((product) => product.schematicType === 'spherical')!;
  for (const key of ['calculationFactorE', 'calculationFactorY1', 'calculationFactorY2', 'calculationFactorY0'] as const) {
    for (const invalid of [undefined, NaN, Infinity, -Infinity, -1, 0]) {
      const product = { ...spherical, [key]: invalid };
      assert.throws(() => calculate(product, 2, 1, 1500, 90, false, fixtureProfile(product, 'spherical')), /factors/);
    }
  }
});

void test('fit benchmarks cover clearance, interference, transition and numeric range', () => {
  for (const [limits, expected] of [
    [[20, 20.01, 19.98, 19.99], [10, 30, 'clearance']],
    [[20, 20.01, 20.02, 20.03], [-30, -10, 'interference']],
    [[20, 20.01, 20.005, 20.015], [-15, 5, 'transition']],
    [[20, 21, 19, 20], [0, 2000, 'clearance']],
    [[20, 21, 21, 22], [-2000, 0, 'interference']],
    [[20, 20, 20, 20], [0, 0, 'clearance']],
  ] as const) {
    const result = fitRange(limits[0], limits[1], limits[2], limits[3]);
    close(result.min, expected[0]);
    close(result.max, expected[1]);
    assert.equal(result.kind, expected[2]);
  }
  assert.throws(() => fitRange(Number.MAX_VALUE, Number.MAX_VALUE, 1, 2), /numerical range/);
});
