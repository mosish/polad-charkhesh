import { Router } from 'express';
import crypto from 'node:crypto';
import { allProducts, product, putProduct, db, audit } from './database';
import { authenticated, superadmin, getUser } from './security';
import { validateProduct } from './validation';
export const products = Router();
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
  res.status(201).json({ product: p });
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
  res.json({ product: p });
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
  res.json({ product: p });
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
