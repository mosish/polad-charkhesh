import { isDeepStrictEqual } from 'node:util';
import type { BearingProduct } from '../domain/product';
import { safeObject, validateProduct } from './validation';
import { planCatalogImport } from './catalog-import';

export type FieldValue = { present: false } | { present: true; value: unknown };
export interface ReviewChange { field: string; before: FieldValue; after: FieldValue; evidence: string[] }
export interface ReviewRow {
  id: string;
  identity: Pick<BearingProduct, 'code' | 'slug' | 'brands' | 'category' | 'schematicType'>;
  guards: Record<string, FieldValue>;
  changes: ReviewChange[];
}
export interface CatalogReviewPatch { schemaVersion: 1; baselineSha256: string; rows: ReviewRow[] }
const protectedFields = new Set(['id', 'slug', 'code', 'brands', 'category', 'schematicType', 'createdAt', 'updatedAt', 'updatedBy']);
const optionalFields = new Set('featured isArchived speedReferenceRpm speedLimitingRpm thermalSpeedRatingRpm speedReferenceType rMin contactAngle calculationFactorE calculationFactorX calculationFactorY calculationFactorY0 calculationFactorY1 calculationFactorY2 calculationFactorF0 imageUrl images pdfUrl industryIds technicalSources metaTitleEn metaTitleFa metaDescriptionEn metaDescriptionFa keywords'.split(' '));
export const fieldValue = (p: object, field: string): FieldValue => Object.hasOwn(p, field)
  ? { present: true, value: (p as Record<string, unknown>)[field] } : { present: false };
function validValue(v: unknown): v is FieldValue {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const x = v as Record<string, unknown>;
  return x.present === false ? Object.keys(x).length === 1
    : x.present === true && Object.hasOwn(x, 'value') && Object.keys(x).length === 2;
}

/** Pure, atomic planning only. No seed import, filesystem access or live writes. */
export function planCatalogReviewPatch(input: unknown, existing: BearingProduct[]) {
  const errors: string[] = [];
  const products: BearingProduct[] = [];
  if (!safeObject(input) || !input || typeof input !== 'object')
    return { products, errors: ['Invalid catalog review patch.'] };
  const patch = input as CatalogReviewPatch;
  if (patch.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(patch.baselineSha256 || '') ||
      !Array.isArray(patch.rows) || !patch.rows.length || patch.rows.length > 200)
    return { products, errors: ['Expected schemaVersion 1, baseline SHA-256 and 1–200 review rows.'] };
  const byId = new Map(existing.map(p => [p.id, p]));
  const seen = new Set<string>();
  for (const row of patch.rows) {
    if (!row || typeof row.id !== 'string' || seen.has(row.id) || !row.identity ||
        !row.guards || typeof row.guards !== 'object' || Array.isArray(row.guards) ||
        !Array.isArray(row.changes) || !row.changes.length || row.changes.length > 100) {
      errors.push('Invalid or duplicate review row.'); continue;
    }
    seen.add(row.id);
    const old = byId.get(row.id);
    if (!old) { errors.push(`${row.id}: existing ID not found; creation is forbidden.`); continue; }
    for (const key of ['code', 'slug', 'brands', 'category', 'schematicType'] as const)
      if (!isDeepStrictEqual(old[key], row.identity[key])) errors.push(`${row.id}: identity conflict (${key}).`);
    for (const [key, expected] of Object.entries(row.guards))
      if (!validValue(expected) || !isDeepStrictEqual(fieldValue(old, key), expected))
        errors.push(`${row.id}: baseline conflict (${key}).`);
    const next = structuredClone(old);
    const changed = new Set<string>();
    for (const change of row.changes) {
      if (!change || typeof change.field !== 'string' || protectedFields.has(change.field) || changed.has(change.field) ||
          !validValue(change.before) || !validValue(change.after) || !Array.isArray(change.evidence) ||
          !change.evidence.length || change.evidence.some(e => typeof e !== 'string' || !e.trim()) ||
          (!change.after.present && !optionalFields.has(change.field))) {
        errors.push(`${row.id}: invalid or protected change.`); continue;
      }
      changed.add(change.field);
      if (!isDeepStrictEqual(fieldValue(old, change.field), change.before)) {
        errors.push(`${row.id}: baseline conflict (${change.field}).`); continue;
      }
      if (change.after.present) (next as unknown as Record<string, unknown>)[change.field] = structuredClone(change.after.value);
      else delete (next as unknown as Record<string, unknown>)[change.field];
    }
    errors.push(...validateProduct(next).map(e => `${row.id}: ${e}`));
    for (const field of ['descriptionEn','descriptionFa','cageMaterialEn','cageMaterialFa','sealingEn','sealingFa'] as const)
      if (typeof next[field] !== 'string') errors.push(`${row.id}: ${field} must be text.`);
    for (const field of ['clearanceOptions','applicationsEn','applicationsFa','brands'] as const)
      if (!Array.isArray(next[field])) errors.push(`${row.id}: ${field} must be an array.`);
    if (typeof next.inStock !== 'boolean') errors.push(`${row.id}: inStock must be a boolean.`);
    errors.push(...planCatalogImport([next], [old]).errors);
    products.push(next);
  }
  return { products: errors.length ? [] : products, errors };
}
