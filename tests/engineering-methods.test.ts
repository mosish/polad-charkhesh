import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bearingProducts } from '../domain/catalog';
import type { CalculationFamily, ReviewedCalculationProfile } from '../domain/engineering';
import type { BearingProduct } from '../domain/product';
import { calculate } from '../lib/engineering';
import { calculationEligibility } from '../lib/engineering-eligibility';
import { fixtureProfile } from './fixtures/calculation-profile';

// Synthetic inputs only. Independent derivations and source scope: methods/C0C_EVIDENCE.md.
const specimen: BearingProduct = {
  ...bearingProducts[0], id: 'synthetic-method-benchmark', code: 'TEST-ONLY',
  crKn: 100, corKn: 1, calculationFactorF0: 1,
  calculationFactorE: 0.25, calculationFactorY: 2.4,
  calculationFactorY0: 2, calculationFactorY1: 2, calculationFactorY2: 3.32,
};
function close(actual: number, expected: number, absoluteTolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= Math.max(absoluteTolerance, Math.abs(expected) * 1e-12), `${actual} != ${expected}`);
}
function run(family: CalculationFamily, Fr: number, Fa: number, changes: Partial<BearingProduct> = {}) {
  const product = { ...specimen, ...changes };
  return calculate(product, Fr, Fa, 1000, 90, true, fixtureProfile(product, family));
}

void test('DGBB table knots and all interval midpoints have independently tabulated loads', () => {
  // Fr=0, Fa=1, C0=1 gives P=Y; e is exercised separately at each knot below.
  for (const [value, e, expected] of [
    [0.172, 0.19, 2.3], [0.345, 0.22, 1.99], [0.689, 0.26, 1.71],
    [1.03, 0.28, 1.55], [1.38, 0.30, 1.45], [2.07, 0.34, 1.31],
    [3.45, 0.38, 1.15], [5.17, 0.42, 1.04], [6.89, 0.44, 1],
    [0.2585, 0.205, 2.145], [0.517, 0.24, 1.85], [0.8595, 0.27, 1.63],
    [1.205, 0.29, 1.5], [1.725, 0.32, 1.38], [2.76, 0.36, 1.23],
    [4.31, 0.4, 1.095], [6.03, 0.43, 1.02],
  ]) {
    close(run('deep-groove', 0, 1, { calculationFactorF0: value }).P, expected);
    const below = 1 / (e - 1e-8), above = 1 / (e + 1e-8);
    close(run('deep-groove', below, 1, { calculationFactorF0: value }).P, below);
    close(run('deep-groove', above, 1, { calculationFactorF0: value }).P, 0.56 * above + expected);
  }
});

void test('DGBB rejects both ends outside its sourced table instead of clamping', () => {
  for (const value of [0.171999999, 0.0001, Number.MIN_VALUE, 6.890000001, Infinity]) {
    assert.throws(() => run('deep-groove', 1, 1, { calculationFactorF0: value }), /table|factor/);
  }
  assert.throws(() => run('deep-groove', 1, 1e-200, { calculationFactorF0: 1e-200 }), /table/);
  // Radial-only branch requires no f0 table lookup.
  assert.equal(run('deep-groove', 10, 0, { calculationFactorF0: undefined }).P, 10);
});

void test('DGBB dynamic equality and static max branches use independent loads', () => {
  const changes = { corKn: 3, calculationFactorF0: 1.38 };
  assert.equal(run('deep-groove', 10, 3, changes).P, 10);
  close(run('deep-groove', 10, 4, { calculationFactorF0: 0.345 }).P, 11.4);
  for (const [Fr, Fa, P0] of [[10, 4, 10], [10, 8, 10], [10, 10, 11], [0, 2, 1]]) {
    close(run('deep-groove', Fr, Fa, { calculationFactorF0: 0.172 / Fa }).P0, P0);
  }
});

void test('published NSK example agrees within its stated rounded-factor precision', () => {
  // E1103d A055 example 3 reports P=3.070 kN using rounded Y=1.67.
  const result = run('deep-groove', 2.5, 1, { crKn: 32, corKn: 17.9, calculationFactorF0: 14 });
  close(result.P, 3.070, 0.005);
  close(result.P0, 2.5);
});

void test('spherical branches include exact e, either side, pure axial and static ratio', () => {
  for (const [Fr, Fa, P, P0] of [[10, 2, 14, 14], [10, 2.5, 15, 15], [10, 3, 16.66, 16], [0, 3, 9.96, 6]]) {
    const result = run('spherical', Fr, Fa, { corKn: 48 });
    close(result.P, P); close(result.P0, P0); close(result.safety, 48 / P0);
    assert.equal(result.exponent, 10 / 3);
  }
});

