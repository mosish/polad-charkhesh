export interface EngineeringUnit { id: string; symbol: string; scale: number; offset?: number }
export interface UnitQuantity { id: string; en: string; fa: string; units: readonly EngineeringUnit[] }
const lbf = 4.4482216152605;
// NIST SP 811, Appendix B.9 and footnote 24; definitions/derivations in C3A_INPUTS_UNITS.md.
export const unitQuantities: readonly UnitQuantity[] = [
  { id: 'length', en: 'Length', fa: 'طول', units: [
    { id: 'mm', symbol: 'mm', scale: 0.001 }, { id: 'um', symbol: 'µm', scale: 1e-6 },
    { id: 'm', symbol: 'm', scale: 1 }, { id: 'in', symbol: 'in', scale: 0.0254 },
  ] },
  { id: 'force', en: 'Force', fa: 'نیرو', units: [
    { id: 'N', symbol: 'N', scale: 1 }, { id: 'kN', symbol: 'kN', scale: 1000 }, { id: 'lbf', symbol: 'lbf', scale: lbf },
  ] },
  { id: 'pressure', en: 'Pressure', fa: 'فشار', units: [
    { id: 'Pa', symbol: 'Pa', scale: 1 }, { id: 'kPa', symbol: 'kPa', scale: 1000 },
    { id: 'MPa', symbol: 'MPa', scale: 1e6 }, { id: 'bar', symbol: 'bar', scale: 1e5 },
    { id: 'psi', symbol: 'psi', scale: lbf / 0.0254 ** 2 },
  ] },
  { id: 'torque', en: 'Torque', fa: 'گشتاور', units: [
    { id: 'Nm', symbol: 'N·m', scale: 1 }, { id: 'Nmm', symbol: 'N·mm', scale: 0.001 },
    { id: 'lbfft', symbol: 'lbf·ft', scale: lbf * 0.3048 },
  ] },
  { id: 'power', en: 'Power', fa: 'توان', units: [
    { id: 'W', symbol: 'W', scale: 1 }, { id: 'kW', symbol: 'kW', scale: 1000 },
    { id: 'hp', symbol: 'hp (mechanical)', scale: 550 * lbf * 0.3048 },
  ] },
  { id: 'temperature', en: 'Temperature', fa: 'دما', units: [
    { id: 'C', symbol: '°C', scale: 1, offset: 273.15 },
    { id: 'F', symbol: '°F', scale: 5 / 9, offset: 459.67 }, { id: 'K', symbol: 'K', scale: 1 },
  ] },
  { id: 'temperature-difference', en: 'Temperature difference', fa: 'اختلاف دما', units: [
    { id: 'dC', symbol: 'Δ°C', scale: 1 }, { id: 'dF', symbol: 'Δ°F', scale: 5 / 9 }, { id: 'dK', symbol: 'ΔK', scale: 1 },
  ] },
  { id: 'rotation', en: 'Rotational speed', fa: 'سرعت دوران', units: [
    { id: 'rpm', symbol: 'rpm', scale: Math.PI / 30 }, { id: 'rad-s', symbol: 'rad/s', scale: 1 },
    { id: 'rev-s', symbol: 'rev/s', scale: 2 * Math.PI },
  ] },
];
export type UnitConversion = { kind: 'valid'; value: number } | { kind: 'invalid'; reason: 'unit' | 'range' | 'absolute-zero' };
export function convertEngineeringUnit(value: number, quantityId: string, fromId: string, toId: string): UnitConversion {
  const quantity = unitQuantities.find(item => item.id === quantityId);
  const from = quantity?.units.find(unit => unit.id === fromId), to = quantity?.units.find(unit => unit.id === toId);
  if (!from || !to) return { kind: 'invalid', reason: 'unit' };
  if (!Number.isFinite(value)) return { kind: 'invalid', reason: 'range' };
  if (quantityId === 'temperature' && value < -(from.offset ?? 0)) return { kind: 'invalid', reason: 'absolute-zero' };
  // Ratios avoid a needless intermediate SI overflow. Offsets are applied in source units.
  const result = fromId === toId ? value : (value + (from.offset ?? 0)) * (from.scale / to.scale) - (to.offset ?? 0);
  if (!Number.isFinite(result) || (result === 0 && value !== 0 && quantityId !== 'temperature')) return { kind: 'invalid', reason: 'range' };
  return { kind: 'valid', value: Object.is(result, -0) ? 0 : result };
}
