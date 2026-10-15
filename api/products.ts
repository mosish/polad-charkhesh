import { Router } from 'express';
import crypto from 'node:crypto';
import type { BearingProduct } from '../domain/product';
import { allProducts, product, putProduct, db, audit, transaction } from './database';
import { planCatalogImport } from './catalog-import';
import { planCatalogReviewPatch } from './catalog-review-patch';
import { authenticated, superadmin, getUser } from './security';
import { validateProduct } from './validation';
export const products = Router();
products.post('/import', authenticated, (req: any, res) => {
  const existing = allProducts(true);
  if (req.body?.reviewPatch !== undefined && req.body?.products !== undefined)
    return res.status(400).json({ error: 'Provide products or reviewPatch, not both.' });
  const review = req.body?.reviewPatch !== undefined ? planCatalogReviewPatch(req.body.reviewPatch, existing) : null;
  if (review?.errors.length) return res.status(409).json({ error: review.errors.join('\n') });
  const plan = planCatalogImport(review?.products ?? req.body?.products, existing);
  if (plan.errors.length) return res.status(400).json({ error: plan.errors.join('\n') });
  if (review) {
    // A reviewed deletion must not be restored by the ordinary merge importer.
    plan.products = review.products;
    plan.rows = review.products.map(p => {
      const old = existing.find(x => x.id === p.id)!;
      return { code: p.code, action: 'update' as const, changes: [...new Set([...Object.keys(old), ...Object.keys(p)])]
        .filter(key => JSON.stringify(old[key]) !== JSON.stringify(p[key as keyof BearingProduct]))
        .map(field => ({ field, before: old[field] ?? null, after: p[field as keyof BearingProduct] ?? null })) };
    });
  }
  const codes = new Set(plan.rows.map(row => row.code.toLowerCase()));
  const revision = crypto.createHash('sha256').update(JSON.stringify(existing.filter(p => codes.has(p.code.toLowerCase())))).digest('hex');
  const summary = { revision, rows: plan.rows, created: plan.rows.filter(row => row.action === 'create').length,
    updated: plan.rows.filter(row => row.action === 'update').length };
  if (req.body.preview === true) return res.json(summary);
  if (req.body.confirm !== 'IMPORT') return res.status(400).json({ error: 'Preview the file and confirm IMPORT.' });
  if (req.body.revision !== revision) return res.status(409).json({ error: 'Catalog records changed after the preview. Preview the file again.' });
  const saved = transaction(() => {
    const currentRevision = crypto.createHash('sha256').update(JSON.stringify(allProducts(true).filter(p => codes.has(p.code.toLowerCase())))).digest('hex');
    if (currentRevision !== revision) return false;
    for (const p of plan.products) {
      const now = new Date().toISOString();
      putProduct({ ...p, createdAt: p.createdAt || now, updatedAt: now, updatedBy: req.user.username });
    }
    audit(req.user.username, 'CATALOG_IMPORTED', JSON.stringify({ created: summary.created, updated: summary.updated, codes: plan.rows.map(row => row.code) }));
    return true;
  });
  if (!saved) return res.status(409).json({ error: 'Catalog records changed during import. Preview the file again.' });
  res.json(summary);
});
products.post('/bulk', authenticated, (req: any, res) => {
  const { ids, action, brands } = req.body || {};
  if (!Array.isArray(ids) || !ids.length || ids.length > 200 || ids.some(id => typeof id !== 'string') || new Set(ids).size !== ids.length ||
    !['feature', 'unfeature', 'archive', 'restore', 'brands'].includes(action))
    return res.status(400).json({ error: 'Select 1–200 distinct products and a supported bulk action.' });
  if (action === 'brands' && (!Array.isArray(brands) || !brands.length || brands.length > 20 || brands.some((brand: unknown) => typeof brand !== 'string' || !brand.trim() || brand.length > 100)))
    return res.status(400).json({ error: 'Provide 1–20 manufacturer names.' });
  const records = ids.map((id: string) => product(id));
  if (records.some((p, index) => !p || p.id !== ids[index])) return res.status(404).json({ error: 'A selected product no longer exists. Refresh the catalog.' });
  transaction(() => {
    for (const p of records) {
      if (action === 'feature' || action === 'unfeature') p.featured = action === 'feature';
      if (action === 'archive' || action === 'restore') p.isArchived = action === 'archive';
      if (action === 'brands') p.brands = [...new Set(brands.map((brand: string) => brand.trim()))];
      p.updatedAt = new Date().toISOString(); p.updatedBy = req.user.username; putProduct(p);
    }
    audit(req.user.username, 'CATALOG_BULK_' + action.toUpperCase(), ids.join(','));
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
products.post('/', authenticated, (req: any, res) => {
  const now = new Date().toISOString();
  const p = {
    ...req.body,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    updatedBy: req.user.username,
  };
  const errors = validateProduct(p);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });
  putProduct(p);
  audit(req.user.username, 'PRODUCT_CREATED', p.id);
  res.status(201).json({ product: product(p.id) });
});
products.put('/:id', authenticated, (req: any, res) => {
  const old = product(req.params.id);
  if (!old) return res.status(404).json({ error: 'Product not found.' });
  const p = {
    ...old,
    ...req.body,
    id: old.id,
    createdAt: old.createdAt,
    updatedAt: new Date().toISOString(),
    updatedBy: req.user.username,
  };
  const errors = validateProduct(p);
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });
  putProduct(p);
  audit(req.user.username, 'PRODUCT_UPDATED', p.id);
  res.json({ product: product(p.id) });
});
products.patch('/:id/archive', authenticated, (req: any, res) => {
  const p = product(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found.' });
  p.isArchived = !p.isArchived;
  p.updatedAt = new Date().toISOString();
  p.updatedBy = req.user.username;
  putProduct(p);
  audit(
    req.user.username,
    p.isArchived ? 'PRODUCT_ARCHIVED' : 'PRODUCT_RESTORED',
    p.id,
  );
  res.json({ product: product(p.id) });
});
products.delete('/:id', authenticated, superadmin, (req: any, res) => {
  const p = product(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found.' });
  if (req.body.confirm !== p.code || !p.isArchived)
    return res
      .status(400)
      .json({ error: 'Archive the product and confirm its exact code first.' });
  db.prepare('DELETE FROM products WHERE id=?').run(p.id);
  audit(req.user.username, 'PRODUCT_DELETED', p.id);
  res.json({ success: true });
});
