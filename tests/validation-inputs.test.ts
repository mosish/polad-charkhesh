import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bearingProducts } from '../domain/catalog';
import { seoDefaults } from '../domain/seo';
import { siteExtras } from '../domain/site-content';
import { validateProduct, validateSettings, safeObject } from '../api/validation';
import { validateContent, contentUrl } from '../api/content-validation';

void test('product boundary accepts existing catalog and rejects malformed JSON fields without throwing', () => {
  for (const product of bearingProducts) assert.deepEqual(validateProduct(product), []);
  for (const value of [null, false, 42, 'product', [], {}, { toString: null }]) {
    assert.ok(validateProduct(value).length);
  }
  for (const field of ['slug', 'category', 'schematicType', 'd', 'D', 'B', 'crKn', 'brands', 'technicalSources']) {
    assert.ok(validateProduct({ ...bearingProducts[0], [field]: { toString: null } }).length, field);
  }
  assert.ok(validateProduct({ ...bearingProducts[0], calculationProfile: { reviewedBy: 'visitor' } }).length);
  assert.equal(safeObject(JSON.parse('{"nested":{"__proto__":{}}}')), false);
});

void test('SEO page containers and values fail validation rather than using coerced primitives', () => {
  assert.deepEqual(validateSettings('seo', seoDefaults), []);
  for (const pages of [null, 2, 'bad', [], { home: null }, { home: [] }, { home: 'text' }]) {
    assert.ok(validateSettings('seo', { ...seoDefaults, pages }).length);
  }
  assert.ok(validateSettings('seo', { ...seoDefaults, domainEn: { toString: null } }).length);
});

void test('website content validates nested unknown values and preserves valid bilingual content', () => {
  const content: Record<string, unknown> = {
    ...structuredClone(siteExtras),
    ...Object.fromEntries(['hero', 'about', 'why', 'industries', 'engineering', 'contact', 'footer'].map((key) => [key, { titleEn: 'Example', titleFa: 'نمونه' }])),
  };
  assert.deepEqual(validateContent(content), []);
  for (const key of ['brand', 'media', 'links', 'navigation', 'layout', 'cards', 'copy']) {
    for (const value of [null, false, 5, [], 'invalid']) assert.ok(validateContent({ ...content, [key]: value }).length, key);
  }
  for (const value of [null, false, {}, [], 'javascript:alert(1)', '//external.example/image', '/bad\\path']) {
    assert.equal(contentUrl(value), false);
  }
  assert.equal(contentUrl('/brand/logo.png'), true);
  assert.equal(contentUrl('https://example.com/image.png'), true);
});
