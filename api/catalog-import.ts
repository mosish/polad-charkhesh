import crypto from 'node:crypto';
import type { BearingProduct } from '../domain/product';
import { safeObject } from './validation';
import { object } from './content-validation';
import { readProductRecord } from './product-record';

export function planCatalogImport(input: unknown, existing: BearingProduct[]) {
  if (!Array.isArray(input) || !input.length || input.length > 200 || !safeObject(input))
    return { products: [] as BearingProduct[], rows: [], errors: ['Import 1–200 product objects.'] };
  const byCode = new Map(existing.map(p => [p.code.toLowerCase(), p]));
  const products: BearingProduct[] = [];
  const rows: { code: string; action: 'create' | 'update'; changes: { field: string; before: unknown; after: unknown }[] }[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();
  input.forEach((value, index) => {
    if (!object(value)) { errors.push(`Row ${index + 1}: expected a product object.`); return; }
    const row = value;
    const code = typeof row.code === 'string' ? row.code.trim() : '';
    const old = byCode.get(code.toLowerCase());
    if (seen.has(code.toLowerCase())) errors.push(`Row ${index + 1}: duplicate code ${code}.`);
    seen.add(code.toLowerCase());
    const candidate = { descriptionEn: '', descriptionFa: '', cageMaterialEn: '', cageMaterialFa: '',
      sealingEn: '', sealingFa: '', clearanceOptions: [], applicationsEn: [], applicationsFa: [],
      brands: [], featured: false, inStock: false, ...old, ...row, code,
      id: old?.id || crypto.randomUUID(), createdAt: old?.createdAt,
    };
    const result = readProductRecord(candidate);
    errors.push(...result.errors.map(message => `Row ${index + 1} (${code}): ${message}`));
    if (!result.product) return;
    const p = result.product;
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
  return { products: errors.length ? [] : products, rows, errors: errors.slice(0, 100) };
}
