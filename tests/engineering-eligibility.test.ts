import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bearingProducts } from '../domain/catalog';
import { calculationFamilyFlags, reviewedCalculationProfiles } from '../domain/engineering';
import { calculationEligibility, calculationRevision, selectedCalculationProduct } from '../lib/engineering-eligibility';
import { calculate, assessCatalogSpeed, basicLife } from '../lib/engineering';
import { fixtureProfile } from './fixtures/calculation-profile';

void test('unreviewed catalog cannot produce product results, including all eleven flagged mappings', () => {
  assert.equal(reviewedCalculationProfiles.length, 0, 'No engineer has approved a production profile yet');
  for (const product of bearingProducts) {
    assert.equal(calculationEligibility(product).eligible, false);
    assert.throws(() => calculate(product, 2, 0, 1500));
  }
  assert.equal(Object.keys(calculationFamilyFlags).length, 11);
  for (const id of Object.keys(calculationFamilyFlags)) {
    const product = bearingProducts.find((p) => p.id === id);
    assert.ok(product, id);
    assert.deepEqual(calculationEligibility(product), { eligible: false, reason: 'family-review' });
  }
});

void test('reviewed method is independent of schematic geometry; unsupported methods remain blocked', () => {
  const product = { ...bearingProducts[0], schematicType: 'thrust' as const };
  const result = calculate(product, 2, 0, 1500, 90, false, fixtureProfile(product, 'deep-groove'));
  assert.equal(result.exponent, 3);
  assert.equal(result.P, 2);
  const radialRoller = calculate(product, 2, 0, 1500, 90, false, fixtureProfile(product, 'needle'));
  assert.equal(radialRoller.exponent, 10 / 3);
  for (const family of ['angular-contact', 'self-aligning-ball', 'cam-follower'] as const) {
    assert.deepEqual(calculationEligibility(product, fixtureProfile(product, family)), { eligible: false, reason: 'unsupported-family' });
  }
});

void test('technical edits invalidate review; image, text and geometry edits cannot select a method', () => {
  const product = bearingProducts[0];
  const profile = fixtureProfile(product);
  for (const changed of [
    { ...product, crKn: product.crKn + 1 }, { ...product, code: 'OTHER' },
    { ...product, brands: ['OTHER'] }, { ...product, calculationFactorF0: 20 },
    { ...product, clearanceOptions: ['C9'] }, { ...product, speedLimitingRpm: 1 },
  ]) assert.deepEqual(calculationEligibility(changed, profile), { eligible: false, reason: 'stale-review' });
  assert.equal(calculationRevision({ ...product, imageUrl: '/new.png', schematicType: 'oil-seal', nameEn: 'Edited title' }), calculationRevision(product));
  assert.equal(calculationEligibility({ ...product, isArchived: true }, profile).eligible, false);
  assert.equal(calculationEligibility(product, { ...profile, reviewedBy: '' }).eligible, false);
  assert.equal(calculationEligibility(product, { ...profile, evidence: [] }).eligible, false);
  assert.equal(calculationEligibility(product, { ...profile, loadCases: [] }).eligible, false);
  assert.throws(() => calculate(product, 2, 1, 1500, 90, false, { ...profile, loadCases: ['radial'] }), /load case/);
});

void test('unknown or archived selection never silently substitutes another product; manual life remains independent', () => {
  assert.equal(selectedCalculationProduct(bearingProducts, 'missing'), undefined);
  assert.equal(selectedCalculationProduct(bearingProducts, ''), undefined);
  const product = bearingProducts[0];
  assert.equal(selectedCalculationProduct([{ ...product, isArchived: true }], product.id), undefined);
  assert.equal(selectedCalculationProduct(bearingProducts, product.id), product);
  assert.equal(selectedCalculationProduct(bearingProducts, product.slug!), product);
  assert.equal(calculationEligibility(undefined).eligible, false);
  assert.equal(basicLife(10, 1, 1000, false).L10, 1000);
});

void test('speed distinguishes unknown limits from an actual comparison and never treats reference speed as a limit', () => {
  const product = { ...bearingProducts[0], speedLimitingRpm: undefined, speedGreaseRpm: 0, speedOilRpm: 0, speedReferenceRpm: 500 };
  assert.deepEqual(assessCatalogSpeed(product, 1000), { status: 'unknown' });
  assert.deepEqual(assessCatalogSpeed({ ...product, speedLimitingRpm: Infinity }, 1000), { status: 'unknown' });
  assert.equal(assessCatalogSpeed({ ...product, speedLimitingRpm: 1000 }, 1000).status, 'within');
  assert.equal(assessCatalogSpeed({ ...product, speedLimitingRpm: 1000 }, 1001).status, 'exceeded');
  const both = assessCatalogSpeed({ ...product, speedGreaseRpm: 1500, speedOilRpm: 2000 }, 1600);
  assert.equal(both.status, 'exceeded');
  assert.equal(both.limit, 1500);
  assert.equal(both.basis, 'conservative-lubricant');
});
