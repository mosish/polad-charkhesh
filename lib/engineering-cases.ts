import type { BearingProduct } from '../domain/product';
import {
  workbookTools,
  type WorkbookTool,
} from '../domain/engineering-workbench';
import { calculationRevision } from './engineering-eligibility';
import { workbenchMethodVersion } from './engineering-workbench';

export type WorkbookRow = {
  label: string;
  c: string;
  p: string;
  n: string;
  share: string;
};
export type WorkbookDraft = {
  values: Record<string, string>;
  rows: WorkbookRow[];
  notes: string;
};
export type EngineeringCase = {
  id: string;
  name: string;
  savedAt: string;
  schema: 1;
  method: string;
  tool: WorkbookTool;
  draft: WorkbookDraft;
  product?: { id: string; revision: string };
};
export const caseStorageKey = 'pc-engineering-cases-v1';
export const valueKeys = [
  'kind',
  'p',
  'n',
  'hours',
  'c',
  'holeMin',
  'holeMax',
  'shaftMin',
  'shaftMax',
  'unknown',
  'first',
  'second',
  'symptom',
  'onset',
  'urgent',
  'contamination',
  'lubricant',
  'temperature',
  'sealing',
  'access',
  'water',
  'manufacturer',
  'interval',
] as const;
export function initialWorkbookDraft(): WorkbookDraft {
  return {
    values: {
      kind: '',
      p: '',
      n: '',
      hours: '',
      c: '',
      holeMin: '',
      holeMax: '',
      shaftMin: '',
      shaftMax: '',
      unknown: 'torque',
      first: '',
      second: '',
      symptom: 'heat',
      onset: 'unknown',
      urgent: 'unknown',
      contamination: 'unknown',
      lubricant: '',
      temperature: '',
      sealing: 'unknown',
      access: 'unknown',
      water: 'unknown',
      manufacturer: '',
      interval: '',
    },
    rows: [
      { label: 'A', c: '', p: '', n: '', share: '50' },
      { label: 'B', c: '', p: '', n: '', share: '50' },
    ],
    notes: '',
  };
}
const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));
const text = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.length <= max;
const keysOnly = (value: Record<string, unknown>, keys: readonly string[]) =>
  Object.keys(value).every((key) => keys.includes(key));
export function validWorkbookDraft(value: unknown): value is WorkbookDraft {
  if (
    !record(value) ||
    !keysOnly(value, ['values', 'rows', 'notes']) ||
    !record(value.values) ||
    !text(value.notes, 1000) ||
    !Array.isArray(value.rows) ||
    value.rows.length < 1 ||
    value.rows.length > 8
  )
    return false;
  if (
    !keysOnly(value.values, valueKeys) ||
    !Object.values(value.values).every((item) => text(item, 300))
  )
    return false;
  const enums: Record<string, readonly string[]> = {
    kind: ['', 'ball', 'roller'],
    unknown: ['torque', 'power', 'rpm'],
    symptom: ['heat', 'noise', 'vibration', 'movement', 'early'],
    onset: ['unknown', 'service', 'load', 'ongoing'],
    urgent: ['unknown', 'yes', 'no'],
    contamination: ['unknown', 'yes', 'no'],
    sealing: ['unknown', 'sealed', 'open'],
    access: ['unknown', 'yes', 'no'],
    water: ['unknown', 'yes', 'no'],
  };
  const fields = value.values;
  if (
    Object.entries(enums).some(
      ([key, options]) =>
        fields[key] !== undefined &&
        (typeof fields[key] !== 'string' || !options.includes(fields[key])),
    )
  )
    return false;
  return value.rows.every(
    (row) =>
      record(row) &&
      keysOnly(row, ['label', 'c', 'p', 'n', 'share']) &&
      ['label', 'c', 'p', 'n', 'share'].every((key) =>
        text(row[key], key === 'label' ? 60 : 128),
      ),
  );
}
export function validEngineeringCase(value: unknown): value is EngineeringCase {
  if (
    !record(value) ||
    !keysOnly(value, [
      'id',
      'name',
      'savedAt',
      'schema',
      'method',
      'tool',
      'draft',
      'product',
    ])
  )
    return false;
  return (
    value.schema === 1 &&
    text(value.id, 80) &&
    Boolean(value.id) &&
    text(value.name, 80) &&
    Boolean(value.name.trim()) &&
    text(value.savedAt, 40) &&
    Number.isFinite(Date.parse(value.savedAt)) &&
    text(value.method, 80) &&
    workbookTools.some((tool) => tool.id === value.tool) &&
    validWorkbookDraft(value.draft) &&
    (value.product === undefined ||
      (record(value.product) &&
        keysOnly(value.product, ['id', 'revision']) &&
        text(value.product.id, 200) &&
        text(value.product.revision, 20000)))
  );
}
/** Inputs only: imports never trust cached results or grant catalog calculation approval. */
export function parseCaseFile(raw: string): EngineeringCase[] {
  if (raw.length > 250000) throw new Error('size');
  const value: unknown = JSON.parse(raw);
  if (
    !record(value) ||
    !keysOnly(value, ['schema', 'cases']) ||
    value.schema !== 1 ||
    !Array.isArray(value.cases) ||
    value.cases.length > 20 ||
    !value.cases.every(validEngineeringCase)
  )
    throw new Error('schema');
  if (new Set(value.cases.map((item) => item.id)).size !== value.cases.length)
    throw new Error('duplicate');
  return value.cases;
}
export function caseStaleness(
  item: EngineeringCase,
  products: BearingProduct[],
) {
  if (item.method !== workbenchMethodVersion) return 'method';
  if (!item.product) return null;
  const current = products.find(
    (product) => product.id === item.product?.id && !product.isArchived,
  );
  return !current || calculationRevision(current) !== item.product.revision
    ? 'product'
    : null;
}
