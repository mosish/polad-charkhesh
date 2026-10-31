import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogHubs, catalogHubForPath, hubPath, productBelongsToHub, productHub, publicPagePaths } from '../domain/catalog-hubs';
import { catalogHubGuides } from '../domain/catalog-hub-guides';
import { ballBearingExamples, ballBearingIntro } from '../domain/ball-bearing-navigation';
import { ballBearingLearning } from '../domain/ball-bearing-learning';
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
    assert.deepEqual([...new Set(links)].sort(), expected.map(product => '/product/' + product.slug).sort());
    const preview = metadataFor(route, fa, seoDefaults, COMPANY_INFO, undefined, siteExtras, products, 'preview=1');
    assert.equal(preview.robots, 'noindex,nofollow');
    assert.deepEqual(preview.structuredData['@graph'], []);
  }
  assert.deepEqual(auditPublishedSeo(snapshot).issues, []);
  assert.equal(auditPublishedSeo(snapshot).pages, products.length + 7);
});

void test('manufacturer identification needs a sole brand and an official source naming the complete designation', () => {
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
    const entity = data.structuredData['@graph'].find(item => item['@type'] === 'Thing');
    assert.ok(entity);
    assert.equal(entity?.manufacturer, undefined);
    assert.equal(entity?.brand, undefined);
  }
});

void test('product heading, semantic specification table and catalog description share the same exact record', () => {
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
    const entity = data.structuredData['@graph'].find(item => item['@type'] === 'Thing');
    assert.equal(entity?.identifier, skf.code);
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

void test('bearing examples exclude archived, unrelated and unaddressable records without changing product data', () => {
  const example = skf;
  const input = [
    { ...example, id: 'archived', code: '000', isArchived: true },
    { ...example, id: 'no-slug', code: '001', slug: undefined },
    { ...example, id: 'roller', code: '002', category: 'thrust' as const, schematicType: 'spherical-thrust' as const },
    { ...example, id: 'ambiguous', code: '003', brands: ['SKF', 'NSK'] },
    ...products,
  ];
  const before = JSON.stringify(input);
  const groups = ballBearingExamples(input);
  assert.equal(groups[0].products.length, 3);
  assert.ok(groups[0].products.includes(skf));
  assert.deepEqual(groups.map(group => group.type), ['deep-groove', 'angular-contact', 'self-aligning-ball', 'thrust']);
  for (const group of groups) {
    assert.ok(group.products.length <= 3);
    for (const product of group.products) {
      assert.ok(product.slug && !product.isArchived);
      assert.ok(products.includes(product));
      assert.equal(product.schematicType, group.type);
      assert.ok(documentedManufacturer(product));
    }
  }
  assert.equal(JSON.stringify(input), before);
  assert.ok(ballBearingExamples([]).every(group => group.products.length === 0));
});

void test('ball-bearing navigation is useful before JavaScript in both languages and keeps links canonical', () => {
  for (const fa of [false, true]) {
    const origin = 'https://poladcharkhesh.' + (fa ? 'ir' : 'com');
    const html = initialPublicHtml('/catalog/ball-bearings', fa, { ...snapshot, hostname: new URL(origin).hostname }, false);
    const copy = ballBearingIntro[fa ? 'fa' : 'en'];
    assert.ok(html.includes(escapeHtml(copy.title)));
    assert.ok(html.includes(escapeHtml(copy.contactText)));
    assert.ok(html.includes('href="' + COMPANY_INFO.primaryPhoneTel + '"'));
    for (const group of ballBearingExamples(products)) {
      assert.ok(html.includes(escapeHtml(group[fa ? 'fa' : 'en'].title)));
      for (const product of group.products) assert.ok(html.includes('href="' + origin + '/product/' + product.slug + '"'));
    }
    assert.ok(!html.includes('?lang='));
    assert.ok(!initialPublicHtml('/catalog/roller-bearings', fa, snapshot, false).includes(copy.title));
    const empty = initialPublicHtml('/catalog/ball-bearings', fa, { ...snapshot, products: [] }, false);
    assert.ok(empty.includes(escapeHtml(copy.empty)));
    assert.ok(!empty.includes('/product/'));
  }
});

void test('bearing learning content is visible before JavaScript with resolving in-page links in both languages', () => {
  for (const fa of [false, true]) {
    const language = fa ? 'fa' : 'en';
    const copy = ballBearingLearning[language];
    const html = initialPublicHtml('/catalog/ball-bearings', fa, snapshot, false);
    for (const value of [copy.definition, copy.difference, copy.dimensionsText, ...copy.questions.flatMap(item => [item.question, item.answer])]) assert.ok(html.includes(escapeHtml(value)));
    const fragmentLinks = [...html.matchAll(/href="#([^"]+)"/g)].map(match => match[1]);
    for (const id of fragmentLinks) assert.equal((html.match(new RegExp('id="' + id + '"', 'g')) || []).length, 1, id);
    for (const [symbol, label] of copy.dimensions) assert.ok(html.includes(`<th scope="row"><bdi dir="ltr">${symbol}</bdi></th><td>${label}</td>`));
    assert.ok(!initialPublicHtml('/catalog/roller-bearings', fa, snapshot, false).includes(copy.definition));
    const graph = metadataFor('/catalog/ball-bearings', fa, seoDefaults, COMPANY_INFO, undefined, siteExtras, products).structuredData['@graph'];
    assert.ok(!graph.some(item => ['FAQPage', 'Product', 'Offer', 'Review', 'AggregateRating'].includes(String(item['@type']))));
  }
});
