import { basicLife } from './engineering';
import { parseEngineeringNumber } from './engineering-input';

/** Completeness only; never a lubricant/quantity/interval recommendation. */
export function lubricationReview(values: Record<string, string>) {
  const missing = ['lubricant', 'manufacturer', 'interval'].filter(
    (key) => !values[key]?.trim(),
  );
  const speed = parseEngineeringNumber(values.n || '', 'positive');
  const temperature = parseEngineeringNumber(values.temperature || '');
  if (speed.kind !== 'valid') missing.push('n');
  if (temperature.kind !== 'valid' || temperature.value <= -273.15)
    missing.push('temperature');
  for (const key of ['sealing', 'access', 'water'])
    if (!values[key] || values[key] === 'unknown') missing.push(key);
  return {
    missing,
    requiresRelubricationCheck:
      values.sealing !== 'open' || values.access !== 'yes',
    contaminationReview: values.water === 'yes',
  };
}

export type BearingKind = 'ball' | 'roller';
export const workbenchMethodVersion = 'manual-workbench/1';
const positive = (...values: number[]) => {
  if (values.some((value) => !Number.isFinite(value) || value <= 0))
    throw new Error('positive');
};
const finiteResult = (...values: number[]) => {
  if (values.some((value) => !Number.isFinite(value) || value <= 0))
    throw new Error('range');
};
export function lifeExponent(kind: BearingKind) {
  if (kind !== 'ball' && kind !== 'roller') throw new Error('family');
  return kind === 'ball' ? 3 : 10 / 3;
}
/** Inverse of basic rating life at 90% reliability; not a selection approval. */
export function targetCapacity(
  P: number,
  rpm: number,
  hours: number,
  kind: BearingKind,
) {
  positive(P, rpm, hours);
  const revolutions = (60 * rpm * hours) / 1e6;
  const capacity = P * revolutions ** (1 / lifeExponent(kind));
  finiteResult(revolutions, capacity);
  return { capacity, revolutions };
}
export function scenarioLife(
  C: number,
  P: number,
  rpm: number,
  kind: BearingKind,
) {
  lifeExponent(kind);
  return basicLife(C, P, rpm, kind === 'roller');
}
export type DutyStage = { load: number; rpm: number; share: number };
/** Time fractions and speed-weighted revolutions. All stages must rotate with known load. */
export function dutyLife(C: number, stages: DutyStage[], kind: BearingKind) {
  positive(C);
  const exponent = lifeExponent(kind);
  if (!stages.length || stages.length > 8) throw new Error('stages');
  for (const stage of stages) positive(stage.load, stage.rpm, stage.share);
  const total = stages.reduce((sum, stage) => sum + stage.share, 0);
  if (Math.abs(total - 100) > 1e-6) throw new Error('shares');
  const fractions = stages.map((stage) => stage.share / total);
  const rates = stages.map(
    (stage, index) =>
      fractions[index] / scenarioLife(C, stage.load, stage.rpm, kind).hours,
  );
  const damageRate = rates.reduce((a, b) => a + b, 0);
  const hours = 1 / damageRate;
  const meanRpm = stages.reduce(
    (sum, stage, index) => sum + fractions[index] * stage.rpm,
    0,
  );
  const equivalentLoad =
    C * ((damageRate * 1e6) / (60 * meanRpm)) ** (1 / exponent);
  finiteResult(hours, meanRpm, equivalentLoad, damageRate);
  return {
    hours,
    meanRpm,
    equivalentLoad,
    damageShares: rates.map((rate) => rate / damageRate),
  };
}
export type PowerUnknown = 'torque' | 'power' | 'rpm';
/** Mechanical shaft power P[W] = T[Nm] × 2π n[rpm]/60. No motor efficiency assumption. */
export function shaftPower(
  unknown: PowerUnknown,
  first: number,
  second: number,
) {
  positive(first, second);
  const value =
    unknown === 'torque'
      ? (first * 1000 * 60) / (2 * Math.PI * second)
      : unknown === 'power'
        ? (first * 2 * Math.PI * second) / 60000
        : unknown === 'rpm'
          ? (first * 1000 * 60) / (2 * Math.PI * second)
          : NaN;
  finiteResult(value);
  return value;
}
