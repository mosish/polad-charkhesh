import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  seoDefaults,
  upgradeSeo,
  fillProductSeo,
  metadataFor,
  metadataHead,
  jsonForHtml,
  languageFor,
} from '../domain/seo';
import { initialPublicHtml } from '../api/seo-html';
import { bearingProducts } from '../domain/catalog';
import { COMPANY_INFO } from '../domain/company';
import { siteExtras } from '../domain/site-content';
const p = bearingProducts[0];
const content = {
  ...siteExtras,
  hero: {
    titleEn: 'Published hero title',
    descriptionEn: 'Published hero description',
  },
  engineering: { titleEn: 'Make the numbers work' },
  contact: { titleEn: 'Contact the team' },
};

test('bilingual canonicals, page overrides and robots remain consistent', () => {
  const en = metadataFor(
    '/catalog/?q=6204#catalog',
    false,
    seoDefaults,
    COMPANY_INFO,
    undefined,
    content,
    [p],
  );
  const fa = metadataFor(
    '/catalog/',
    true,
    seoDefaults,
    COMPANY_INFO,
    undefined,
    content,
    [p],
  );
  assert.equal(en.canonical, 'https://poladcharkhesh.com/catalog');
  assert.equal(fa.canonical, 'https://poladcharkhesh.ir/catalog');
  assert.deepEqual(en.alternates, fa.alternates);
  assert.equal(en.alternates['x-default'], en.canonical);
  assert.notEqual(
    en.title,
    metadataFor('/', false, seoDefaults, COMPANY_INFO).title,
  );
  assert.notEqual(
    en.description,
    metadataFor('/engineering', false, seoDefaults, COMPANY_INFO).description,
  );
  for (const [route, product, search] of [
    ['/admin/', undefined, ''],
    ['/missing', undefined, ''],
    ['/product/removed', { ...p, isArchived: true }, ''],
    ['/', undefined, 'preview=1'],
  ] as const) {
    const data = metadataFor(
      route,
      false,
      seoDefaults,
      COMPANY_INFO,
      product,
      content,
      [p],
      search,
    );
    assert.equal(data.robots, 'noindex,nofollow');
    assert.deepEqual(data.alternates, {});
    assert.deepEqual(data.structuredData['@graph'], []);
  }
  assert.equal(languageFor('poladcharkhesh.ir'), true);
  assert.equal(languageFor('poladcharkhesh.com', 'lang=fa'), true);
  assert.equal(languageFor('poladcharkhesh.ir', 'lang=en'), false);
});

test('SEO defaults preserve owner edits and technical values without inventing commerce', () => {
  const custom = {
    ...p,
    metaTitleEn: 'Owner title',
    metaDescriptionFa: 'توضیح مدیر',
    keywords: ['owner keyword'],
  };
  const enriched = fillProductSeo(custom);
  assert.equal(enriched.metaTitleEn, custom.metaTitleEn);
  assert.equal(enriched.metaDescriptionFa, custom.metaDescriptionFa);
  assert.deepEqual(enriched.keywords, custom.keywords);
  assert.equal(enriched.crKn, p.crKn);
  assert.equal(enriched.imageUrl, p.imageUrl);
  assert.ok(enriched.metaDescriptionEn);
  assert.match(enriched.metaDescriptionEn, /20 × 47 × 14 mm/);
  assert.equal(
    upgradeSeo({ ...seoDefaults, titleEn: 'Custom company title' }).titleEn,
    'Custom company title',
  );
  const data = metadataFor(
    '/product/' + p.slug,
    false,
    seoDefaults,
    COMPANY_INFO,
    enriched,
    content,
  );
  const product = data.structuredData['@graph'].find(
    (item) => item['@type'] === 'Product',
  );
  if (!product) throw new Error('Product schema is missing');
  assert.equal(product.sku, p.code);
  assert.equal(
    product.image,
    undefined,
    'Family illustrations cannot be represented as exact product photos',
  );
  for (const key of ['offers', 'aggregateRating', 'review', 'brand', 'mpn'])
    assert.equal(product[key], undefined);
  assert.equal(
    (product.additionalProperty as Array<{ name: string; value: number }>).find(
      (item) => item.name === 'Dynamic load rating',
    )?.value,
    p.crKn,
  );
  assert.equal(data.title, 'Owner title');
  assert.equal(
    data.structuredData['@graph'].filter(
      (item) => item['@type'] === 'BreadcrumbList',
    ).length,
    1,
  );
});

test('initial HTML exposes published product links and specs safely without hidden sections', () => {
  const hidden = {
    ...content,
    layout: { ...content.layout, hidden: ['hero'] },
  };
  const home = initialPublicHtml(
    '/',
    false,
    { company: COMPANY_INFO, content: hidden, products: [p] },
    false,
  );
  assert.ok(!home.includes('Published hero title'));
  assert.match(home, /href="\/product\/6204-2rs\?lang=en"/);
  const product = initialPublicHtml(
    '/product/' + p.slug,
    false,
    { company: COMPANY_INFO, content, products: [p] },
    false,
    p,
  );
  assert.match(product, /<h1>.*6204/s);
  assert.match(product, /Dynamic load rating/);
  assert.match(product, /Family reference/);
  assert.equal(
    initialPublicHtml(
      '/admin',
      false,
      { company: COMPANY_INFO, content, products: [p] },
      false,
    ),
    '',
  );
  const malicious = {
    ...p,
    nameEn: '</script><img src=x onerror=alert(1)>',
    descriptionEn: '<script>attack</script>',
    pdfUrl: 'javascript:alert(1)',
    metaTitleEn: '<script>attack</script>',
  };
  const rendered = initialPublicHtml(
    '/product/' + p.slug,
    false,
    { company: COMPANY_INFO, content, products: [p] },
    false,
    malicious,
  );
  assert.ok(!rendered.includes('<script>attack'));
  assert.ok(!rendered.includes('href="javascript:'));
  const unsafeCompany = initialPublicHtml(
    '/',
    false,
    {
      company: { ...COMPANY_INFO, primaryPhoneTel: 'javascript:alert(1)' },
      content,
      products: [p],
    },
    false,
  );
  assert.ok(!unsafeCompany.includes('href="javascript:'));
  const head = metadataHead(
    metadataFor(
      '/product/' + p.slug,
      false,
      seoDefaults,
      COMPANY_INFO,
      malicious,
    ),
  );
  const json = head.match(/<script[^>]*>(.*?)<\/script>/s)![1];
  assert.ok(!json.includes('</script>'));
  assert.ok(JSON.parse(json)['@graph'].length);
  assert.equal(
    JSON.parse(jsonForHtml({ name: '</script> فارسی' })).name,
    '</script> فارسی',
  );
});
