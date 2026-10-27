import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogHubs, catalogHubForPath, hubPath, productBelongsToHub, productHub, publicPagePaths } from '../domain/catalog-hubs';
import { catalogHubGuides } from '../domain/catalog-hub-guides';
import { documentedManufacturer, productHeading, productSpecifications } from '../domain/product-presentation';
import { bearingProducts } from '../domain/catalog';
import { skfCatalogAdditions } from '../domain/skf-catalog-additions';
import { metadataFor, seoDefaults, escapeHtml } from '../domain/seo';
import { COMPANY_INFO } from '../domain/company';
import { siteExtras } from '../domain/site-content';
import { initialPublicHtml } from '../api/seo-html';
import { auditPublishedSeo } from '../lib/seo-audit';
import { breadcrumbsFor } from '../domain/breadcrumbs';
import { technicalTextParts } from '../domain/technical-text';

const products = bearingProducts;
const skf = skfCatalogAdditions[0];
const snapshot = { products, company: COMPANY_INFO, content: { ...siteExtras, hero: { titleEn: 'Industrial component identification', titleFa: 'شناسایی قطعات صنعتی' } }, seo: seoDefaults };

void test('four bilingual category hubs have substantial distinct guides and clean exact routes', () => {
  assert.deepEqual(catalogHubs.map(hubPath), ['/catalog/ball-bearings', '/catalog/roller-bearings', '/catalog/pillow-blocks', '/catalog/oil-seals']);
  assert.equal(publicPagePaths().length, 7);
  const titles = new Set<string>();
  for (const hub of catalogHubs) {
    assert.equal(catalogHubForPath(hubPath(hub)), hub);
    assert.ok(hub.references.every(reference => new URL(reference.url).protocol === 'https:'));
    for (const language of ['en', 'fa'] as const) {
      const sections = catalogHubGuides[hub.slug][language];
      const words = sections.map(section => section.text).join(' ').split(/\s+/).length;
      assert.ok(words >= 300 && words <= 500, `${hub.slug}/${language}: ${words} words`);
      assert.ok(!titles.has(hub[language].title));
      titles.add(hub[language].title);
    }
  }
  for (const path of ['/catalog/unknown', '/catalog/ball-bearings/child', '/catalogue/ball-bearings']) {
    assert.equal(catalogHubForPath(path), undefined);
    assert.equal(metadataFor(path, true, seoDefaults, COMPANY_INFO).missing, true);
  }
});

void test('hubs distinguish thrust balls, spherical thrust rollers, housings and seals without changing catalog data', () => {
  const cases = [
    ['ball', 'angular-contact', 'ball-bearings'],
    ['thrust', 'thrust', 'ball-bearings'],
    ['thrust', 'spherical-thrust', 'roller-bearings'],
    ['cylindrical', 'needle', 'roller-bearings'],
    ['housing', 'pillow-block', 'pillow-blocks'],
    ['seal', 'oil-seal', 'oil-seals'],
    ['lubricant', 'oil-seal', undefined],
  ] as const;
  for (const [category, schematicType, expected] of cases) {
    assert.equal(productHub({ category, schematicType })?.slug, expected);
    assert.equal(productHub({ category, schematicType, isArchived: true }), undefined);
  }
  const before = JSON.stringify(products);
  for (const product of products) {
    const memberships = catalogHubs.filter(hub => productBelongsToHub(product, hub));
    assert.equal(memberships.length, product.category === 'lubricant' ? 0 : 1, product.code);
  }
  assert.equal(JSON.stringify(products), before);
});

void test('category metadata, source HTML and JSON-LD describe only their own published products', () => {
  for (const hub of catalogHubs) for (const fa of [false, true]) {
    const route = hubPath(hub);
    const metadata = metadataFor(route + '/?q=6204#catalog', fa, seoDefaults, COMPANY_INFO, undefined, siteExtras, products);
    assert.equal(metadata.missing, false);
    assert.equal(metadata.canonical, `https://poladcharkhesh.${fa ? 'ir' : 'com'}${route}`);
    assert.equal(metadata.alternates.fa, 'https://poladcharkhesh.ir' + route);
    const expected = products.filter(product => productBelongsToHub(product, hub));
    assert.ok(expected.length > 0);
    const list = metadata.structuredData['@graph'].find(item => item['@type'] === 'ItemList');
    assert.ok(list);
    assert.deepEqual((list.itemListElement as Array<{ url: string }>).map(item => new URL(item.url).pathname), expected.map(product => '/product/' + product.slug));
    assert.equal(metadata.structuredData['@graph'].find(item => item['@type'] === 'CollectionPage')?.name, metadata.title);
    const html = initialPublicHtml(route, fa, snapshot, false);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    for (const section of catalogHubGuides[hub.slug][fa ? 'fa' : 'en']) assert.ok(html.replace(/<\/?bdi[^>]*>/g, '').includes(escapeHtml(section.text)));
    const links = [...html.matchAll(/href="(\/product\/[^"?]+)\?/g)].map(match => match[1]);
    assert.deepEqual(links, expected.map(product => '/product/' + product.slug));
    const preview = metadataFor(route, fa, seoDefaults, COMPANY_INFO, undefined, siteExtras, products, 'preview=1');
    assert.equal(preview.robots, 'noindex,nofollow');
    assert.deepEqual(preview.structuredData['@graph'], []);
  }
  assert.deepEqual(auditPublishedSeo(snapshot).issues, []);
  assert.equal(auditPublishedSeo(snapshot).pages, products.length + 7);
});

