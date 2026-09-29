import { validateContent } from './content-validation';
export const categories = [
  'ball',
  'roller',
  'spherical',
  'cylindrical',
  'thrust',
  'housing',
  'seal',
  'lubricant',
];
export const schematics = [
  'deep-groove',
  'angular-contact',
  'self-aligning-ball',
  'tapered',
  'spherical',
  'cylindrical',
  'needle',
  'carb',
  'thrust',
  'spherical-thrust',
  'pillow-block',
  'oil-seal',
];
const fields =
  `id code slug category nameFa nameEn descriptionFa descriptionEn inStock featured isArchived d D B weightKg crKn corKn speedGreaseRpm speedOilRpm speedReferenceRpm speedLimitingRpm thermalSpeedRatingRpm speedReferenceType cageMaterialFa cageMaterialEn sealingFa sealingEn clearanceOptions schematicType rMin contactAngle calculationFactorE calculationFactorX calculationFactorY calculationFactorY0 calculationFactorY1 calculationFactorY2 calculationFactorF0 imageUrl images pdfUrl applicationsFa applicationsEn industryIds brands technicalSources metaTitleFa metaTitleEn metaDescriptionFa metaDescriptionEn keywords createdAt updatedAt updatedBy`.split(
    ' ',
  );
export function safeUrl(s: any) {
  return (
    typeof s === 'string' &&
    (s === '' || /^\/(?!\/)[^\s]*$/.test(s) || /^https:\/\/[^\s]+$/.test(s))
  );
}
export function validateProduct(p: any) {
  const errors: string[] = [];
  if (!p || typeof p !== 'object' || Array.isArray(p))
    return ['Product must be an object.'];
  for (const k of Object.keys(p))
    if (!fields.includes(k)) errors.push(`Unknown product field: ${k}`);
  for (const k of ['code', 'slug', 'nameEn', 'nameFa'])
    if (typeof p[k] !== 'string' || !p[k].trim() || p[k].length > 200)
      errors.push(`${k} is required (maximum 200 characters).`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug || ''))
    errors.push('Use a lowercase URL slug with single hyphens.');
  if (!categories.includes(p.category)) errors.push('Invalid category.');
  if (!schematics.includes(p.schematicType))
    errors.push('Invalid schematic type.');
  const nonrotary = ['lubricant'].includes(p.category);
  for (const k of [
    'd',
    'D',
    'B',
    'weightKg',
    'crKn',
    'corKn',
    'speedGreaseRpm',
    'speedOilRpm',
  ])
    if (
      typeof p[k] !== 'number' ||
      !Number.isFinite(p[k]) ||
      p[k] < 0 ||
      p[k] > 200000
    )
      errors.push(`${k} must be a finite non-negative number.`);
  if (!nonrotary && (!(p.d > 0) || !(p.D > p.d) || !(p.B > 0)))
    errors.push('Dimensions must satisfy 0 < d < D and B > 0.');
  for (const k of fields
    .filter((x) => x.startsWith('calculationFactor'))
    .concat(['speedReferenceRpm', 'speedLimitingRpm', 'thermalSpeedRatingRpm', 'rMin']))
    if (
      p[k] !== undefined &&
      (typeof p[k] !== 'number' ||
        !Number.isFinite(p[k]) ||
        p[k] < 0 ||
        p[k] > 200000)
    )
      errors.push(`Invalid ${k}.`);
  for (const k of [
    'images',
    'clearanceOptions',
    'applicationsFa',
    'applicationsEn',
    'brands',
    'industryIds',
    'keywords',
  ])
    if (
      p[k] !== undefined &&
      (!Array.isArray(p[k]) ||
        p[k].length > 100 ||
        p[k].some((x: any) => typeof x !== 'string' || x.length > 1000))
    )
      errors.push(`${k} must be an array of short strings.`);
  for (const k of ['imageUrl', 'pdfUrl'])
    if (p[k] !== undefined && !safeUrl(p[k])) errors.push(`Invalid ${k}.`);
  if (Array.isArray(p.images) && p.images.some((x: any) => !safeUrl(x)))
    errors.push('Invalid image URL.');
  if (
    p.technicalSources !== undefined &&
    (!Array.isArray(p.technicalSources) ||
      p.technicalSources.length > 30 ||
      p.technicalSources.some(
        (s: any) =>
          !s ||
          typeof s.manufacturer !== 'string' ||
          typeof s.reference !== 'string' ||
          (s.url && !safeUrl(s.url)),
      ))
  )
    errors.push('Technical sources require manufacturer and reference.');
  for (const [k, v] of Object.entries(p))
    if (typeof v === 'string' && v.length > 10000)
      errors.push(`${k} is too long.`);
  return errors;
}
export function safeObject(x: any, depth = 0): boolean {
  if (depth > 15) return false;
  if (x && typeof x === 'object') {
    if (
      Object.keys(x).some((k) =>
        ['__proto__', 'prototype', 'constructor'].includes(k),
      )
    )
      return false;
    return Object.values(x).every((v) => safeObject(v, depth + 1));
  }
  return true;
}
export function validateSettings(kind: string, x: any) {
  if (!x || typeof x !== 'object' || Array.isArray(x) || !safeObject(x))
    return ['Invalid settings.'];
  if (JSON.stringify(x).length > (kind === 'content' ? 500000 : 80000))
    return ['Settings too large.'];
  if (kind === 'seo') {
    for (const k of ['domainEn', 'domainFa']) {
      try {
        const u = new URL(x[k]);
        if (
          u.protocol !== 'https:' ||
          u.pathname !== '/' ||
          u.hostname === 'localhost'
        )
          return ['Canonical domains must be HTTPS origins.'];
      } catch {
        return ['Invalid canonical domain.'];
      }
    }
    if (x.ogImage && !safeUrl(x.ogImage)) return ['Invalid image URL.'];
  }
  if (kind === 'company') {
    for (const [k, v] of Object.entries(x)) {
      if (typeof v === 'string' && v.length > 3000)
        return ['Company field too long.'];
      if (/Url$/.test(k) && !safeUrl(v))
        return ['Use safe HTTPS contact links.'];
    }
  }
  if (kind === 'content') return validateContent(x);
  return [];
}
