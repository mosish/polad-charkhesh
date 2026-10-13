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
import { breadcrumbsFor } from '../domain/breadcrumbs';
import { llmsText } from '../domain/llms';
import { auditPublishedSeo } from '../lib/seo-audit';
const p = bearingProducts[0];
const content = {
  ...siteExtras,
  hero: {
    titleEn: 'Published hero title',
    titleFa: 'عنوان منتشرشده صفحه اصلی',
    descriptionEn: 'Published hero description',
  },
  engineering: { titleEn: 'Make the numbers work' },
  contact: { titleEn: 'Contact the team' },
};

void test('bilingual canonicals, page overrides and robots remain consistent', () => {
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

void test('local business and breadcrumbs use published identity with no invented claims', () => {
  for (const fa of [false, true]) {
    for (const route of ['/catalog', '/engineering', '/product/' + p.slug]) {
      const product = route.startsWith('/product/') ? p : undefined;
      const metadata = metadataFor(route, fa, seoDefaults, COMPANY_INFO, product);
      const business = metadata.structuredData['@graph'].find(item => item['@type'] === 'LocalBusiness');
      assert.ok(business);
      assert.equal(business.name, COMPANY_INFO[fa ? 'nameFa' : 'nameEn']);
      assert.equal((business.address as { streetAddress: string }).streetAddress, COMPANY_INFO[fa ? 'addressFa' : 'addressEn']);
      for (const key of ['geo', 'aggregateRating', 'review', 'priceRange']) assert.equal(business[key], undefined);
      const crumb = metadata.structuredData['@graph'].find(item => item['@type'] === 'BreadcrumbList');
      assert.ok(crumb);
      const expected = breadcrumbsFor(route, fa, product);
      assert.deepEqual((crumb.itemListElement as Array<{ name: string }>).map(item => item.name), expected.map(item => item.label));
      const html = initialPublicHtml(route, fa, { company: COMPANY_INFO, content, products: [p] }, false, product);
      assert.match(html, /<nav class="breadcrumbs"/);
      assert.match(html, /aria-current="page"/);
    }
  }
});

void test('llms guide follows configured domains and published contact edits', () => {
  const company = { ...COMPANY_INFO, nameEn: '[Owner]\n# injection', email: 'updated@company.test' };
  const result = llmsText({ ...seoDefaults, domainEn: 'https://company.test', domainFa: 'https://company.ir' }, company, false);
  assert.ok(result.startsWith('# \\[Owner\\] \\# injection\n'));
  assert.ok(result.includes('https://company.test/catalog'));
  assert.ok(result.includes('https://company.ir/'));
  assert.ok(result.includes(company.email));
  assert.ok(!result.includes('/admin'));
  assert.match(result, /not an online shop/);
  assert.match(llmsText(seoDefaults, COMPANY_INFO, true), /کاتالوگ محصولات/);
});

void test('published SEO audit catches duplicate metadata and unfinished copy without writing records', () => {
  const snapshot = { company: COMPANY_INFO, seo: seoDefaults, content, products: [p] };
  const before = JSON.stringify(snapshot);
  assert.equal(auditPublishedSeo(snapshot).issues.length, 0);
  assert.equal(JSON.stringify(snapshot), before);
  const duplicate = { ...p, id: 'duplicate', slug: 'duplicate', descriptionEn: 'Lorem ipsum' };
  const findings = auditPublishedSeo({ ...snapshot, products: [p, duplicate] }).issues;
  assert.ok(findings.some(item => item.issue.startsWith('Duplicate title')));
  assert.ok(findings.some(item => item.issue === 'Unfinished public copy'));
  const hiddenHero = initialPublicHtml('/', false, { ...snapshot, content: { ...content, layout: { hidden: ['hero'] } } }, false);
  assert.equal((hiddenHero.match(/<h1>/g) || []).length, 1);
  assert.ok(!hiddenHero.includes(content.hero.titleEn));
});

void test('SEO defaults preserve owner edits and technical values without inventing commerce', () => {
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

void test('initial HTML exposes published product links and specs safely without hidden sections', () => {
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