void test('manufacturer markup needs a sole brand and an official source naming the complete designation', () => {
  assert.equal(documentedManufacturer(skf), 'SKF');
  assert.equal(productHeading(skf, true), skf.nameFa);
  const noBrandInName = { ...skf, nameFa: 'بلبرینگ شیار عمیق ' + skf.code };
  assert.equal(productHeading(noBrandInName, true), noBrandInName.nameFa + ' برند SKF');
  const source = skf.technicalSources![0];
  for (const candidate of [
    { ...skf, brands: ['SKF', 'NSK'] },
    { ...skf, brands: [] },
    { ...skf, code: skf.code + ' / C3' },
    { ...skf, technicalSources: [] },
    { ...skf, technicalSources: [{ ...source, sourceType: 'engineering_manual' as const }] },
    { ...skf, technicalSources: [{ ...source, reference: 'General ball bearing guide' }] },
    { ...skf, technicalSources: [{ ...source, reference: 'Designation ' + skf.code + '-C3' }] },
    { ...skf, technicalSources: [{ ...source, manufacturer: 'NSK' }] },
    { ...skf, technicalSources: [{ ...source, url: 'javascript:alert(1)' }] },
  ]) {
    assert.equal(documentedManufacturer(candidate), undefined);
    const data = metadataFor('/product/' + candidate.slug, false, seoDefaults, COMPANY_INFO, candidate);
    const entity = data.structuredData['@graph'].find(item => item['@type'] === 'Product');
    assert.equal(entity?.manufacturer, undefined);
    assert.equal(entity?.brand, undefined);
  }
});

void test('product heading, semantic specification table and model schema share the same exact record', () => {
  const before = JSON.stringify(skf);
  const rows = productSpecifications(skf, false);
  assert.equal(rows.find(row => row.key === 'd')?.value, '15 mm');
  assert.equal(rows.find(row => row.key === 'speedReferenceRpm')?.value, '50000 rpm');
  assert.equal(rows.find(row => row.key === 'speedLimitingRpm')?.value, '26000 rpm');
  assert.ok(!rows.some(row => row.key === 'speedGreaseRpm'));
  const unknown = productSpecifications({ ...skf, speedLimitingRpm: undefined, crKn: 0 }, true);
  assert.equal(unknown.find(row => row.key === 'crKn')?.value, '—');
  assert.equal(unknown.find(row => row.key === 'speedLimitingRpm')?.quantity, undefined);
  for (const fa of [false, true]) {
    const html = initialPublicHtml('/product/' + skf.slug, fa, snapshot, false, skf);
    assert.ok(html.replace(/<\/?bdi[^>]*>/g, '').includes('<h1>' + escapeHtml(productHeading(skf, fa)) + '</h1>'));
    assert.ok(html.includes('<table class="product-spec-table">'));
    assert.ok(html.includes('<th scope="row">'));
    assert.ok(html.includes('26000 rpm'));
    const data = metadataFor('/product/' + skf.slug, fa, seoDefaults, COMPANY_INFO, skf);
    const entity = data.structuredData['@graph'].find(item => item['@type'] === 'Product');
    assert.equal(entity?.model, skf.code);
    assert.deepEqual(entity?.manufacturer, { '@type': 'Organization', name: 'SKF' });
    assert.equal(entity?.offers, undefined);
    assert.equal(entity?.name, productHeading(skf, fa));
    assert.deepEqual(breadcrumbsFor('/product/' + skf.slug, fa, skf).map(item => item.path), ['/', '/catalog', '/catalog/ball-bearings', '/product/' + skf.slug]);
  }
  assert.equal(JSON.stringify(skf), before);
});

void test('RTL technical prose isolates complete codes and standards without rewriting text', () => {
  const text = 'بلبرینگ 6204-2RS و استاندارد ISO 281 برای SKF';
  const parts = technicalTextParts(text);
  assert.equal(parts.map(part => part.text).join(''), text);
  assert.deepEqual(parts.filter(part => part.ltr).map(part => part.text), ['6204-2RS', 'ISO 281', 'SKF']);
  assert.ok(initialPublicHtml('/catalog/ball-bearings', true, snapshot, false).includes('<bdi dir="ltr">6204-2RS</bdi>'));
});
