import type { BearingProduct } from '../domain/product';
import { object } from './content-validation';
import { safeObject, safeUrl, validateProduct } from './validation';

export type ProductRecordResult =
  | { product: BearingProduct; errors: [] }
  | { product: null; errors: string[] };

/** Complete persistence contract, shared by editing, importing and restore.
 * Keep uploaded values unknown until all required and optional types pass. */
export function readProductRecord(input: unknown): ProductRecordResult {
  const errors = validateProduct(input);
  if (!object(input)) return { product: null, errors };
  if (!safeObject(input)) errors.push('Unsafe product object.');
  for (const key of [
    'id',
    'descriptionEn',
    'descriptionFa',
    'cageMaterialEn',
    'cageMaterialFa',
    'sealingEn',
    'sealingFa',
  ])
    if (typeof input[key] !== 'string') errors.push(`${key} must be text.`);
  if (typeof input.id === 'string' && !input.id.trim())
    errors.push('id is required.');
  for (const key of [
    'clearanceOptions',
    'applicationsEn',
    'applicationsFa',
    'brands',
  ])
    if (!Array.isArray(input[key])) errors.push(`${key} must be an array.`);
  if (typeof input.inStock !== 'boolean')
    errors.push('inStock must be a boolean.');
  for (const key of ['featured', 'isArchived'])
    if (input[key] !== undefined && typeof input[key] !== 'boolean')
      errors.push(`${key} must be a boolean.`);
  for (const key of [
    'contactAngle',
    'metaTitleEn',
    'metaTitleFa',
    'metaDescriptionEn',
    'metaDescriptionFa',
    'createdAt',
    'updatedAt',
    'updatedBy',
  ])
    if (input[key] !== undefined && typeof input[key] !== 'string')
      errors.push(`${key} must be text.`);
  if (
    input.speedReferenceType !== undefined &&
    (typeof input.speedReferenceType !== 'string' ||
      !['limiting', 'thermal', 'both'].includes(input.speedReferenceType))
  )
    errors.push('Invalid speedReferenceType.');
  if (Array.isArray(input.technicalSources))
    for (const source of input.technicalSources as unknown[]) {
      if (!object(source)) continue; // validateProduct reports malformed source objects.
      if (
        source.catalogCode !== undefined &&
        typeof source.catalogCode !== 'string'
      )
        errors.push('Technical source catalogCode must be text.');
      if (source.url !== undefined && !safeUrl(source.url))
        errors.push('Invalid technical source URL.');
      if (typeof source.verifiedAt !== 'string')
        errors.push('Technical source verifiedAt must be text.');
      if (
        typeof source.sourceType !== 'string' ||
        ![
          'official_catalog',
          'official_product_table',
          'engineering_manual',
          'industry_standard',
        ].includes(source.sourceType)
      )
        errors.push('Invalid technical source type.');
    }
  return errors.length
    ? { product: null, errors }
    : { product: input as unknown as BearingProduct, errors: [] };
}
