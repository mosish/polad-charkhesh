import { requestBody, sessionUser, type ApiRequest } from './request';
import { readProductRecord } from './product-record';
import { Router } from 'express';
import crypto from 'node:crypto';
import type { BearingProduct } from '../domain/product';
import { allProducts, product, putProduct, db, audit, transaction } from './database';
import { planCatalogImport } from './catalog-import';
import { planCatalogReviewPatch } from './catalog-review-patch';
import { authenticated, superadmin, getUser } from './security';
export const products = Router();
products.post('/import', authenticated, (req: ApiRequest, res) => {
  const body = requestBody(req);
  const existing = allProducts(true);
  if (body?.reviewPatch !== undefined && body?.products !== undefined)
    return res.status(400).json({ error: 'Provide products or reviewPatch, not both.' });
  const review = body?.reviewPatch !== undefined ? planCatalogReviewPatch(body.reviewPatch, existing) : null;
  if (review?.errors.length) return res.status(409).json({ error: review.errors.join('\n') });
  const plan = planCatalogImport(review?.products ?? body?.products, existing);
  if (plan.errors.length) return res.status(400).json({ error: plan.errors.join('\n') });
  if (review) {
    // A reviewed deletion must not be restored by the ordinary merge importer.
    plan.products = review.products;
    plan.rows = review.products.map(p => {
      const old = existing.find(x => x.id === p.id)!;
      return { code: p.code, action: 'update' as const, changes: [...new Set([...Object.keys(old), ...Object.keys(p)])]
        .filter(key => JSON.stringify(old[key as keyof BearingProduct]) !== JSON.stringify(p[key as keyof BearingProduct]))
        .map(field => ({ field, before: old[field as keyof BearingProduct] ?? null, after: p[field as keyof BearingProduct] ?? null })) };
    });
  }
  const codes = new Set(plan.rows.map(row => row.code.toLowerCase()));
  const revision = crypto.createHash('sha256').update(JSON.stringify(existing.filter(p => codes.has(p.code.toLowerCase())))).digest('hex');
  const summary = { revision, rows: plan.rows, created: plan.rows.filter(row => row.action === 'create').length,
    updated: plan.rows.filter(row => row.action === 'update').length };
  if (body.preview === true) return res.json(summary);
  if (body.confirm !== 'IMPORT') return res.status(400).json({ error: 'Preview the file and confirm IMPORT.' });
  if (body.revision !== revision) return res.status(409).json({ error: 'Catalog records changed after the preview. Preview the file again.' });
  const saved = transaction(() => {
    const currentRevision = crypto.createHash('sha256').update(JSON.stringify(allProducts(true).filter(p => codes.has(p.code.toLowerCase())))).digest('hex');
    if (currentRevision !== revision) return false;
    for (const p of plan.products) {
      const now = new Date().toISOString();
      putProduct({ ...p, createdAt: p.createdAt || now, updatedAt: now, updatedBy: sessionUser(req).username });
    }
    audit(sessionUser(req).username, 'CATALOG_IMPORTED', JSON.stringify({ created: summary.created, updated: summary.updated, codes: plan.rows.map(row => row.code) }));
    return true;
  });
  if (!saved) return res.status(409).json({ error: 'Catalog records changed during import. Preview the file again.' });
  res.json(summary);
});
products.post('/bulk', authenticated, (req: ApiRequest, res) => {
  const body = requestBody(req);
  const { ids, action, brands } = body || {};
  if (!Array.isArray(ids) || !ids.length || ids.length > 200 || ids.some(id => typeof id !== 'string') || new Set(ids).size !== ids.length ||
    typeof action !== 'string' || !['feature', 'unfeature', 'archive', 'restore', 'brands'].includes(action))
    return res.status(400).json({ error: 'Select 1–200 distinct products and a supported bulk action.' });
  if (action === 'brands' && (!Array.isArray(brands) || !brands.length || brands.length > 20 || brands.some((brand: unknown) => typeof brand !== 'string' || !brand.trim() || brand.length > 100)))
    return res.status(400).json({ error: 'Provide 1–20 manufacturer names.' });
  const records = ids.map((id: string) => product(id));
  const normalizedBrands = Array.isArray(brands) ? [...new Set(brands.filter((brand: unknown): brand is string => typeof brand === 'string').map(brand => brand.trim()))] : [];
  if (records.some((p, index) => !p || p.id !== ids[index])) return res.status(404).json({ error: 'A selected product no longer exists. Refresh the catalog.' });
  transaction(() => {
    for (const p of records) {
      if (!p) throw new Error('Selected product disappeared.');
      if (action === 'feature' || action === 'unfeature') p.featured = action === 'feature';
      if (action === 'archive' || action === 'restore') p.isArchived = action === 'archive';
      if (action === 'brands') p.brands = normalizedBrands;
      p.updatedAt = new Date().toISOString(); p.updatedBy = sessionUser(req).username; putProduct(p);
    }
    audit(sessionUser(req).username, 'CATALOG_BULK_' + action.toUpperCase(), ids.join(','));
  });
  res.json({ updated: records.length });
});
products.get('/', (req, res) => {
  const ps = allProducts(
    req.query.includeArchived === 'true' && !!getUser(req),
  );
  res.json({ products: ps, count: ps.length });
});
products.get('/:id', (req, res) => {
  const p = product(String(req.params.id));
  if (!p || (p.isArchived && !getUser(req)))
    return res.status(404).json({ error: 'Product not found.' });
  res.json({ product: p });
});
products.post('/', authenticated, (req: ApiRequest, res) => {
  const body = requestBody(req);
  const now = new Date().toISOString();
  const p = {
    ...body,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    updatedBy: sessionUser(req).username,
  };
  const result = readProductRecord(p);
  if (!result.product) return res.status(400).json({ error: result.errors.join(' ') });
  putProduct(result.product);
  audit(sessionUser(req).username, 'PRODUCT_CREATED', p.id);
  res.status(201).json({ product: product(p.id) });
});
products.put('/:id', authenticated, (req: ApiRequest, res) => {
  const body = requestBody(req);
  const old = product(req.params.id);
  if (!old) return res.status(404).json({ error: 'Product not found.' });
  const p = {
    ...old,
    ...body,
    id: old.id,
    createdAt: old.createdAt,
    updatedAt: new Date().toISOString(),
    updatedBy: sessionUser(req).username,
  };
  const result = readProductRecord(p);
  if (!result.product) return res.status(400).json({ error: result.errors.join(' ') });
  putProduct(result.product);
  audit(sessionUser(req).username, 'PRODUCT_UPDATED', p.id);
  res.json({ product: product(p.id) });
});
products.patch('/:id/archive', authenticated, (req: ApiRequest, res) => {
  const p = product(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found.' });
  p.isArchived = !p.isArchived;
  p.updatedAt = new Date().toISOString();
  p.updatedBy = sessionUser(req).username;
  putProduct(p);
  audit(
    sessionUser(req).username,
    p.isArchived ? 'PRODUCT_ARCHIVED' : 'PRODUCT_RESTORED',
    p.id,
  );
  res.json({ product: product(p.id) });
});
products.delete('/:id', authenticated, superadmin, (req: ApiRequest, res) => {
  const body = requestBody(req);
  const p = product(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found.' });
  if (body.confirm !== p.code || !p.isArchived)
    return res
      .status(400)
      .json({ error: 'Archive the product and confirm its exact code first.' });
  db.prepare('DELETE FROM products WHERE id=?').run(p.id);
  audit(sessionUser(req).username, 'PRODUCT_DELETED', p.id);
  res.json({ success: true });
});
