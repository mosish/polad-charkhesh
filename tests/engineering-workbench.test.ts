import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  dutyLife,
  lubricationReview,
  scenarioLife,
  shaftPower,
  targetCapacity,
  workbenchMethodVersion,
} from '../lib/engineering-workbench';
import {
  caseStaleness,
  initialWorkbookDraft,
  parseCaseFile,
  validEngineeringCase,
  type EngineeringCase,
} from '../lib/engineering-cases';
import {
  calculationRevision,
  calculationEligibility,
} from '../lib/engineering-eligibility';
import { bearingProducts } from '../domain/catalog';
import { fitRange } from '../lib/showroom';
import { workbookTools } from '../domain/engineering-workbench';

function close(actual: number, expected: number, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <=
      Math.max(tolerance, Math.abs(expected) * 1e-12),
    `${actual} != ${expected}`,
  );
}
void test('inverse capacity matches independently derived million-revolution powers for both families', () => {
  close(targetCapacity(10, 1000, 1e6 / 60000, 'ball').capacity, 10);
  close(targetCapacity(10, 1000, 8e6 / 60000, 'ball').capacity, 20);
  close(targetCapacity(10, 1000, 1024e6 / 60000, 'roller').capacity, 80);
  close(targetCapacity(10, 1000, 1000, 'ball').capacity, 39.14867641168864);
});
void test('target capacity respects monotonic load, speed and life; inverse round trip', () => {
  const base = targetCapacity(5, 1000, 2000, 'ball').capacity;
  assert.ok(targetCapacity(5, 2000, 2000, 'ball').capacity > base);
  assert.ok(targetCapacity(5, 1000, 4000, 'ball').capacity > base);
  close(targetCapacity(10, 1000, 2000, 'ball').capacity, base * 2);
  close(scenarioLife(base, 5, 1000, 'ball').hours, 2000);
});
void test('time-weighted duty matches independent constant, two-load and variable-speed cases', () => {
  const constant = dutyLife(
    10,
    [
      { load: 1, rpm: 1000, share: 25 },
      { load: 1, rpm: 1000, share: 75 },
    ],
    'ball',
  );
  close(constant.hours, 16666.666666666668);
  close(constant.equivalentLoad, 1);
  const loads = dutyLife(
    10,
    [
      { load: 1, rpm: 1000, share: 50 },
      { load: 2, rpm: 1000, share: 50 },
    ],
    'ball',
  );
  close(loads.hours, 3703.703703703704);
  close(loads.equivalentLoad, 1.6509636244473134);
  close(loads.damageShares[1], 8 / 9);
  const speeds = dutyLife(
    10,
    [
      { load: 1, rpm: 1000, share: 50 },
      { load: 1, rpm: 2000, share: 50 },
    ],
    'ball',
  );
  close(speeds.hours, 11111.111111111111);
  close(speeds.meanRpm, 1500);
  close(speeds.equivalentLoad, 1);
  const roller = dutyLife(80, [{ load: 10, rpm: 1000, share: 100 }], 'roller');
  close(roller.hours, 1024e6 / 60000);
});
void test('duty weights by revolutions and does not use arithmetic average load', () => {
  const result = dutyLife(
    10,
    [
      { load: 1, rpm: 1000, share: 50 },
      { load: 2, rpm: 2000, share: 50 },
    ],
    'ball',
  );
  close(result.hours, 1960.7843137254902);
  close(result.damageShares[1], 16 / 17);
  assert.ok(result.equivalentLoad > 1.5);
});
void test('numerical worksheets reject unsupported family, blank, zero, negative, nonfinite and overflow', () => {
  for (const value of [NaN, Infinity, -1, 0]) {
    assert.throws(() => targetCapacity(value, 1000, 1000, 'ball'));
    assert.throws(() => targetCapacity(1, value, 1000, 'ball'));
    assert.throws(() => shaftPower('torque', 1, value));
  }
  assert.throws(() => targetCapacity(1, 1, 1, 'unknown' as 'ball'));
  assert.throws(() => scenarioLife(1, 1, 1, 'unknown' as 'ball'));
  assert.throws(() => targetCapacity(1e308, 1e308, 1e308, 'ball'));
  assert.throws(() => dutyLife(10, [], 'ball'));
  assert.throws(
    () => dutyLife(10, [{ load: 1, rpm: 1000, share: 99 }], 'ball'),
    /shares/,
  );
  assert.throws(() => dutyLife(10, [{ load: 1, rpm: 0, share: 100 }], 'ball'));
  assert.throws(() =>
    dutyLife(
      10,
      Array.from({ length: 9 }, () => ({ load: 1, rpm: 1000, share: 100 / 9 })),
      'ball',
    ),
  );
});
void test('shaft relation uses exact SI angular speed in all three directions', () => {
  close(shaftPower('power', 10, 60), 0.06283185307179587);
  close(shaftPower('torque', 1, 60), 159.15494309189535);
  close(shaftPower('rpm', 2 * Math.PI, 1000), 60);
  const torque = shaftPower('torque', 7.5, 1500);
  close(shaftPower('power', torque, 1500), 7.5);
  close(shaftPower('rpm', 7.5, torque), 1500);
  assert.throws(() => shaftPower('watts' as 'power', 1, 2));
});
void test('fit intervals preserve tiny nonzero clearance and the three classifications', () => {
  assert.equal(fitRange(20.01, 20.02, 20, 20.005).kind, 'clearance');
  assert.equal(fitRange(20, 20.005, 20.01, 20.02).kind, 'interference');
  assert.equal(fitRange(20, 20.01, 20.005, 20.015).kind, 'transition');
  assert.ok(fitRange(20.00000001, 20.00000002, 20, 20).min > 0);
  assert.throws(() => fitRange(21, 20, 20, 20));
});
function specimen(): EngineeringCase {
  return {
    id: 'test',
    name: 'Manual case',
    schema: 1,
    method: workbenchMethodVersion,
    tool: 'target',
    savedAt: '2026-11-17T10:00:00.000Z',
    draft: initialWorkbookDraft(),
  };
}
const file = (item: unknown) => JSON.stringify({ schema: 1, cases: [item] });
void test('notebook round trips every tool, Persian drafts and escaped text without trusting results', () => {
  for (const tool of workbookTools) {
    const item = specimen();
    item.tool = tool.id;
    item.draft.values.p = '۱۲٫۵';
    item.draft.notes = '<script>not executable</script>';
    assert.deepEqual(parseCaseFile(file(item)), [item]);
  }
  assert.equal(
    validEngineeringCase({ ...specimen(), result: { hours: 100 } }),
    false,
  );
});
void test('notebook rejects malformed imports, hostile keys, oversized payloads and ambiguous schemas', () => {
  for (const raw of [
    'null',
    '{}',
    '[]',
    '{bad',
    file({ ...specimen(), schema: 2 }),
    file({ ...specimen(), tool: 'eval' }),
    file({
      ...specimen(),
      draft: { values: { __proto__: 'x' }, rows: [], notes: '' },
    }),
    file({
      ...specimen(),
      draft: { ...initialWorkbookDraft(), values: { kind: 'invalid' } },
    }),
    file({ ...specimen(), name: 'x'.repeat(81) }),
    file({
      ...specimen(),
      draft: { ...initialWorkbookDraft(), notes: 'x'.repeat(1001) },
    }),
    JSON.stringify({ schema: 1, cases: [specimen(), specimen()] }),
    JSON.stringify({ schema: 1, cases: [specimen()], extra: true }),
    ' '.repeat(250001),
  ])
    assert.throws(() => parseCaseFile(raw));
  assert.throws(() =>
    parseCaseFile(
      file({
        ...specimen(),
        draft: JSON.parse(
          '{"values":{"__proto__":"x"},"rows":[{"label":"A","c":"","p":"","n":"","share":""}],"notes":""}',
        ),
      }),
    ),
  );
});
void test('notebook flags changed methods, removed/archived products and technical revisions', () => {
  const item = specimen();
  const product = structuredClone(bearingProducts[0]);
  assert.equal(caseStaleness(item, []), null);
  assert.equal(
    caseStaleness({ ...item, method: 'manual-workbench/0' }, []),
    'method',
  );
  item.product = { id: product.id, revision: calculationRevision(product) };
  assert.equal(caseStaleness(item, [product]), null);
  assert.equal(caseStaleness(item, []), 'product');
  assert.equal(
    caseStaleness(item, [{ ...product, isArchived: true }]),
    'product',
  );
  assert.equal(
    caseStaleness(item, [{ ...product, crKn: product.crKn + 1 }]),
    'product',
  );
  assert.equal(
    calculationEligibility(product).eligible,
    false,
    'Manual cases never approve catalog calculations',
  );
});
void test('lubrication worksheet accepts subzero temperatures but flags incomplete or impossible observations', () => {
  const values = {
    lubricant: 'Documented lubricant',
    manufacturer: 'Machine manual §4',
    interval: 'Per maintenance sheet',
    n: '۱۵۰۰',
    temperature: '−۲۰',
    sealing: 'open',
    access: 'yes',
    water: 'no',
  };
  assert.deepEqual(lubricationReview(values).missing, []);
  assert.equal(lubricationReview(values).requiresRelubricationCheck, false);
  assert.equal(
    lubricationReview({ ...values, sealing: 'sealed' })
      .requiresRelubricationCheck,
    true,
  );
  assert.equal(
    lubricationReview({ ...values, water: 'yes' }).contaminationReview,
    true,
  );
  for (const n of ['', 'rpm', '-1', '0'])
    assert.ok(lubricationReview({ ...values, n }).missing.includes('n'));
  for (const temperature of ['', 'NaN', '-273.15', '-300'])
    assert.ok(
      lubricationReview({ ...values, temperature }).missing.includes(
        'temperature',
      ),
    );
  assert.ok(
    lubricationReview({ ...values, water: 'unknown' }).missing.includes(
      'water',
    ),
  );
});
