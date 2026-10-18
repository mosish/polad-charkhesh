import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseEngineeringNumber, engineeringNumber, formatEngineeringNumber } from '../lib/engineering-input';
import { convertEngineeringUnit, unitQuantities } from '../lib/engineering-units';
import { basicLife } from '../lib/engineering';
import { fitRange } from '../lib/showroom';

function value(n: number, quantity: string, from: string, to: string) {
  const result = convertEngineeringUnit(n, quantity, from, to);
  assert.equal(result.kind, 'valid');
  if (result.kind !== 'valid') throw new Error('Unexpected invalid conversion');
  return result.value;
}
function close(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) <= Math.max(1e-10, Math.abs(expected) * 1e-12), `${actual} != ${expected}`);
}
void test('numeric input accepts Latin, Persian, Arabic and mixed digits without altering the draft', () => {
  for (const [raw, expected] of [[' ۱۲۳٫۴۵ ', 123.45], ['١٢٣.٤٥', 123.45], ['−۲٫۵', -2.5], ['+۳e۲', 300], ['.۵', 0.5], ['1.', 1], ['۱2٣', 123], ['-0', 0], ['۰e-400', 0]] as const) {
    assert.deepEqual(parseEngineeringNumber(raw), { kind: 'valid', value: expected });
  }
});
void test('blank and malformed drafts never coerce to zero or a partial numeric prefix', () => {
  for (const blank of ['', ' ', '\t\n']) assert.deepEqual(parseEngineeringNumber(blank), { kind: 'blank' });
  for (const raw of ['1,234', '۱٬۲۳۴', '1,5', '1 000', '1.2.3', '5kN', 'NaN', 'Infinity', '0x10', '0b10', '-', '.', '1e', '1e+', '1/2', '\u200f۱۲', '1'.repeat(129)]) {
    assert.deepEqual(parseEngineeringNumber(raw), { kind: 'invalid', reason: 'syntax' }, raw);
    assert.ok(Number.isNaN(engineeringNumber(raw)));
  }
  for (const raw of ['1e309', '1e-400', '-1e-400']) assert.deepEqual(parseEngineeringNumber(raw), { kind: 'invalid', reason: 'range' });
  assert.equal(parseEngineeringNumber('0', 'positive').kind, 'invalid');
  assert.equal(parseEngineeringNumber('-1', 'nonnegative').kind, 'invalid');
  assert.equal(parseEngineeringNumber('0', 'nonnegative').kind, 'valid');
});
void test('localized inputs reproduce existing manual life and fit calculations', () => {
  close(basicLife(engineeringNumber('۳۰'), engineeringNumber('٣'), engineeringNumber('۱۵۰۰'), false).L10, 1000);
  const result = fitRange(...['۲۰', '۲۰٫۰۱', '۱۹٫۹۸', '۱۹٫۹۹'].map(engineeringNumber) as [number, number, number, number]);
  close(result.min, 10); close(result.max, 30); assert.equal(result.kind, 'clearance');
  assert.throws(() => basicLife(engineeringNumber(''), 3, 1500, false));
});

// Fixed references, independent of registry factors. Source/derivations documented in C3A_INPUTS_UNITS.md.
const benchmarks: readonly (readonly [string, number, string, string, number])[] = [
  ['length', 25.4, 'mm', 'in', 1], ['length', 2, 'in', 'mm', 50.8], ['length', 0.02, 'mm', 'um', 20],
  ['force', 2, 'kN', 'N', 2000], ['force', 1000, 'N', 'kN', 1], ['force', 1, 'lbf', 'N', 4.4482216152605],
  ['pressure', 1, 'bar', 'kPa', 100], ['pressure', 2, 'MPa', 'bar', 20], ['pressure', 1, 'psi', 'Pa', 6894.757293168361],
  ['torque', 2, 'Nm', 'Nmm', 2000], ['torque', 1000, 'Nmm', 'Nm', 1], ['torque', 1, 'lbfft', 'Nm', 1.3558179483314],
  ['power', 2, 'kW', 'W', 2000], ['power', 500, 'W', 'kW', 0.5], ['power', 1, 'hp', 'W', 745.6998715822702],
  ['temperature', 0, 'C', 'F', 32], ['temperature', 212, 'F', 'C', 100], ['temperature', 0, 'K', 'C', -273.15],
  ['temperature', -459.67, 'F', 'K', 0], ['temperature', -40, 'C', 'F', -40],
  ['temperature-difference', 10, 'dC', 'dF', 18], ['temperature-difference', -18, 'dF', 'dK', -10], ['temperature-difference', 1, 'dK', 'dC', 1],
  ['rotation', 60, 'rpm', 'rad-s', 6.283185307179586], ['rotation', 1, 'rev-s', 'rpm', 60], ['rotation', 3.141592653589793, 'rad-s', 'rpm', 30],
];
for (const quantity of unitQuantities) {
  void test(`${quantity.id}: independent benchmarks and every supported direction`, () => {
    for (const [id, input, from, to, expected] of benchmarks.filter(row => row[0] === quantity.id)) {
      close(value(input, id, from, to), expected);
      close(value(expected, id, to, from), input);
    }
    for (const from of quantity.units) for (const to of quantity.units) {
      close(value(value(123.456, quantity.id, from.id, to.id), quantity.id, to.id, from.id), 123.456);
      assert.equal(value(123.456, quantity.id, from.id, from.id), 123.456);
    }
  });
}
void test('unit and range boundaries reject incompatible quantities, absolute-zero violations and numeric failure', () => {
  for (const args of [[1, 'force', 'kg', 'N'], [1, 'length', 'mm', 'N'], [1, 'unknown', 'mm', 'mm']] as const) {
    assert.deepEqual(convertEngineeringUnit(args[0], args[1], args[2], args[3]), { kind: 'invalid', reason: 'unit' });
  }
  for (const [unit, input] of [['K', -0.001], ['C', -273.150001], ['F', -459.670001]] as const) {
    assert.deepEqual(convertEngineeringUnit(input, 'temperature', unit, 'K'), { kind: 'invalid', reason: 'absolute-zero' });
    assert.deepEqual(convertEngineeringUnit(input, 'temperature', unit, unit), { kind: 'invalid', reason: 'absolute-zero' });
  }
  for (const input of [NaN, Infinity, -Infinity]) assert.equal(convertEngineeringUnit(input, 'length', 'mm', 'in').kind, 'invalid');
  assert.equal(convertEngineeringUnit(Number.MAX_VALUE, 'length', 'm', 'um').kind, 'invalid');
  assert.equal(convertEngineeringUnit(Number.MIN_VALUE, 'length', 'um', 'm').kind, 'invalid');
  assert.equal(convertEngineeringUnit(Number.MAX_VALUE / 2, 'pressure', 'MPa', 'bar').kind, 'invalid');
  // SI intermediate would overflow, but the requested ratio remains representable.
  assert.equal(value(Number.MAX_VALUE / 20, 'pressure', 'MPa', 'bar'), Number.MAX_VALUE / 20 * 10);
});
void test('display is locale-specific, preserves small nonzero values and does not feed rounding into conversion', () => {
  assert.equal(formatEngineeringNumber(123.5, false), '123.5');
  assert.match(formatEngineeringNumber(123.5, true), /۱۲۳٫۵/);
  assert.match(formatEngineeringNumber(1e-9, false), /E-9/);
  assert.match(formatEngineeringNumber(1e20, false), /E20/);
  const precise = value(1, 'length', 'mm', 'in');
  close(value(precise, 'length', 'in', 'mm'), 1);
});
