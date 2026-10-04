import crypto from 'node:crypto';
import type { BearingProduct } from '../domain/product';
import { validateProduct, safeObject } from './validation';

export function planCatalogImport(input: unknown, existing: BearingProduct[]) {
  if (!Array.isArray(input) || !input.length || input.length > 200 || !safeObject(input))
    return { products: [] as BearingProduct[], rows: [], errors: ['Import 1–200 product objects.'] };
  const byCode = new Map(existing.map(p => [p.code.toLowerCase(), p]));
  const products: BearingProduct[] = [];
  const rows: { code: string; action: 'create' | 'update'; changes: { field: string; before: unknown; after: unknown }[] }[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  input.forEach((value, index) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) { errors.push(`Row ${index + 1}: expected a product object.`); return; }
    const row = value as Partial<BearingProduct>;
    const code = typeof row.code === 'string' ? row.code.trim() : '';
    const old = byCode.get(code.toLowerCase());
    if (seen.has(code.toLowerCase())) errors.push(`Row ${index + 1}: duplicate code ${code}.`);
    seen.add(code.toLowerCase());
    const p = { descriptionEn: '', descriptionFa: '', cageMaterialEn: '', cageMaterialFa: '',
      sealingEn: '', sealingFa: '', clearanceOptions: [], applicationsEn: [], applicationsFa: [],
      brands: [], featured: false, inStock: false, ...old, ...row, code,
      id: old?.id || crypto.randomUUID(), createdAt: old?.createdAt,
    } as BearingProduct;
    const invalid = validateProduct(p);
    for (const key of ['descriptionEn', 'descriptionFa', 'cageMaterialEn', 'cageMaterialFa', 'sealingEn', 'sealingFa'] as const)
      if (typeof p[key] !== 'string') invalid.push(`${key} must be text.`);
    for (const key of ['clearanceOptions', 'applicationsEn', 'applicationsFa', 'brands'] as const)
      if (!Array.isArray(p[key])) invalid.push(`${key} must be an array.`);
    for (const key of ['featured', 'inStock', 'isArchived'] as const)
      if (p[key] !== undefined && typeof p[key] !== 'boolean') invalid.push(`${key} must be a boolean.`);
    for (const key of ['contactAngle', 'metaTitleEn', 'metaTitleFa', 'metaDescriptionEn', 'metaDescriptionFa', 'updatedAt', 'updatedBy'] as const)
      if (p[key] !== undefined && typeof p[key] !== 'string') invalid.push(`${key} must be text.`);
    if (p.speedReferenceType !== undefined && !['limiting', 'thermal', 'both'].includes(p.speedReferenceType)) invalid.push('Invalid speedReferenceType.');
    if (Array.isArray(p.technicalSources)) for (const source of p.technicalSources) {
      if (!source || typeof source !== 'object') continue;
      for (const key of ['catalogCode', 'verifiedAt'] as const)
        if (source[key] !== undefined && typeof source[key] !== 'string') invalid.push(`Technical source ${key} must be text.`);
      if (!['official_catalog', 'official_product_table', 'engineering_manual', 'industry_standard'].includes(source.sourceType)) invalid.push('Invalid technical source type.');
    }
    errors.push(...invalid.map(message => `Row ${index + 1} (${code}): ${message}`));
    const changes = Object.keys(row).filter(key => !['id', 'createdAt', 'updatedAt', 'updatedBy'].includes(key))
      .filter(key => JSON.stringify(old?.[key as keyof BearingProduct]) !== JSON.stringify(p[key as keyof BearingProduct]))
      .map(field => ({ field, before: old?.[field as keyof BearingProduct] ?? null, after: p[field as keyof BearingProduct] }));
    products.push(p); rows.push({ code, action: old ? 'update' : 'create', changes });
  });
  const slugs = new Map(existing.map(p => [p.slug, p.id]));
  for (const p of products) {
    if (slugs.has(p.slug) && slugs.get(p.slug) !== p.id) errors.push(`Slug ${p.slug} is already used by another product.`);
    slugs.set(p.slug, p.id);
  }
  return { products, rows, errors: errors.slice(0, 100) };
}