void test('single-row tapered branches require solved arrangement loads and static floor', () => {
  for (const [Fr, Fa, P, P0] of [[10, 2, 10, 10], [10, 2.5, 10, 10], [10, 3, 11.2, 11], [0, 3, 7.2, 6]]) {
    const result = run('tapered', Fr, Fa);
    close(result.P, P); close(result.P0, P0);
  }
  assert.throws(() => calculate(specimen, 10, 3, 1000, 90, false, fixtureProfile(specimen, 'tapered')), /arrangement/);
});

void test('radial roller families and thrust balls preserve their load axis and exponent', () => {
  for (const family of ['cylindrical', 'needle', 'carb'] as const) {
    const result = run(family, 4, 0);
    assert.equal(result.P, 4); assert.equal(result.P0, 4); assert.equal(result.exponent, 10 / 3);
    assert.throws(() => run(family, 4, 0.001), /Radial-only/);
  }
  const thrust = run('thrust-ball', 0, 4);
  assert.equal(thrust.P, 4); assert.equal(thrust.P0, 4); assert.equal(thrust.exponent, 3);
  assert.throws(() => run('thrust-ball', 0.001, 4), /pure axial/);
});

void test('spherical thrust requires an explicit reviewed series and runout model', () => {
  const base = fixtureProfile(specimen, 'spherical-thrust');
  for (const sphericalThrust of [undefined, { series: '291', runout: 'affects-load' }, { series: '294', runout: 'unknown' }]) {
    const profile = { ...base, sphericalThrust } as ReviewedCalculationProfile;
    assert.deepEqual(calculationEligibility(specimen, profile), { eligible: false, reason: 'invalid-review' });
  }
  const oldVersion = { ...base, methodVersion: 'catalog-life/1' } as unknown as ReviewedCalculationProfile;
  assert.equal(calculationEligibility(specimen, oldVersion).eligible, false);
});

void test('spherical thrust benchmarks cover all SKF series and both runout branches', () => {
  for (const [series, P, P0, reducedP] of [['292', 12.2, 15, 10.736], ['293', 12.4, 15.4, 10.912], ['294', 12.6, 15.8, 11.088]] as const) {
    for (const runout of ['affects-load', 'does-not-affect-load'] as const) {
      const profile = { ...fixtureProfile(specimen, 'spherical-thrust'), sphericalThrust: { series, runout } };
      const result = calculate(specimen, 2, 10, 1000, 90, false, profile);
      close(result.P, runout === 'affects-load' ? P : reducedP); close(result.P0, P0);
      assert.equal(result.exponent, 10 / 3);
    }
  }
  const boundary = run('spherical-thrust', 5.5, 10);
  close(boundary.P, 17.15); close(boundary.P0, 25.95);
  assert.throws(() => run('spherical-thrust', 5.50000001, 10), /0.55/);
  assert.throws(() => run('spherical-thrust', 1, 0), /Fa/);
  close(run('spherical-thrust', 0, 10).P, 10);
});

void test('reliability uses the four supported ISO-family factors, not ABLE or full modified life', () => {
  const product = { ...specimen, crKn: 10, corKn: 4 };
  for (const [reliability, factor, hours] of [[90, 1, 10000], [95, 0.64, 6400], [98, 0.37, 3700], [99, 0.25, 2500]]) {
    const result = calculate(product, 1, 0, 100000 / 60, reliability, false, fixtureProfile(product));
    close(result.hours, 10000); close(result.adjustedHours, hours);
    assert.equal(result.a1, factor); assert.equal(result.safety, 4);
  }
  for (const reliability of [0, 91, 96, 99.9, 100, NaN, Infinity]) {
    assert.throws(() => calculate(product, 1, 0, 1000, reliability, false, fixtureProfile(product)), /reliability/);
  }
});

void test('required tapered factors and load/speed inputs reject missing and nonfinite values', () => {
  for (const key of ['calculationFactorE', 'calculationFactorY', 'calculationFactorY0'] as const) {
    for (const value of [undefined, 0, -1, NaN, Infinity, -Infinity]) {
      assert.throws(() => run('tapered', 10, 3, { [key]: value }), /factors/);
    }
  }
  for (const [Fr, Fa, rpm] of [[0, 0, 1000], [-1, 0, 1000], [1, -1, 1000], [NaN, 0, 1000], [1, Infinity, 1000], [1, 0, 0], [1, 0, -1], [1, 0, Infinity]]) {
    assert.throws(() => calculate(specimen, Fr, Fa, rpm, 90, true, fixtureProfile(specimen)), /loads|speed/);
  }
});

void test('combined loads and static safety never return overflowing or underflowing results', () => {
  assert.throws(() => run('spherical', 1, 1, { calculationFactorY2: Number.MAX_VALUE, calculationFactorY0: Number.MAX_VALUE }), /numerical range/);
  assert.throws(() => run('spherical-thrust', Number.MAX_VALUE / 2, Number.MAX_VALUE), /numerical range/);
  assert.throws(() => run('deep-groove', 1, 0, { corKn: Number.MIN_VALUE, crKn: Number.MAX_VALUE }), /numerical range/);
});
