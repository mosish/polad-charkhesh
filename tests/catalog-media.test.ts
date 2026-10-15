import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { planCatalogReviewPatch, type CatalogReviewPatch } from '../api/catalog-review-patch';
import type { BearingProduct } from '../domain/product';
import { supplierMedia } from '../lib/supplier-media';

const read = (file: string) => JSON.parse(readFileSync(`docs/catalog-review/${file}`, 'utf8'));
const baseline: BearingProduct[] = read('baseline.json').products;
const patch: CatalogReviewPatch = read('media.patch.json');
const apply = (p: CatalogReviewPatch, products: BearingProduct[]) => {
  const result = planCatalogReviewPatch(p, products);
  assert.deepEqual(result.errors, []);
  const changes = new Map(result.products.map(p => [p.id, p]));
  return products.map(p => changes.get(p.id) || p);
};

void test('media inventory covers every product and the patch changes images only', () => {
  const ledger = read('media/ledger.json');
  assert.equal(ledger.records.length, baseline.length);
  assert.deepEqual(new Set(ledger.records.map((r: { productId: string }) => r.productId)), new Set(baseline.map(p => p.id)));
  const next = apply(patch, baseline);
  assert.equal(patch.rows.length, ledger.counts.replacements);
  for (let i = 0; i < baseline.length; i++) {
    assert.deepEqual({ ...next[i], imageUrl: baseline[i].imageUrl }, { ...baseline[i], imageUrl: baseline[i].imageUrl });
  }
  for (const r of ledger.records) {
    if (r.status !== 'downloaded') { assert.equal(next.find(p => p.id === r.productId)!.imageUrl, baseline.find(p => p.id === r.productId)!.imageUrl); continue; }
    assert.equal(createHash('sha256').update(readFileSync(`public-site${r.localUrl}`)).digest('hex'), r.sha256);
    const display = supplierMedia(r.localUrl)!;
    assert.ok(display?.altEn && display.altFa && display.sourceUrl);
    assert.equal(display.example, r.example);
    if (r.example) assert.ok(display.labelEn.includes(r.target) && display.labelFa.includes(r.target));
    if (/illustration|render|cutaway/.test(`${r.mediaType || ''} ${r.imageKind || ''}`)) assert.equal(display.illustration, true);
  }
  assert.equal(supplierMedia('/uploads/owner-image.jpg'), undefined);
});

void test('bulk media and engineering patches commute, including the earlier single-image patch', () => {
  const technical = read('review.patch.json');
  assert.deepEqual(apply(patch, apply(technical, baseline)), apply(technical, apply(patch, baseline)));
  const first = { ...patch, rows: patch.rows.filter(r => r.id === 'skf-6305-2rz') };
  assert.deepEqual(apply(read('media-additions.patch.json'), apply(first, baseline)), apply(patch, baseline));
});

void test('a concurrent owner image or gallery change rejects the entire media import', () => {
  const id = patch.rows[0].id;
  for (const edit of [{ imageUrl: '/uploads/new-owner-image.jpg' }, { images: ['/uploads/new-gallery.jpg'] }]) {
    const result = planCatalogReviewPatch(patch, baseline.map(p => p.id === id ? { ...p, ...edit } : p));
    assert.ok(result.errors.length);
    assert.equal(result.products.length, 0);
  }
});
