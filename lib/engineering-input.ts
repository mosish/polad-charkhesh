export type NumberConstraint = 'any' | 'positive' | 'nonnegative';
export type NumberInputState = { kind: 'blank' } | { kind: 'valid'; value: number } |
  { kind: 'invalid'; reason: 'syntax' | 'range' | 'positive' | 'nonnegative' };

/** No grouping separators: a comma must never be guessed to be decimal or thousands. */
export function parseEngineeringNumber(raw: string, constraint: NumberConstraint = 'any'): NumberInputState {
  const text = raw.trim().replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632)).replace(/٫/g, '.').replace(/−/g, '-');
  if (!text) return { kind: 'blank' };
  if (text.length > 128 || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)) return { kind: 'invalid', reason: 'syntax' };
  const value = Number(text);
  if (!Number.isFinite(value) || (value === 0 && /[1-9]/.test(text.split(/[eE]/)[0]))) return { kind: 'invalid', reason: 'range' };
  if (constraint === 'positive' && value <= 0) return { kind: 'invalid', reason: 'positive' };
  if (constraint === 'nonnegative' && value < 0) return { kind: 'invalid', reason: 'nonnegative' };
  return { kind: 'valid', value: Object.is(value, -0) ? 0 : value };
}

export function engineeringNumber(raw: string): number {
  const parsed = parseEngineeringNumber(raw);
  return parsed.kind === 'valid' ? parsed.value : NaN;
}

/** Display rounding only; small nonzero results must not appear as zero. */
export function formatEngineeringNumber(value: number, fa: boolean): string {
  return new Intl.NumberFormat(fa ? 'fa-IR' : 'en-US', {
    maximumSignificantDigits: 12, useGrouping: false,
    notation: value !== 0 && (Math.abs(value) < 1e-6 || Math.abs(value) >= 1e12) ? 'scientific' : 'standard',
  }).format(value);
}
