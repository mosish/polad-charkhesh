import type { BearingProduct } from './product';
import type { CompanyContactInfo } from './company';
import { mediaFor } from '../lib/media';

export const seoDefaults = {
  titleEn: 'Polad Charkhesh | Industrial Bearings & Engineering',
  titleFa: 'پولاد چرخش | بیرینگ صنعتی و مشاوره مهندسی',
  descriptionEn:
    'Explore industrial bearings, seals and housings with technical specifications, product documents, 3D models and bearing engineering tools from Polad Charkhesh.',
  descriptionFa:
    'کاتالوگ بیرینگ صنعتی، آب‌بند و محفظه بیرینگ پولاد چرخش؛ مشخصات فنی، مستندات محصول، مدل سه‌بعدی و ابزارهای محاسبات مهندسی بیرینگ.',
  domainEn: 'https://poladcharkhesh.com',
  domainFa: 'https://poladcharkhesh.ir',
  verification: '',
  keywords:
    'industrial bearings, bearing specifications, بلبرینگ, رولربیرینگ, بیرینگ صنعتی',
  ogImage: '/brand/social-preview.png',
  pages: {
    catalog: {
      titleEn: 'Bearing Catalog & Technical Specifications | Polad Charkhesh',
      titleFa: 'کاتالوگ بیرینگ و مشخصات فنی | پولاد چرخش',
      descriptionEn:
        'Find bearings, seals and housings by designation, family and dimensions. Explore specifications, available documents and interactive product views.',
      descriptionFa:
        'جستجوی بیرینگ، آب‌بند و محفظه بر اساس کد، خانواده و ابعاد؛ مشاهده مشخصات فنی، مستندات موجود و نمایش تعاملی محصول.',
    },
    engineering: {
      titleEn: 'Bearing Life & Load Engineering Tools | Polad Charkhesh',
      titleFa: 'ابزار محاسبه عمر و بار بیرینگ | پولاد چرخش',
      descriptionEn:
        'Explore bearing life, equivalent load and shaft fit reference tools using catalog components. Review calculation inputs, assumptions and engineering results.',
      descriptionFa:
        'ابزارهای مرجع عمر بیرینگ، بار معادل و انطباق شفت با انتخاب محصول از کاتالوگ؛ بررسی ورودی‌ها، فرضیات و نتایج محاسبات مهندسی.',
    },
  },
};
export type SeoSettings = typeof seoDefaults;
export type SeoCopy = Partial<
  Record<'titleEn' | 'titleFa' | 'descriptionEn' | 'descriptionFa', string>
>;
export interface PublishedSeoContent {
  brand?: { logoUrl?: string };
  media?: { ballUrl?: string; taperedUrl?: string };
  hero?: SeoCopy;
  engineering?: SeoCopy;
  contact?: SeoCopy;
  about?: SeoCopy;
  why?: SeoCopy;
  industries?: SeoCopy;
  support?: SeoCopy;
  capabilities?: SeoCopy;
  footer?: SeoCopy;
  cards?: Record<string, SeoCopy[]>;
  layout?: {
    order?: string[];
    hidden?: string[];
    custom?: Array<SeoCopy & { id: string; enabled?: boolean }>;
  };
}
/** Add new fields and fill blanks without replacing an owner's SEO overrides. */
export function upgradeSeo(value: unknown = {}): SeoSettings {
  const saved: Record<string, unknown> =
    value && typeof value === 'object' && !Array.isArray(value)
      ? { ...value }
      : {};
  // Replace only the scaffold's known default copy, never a custom description.
  if (
    saved.descriptionEn ===
    'Industrial bearing identification, technical product data and engineering consultation.'
  )
    saved.descriptionEn = seoDefaults.descriptionEn;
  if (
    saved.descriptionFa ===
    'شناسایی و تأمین بیرینگ صنعتی، کاتالوگ فنی و مشاوره مهندسی.'
  )
    saved.descriptionFa = seoDefaults.descriptionFa;
  if (saved.keywords === 'bearings, industrial engineering')
    saved.keywords = seoDefaults.keywords;
  const merge = (
    current: unknown,
    defaults: Record<string, unknown>,
  ): Record<string, unknown> => {
    const values =
      current && typeof current === 'object' && !Array.isArray(current)
        ? (current as Record<string, unknown>)
        : {};
    return Object.fromEntries(
      Object.entries(defaults).map(([k, v]) => [
        k,
        v && typeof v === 'object'
          ? merge(values[k], v as Record<string, unknown>)
          : typeof values[k] === 'string' && values[k].trim()
            ? values[k]
            : v,
      ]),
    );
  };
  return { ...saved, ...merge(saved, seoDefaults) } as SeoSettings;
}
const tidy = (v: unknown) =>
  typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '';
export function productSeo(p: BearingProduct, fa: boolean) {
  const name = tidy(p[fa ? 'nameFa' : 'nameEn']) || p.code;
  const title = `${name.includes(p.code) ? name : p.code + ' ' + name} | ${fa ? 'پولاد چرخش' : 'Polad Charkhesh'}`;
  const dimensions = [p.d, p.D, p.B].every((v) => Number.isFinite(v) && v > 0)
    ? `${p.d} × ${p.D} × ${p.B} ${fa ? 'میلی‌متر' : 'mm'}`
    : '';
  const description = fa
    ? `${name}${dimensions ? '؛ ابعاد ' + dimensions : ''}. مشخصات فنی، مستندات موجود و نمایش محصول در کاتالوگ پولاد چرخش.`
    : `${name}${dimensions ? ', ' + dimensions : ''}. Explore technical specifications, available documents and product views in the Polad Charkhesh catalog.`;
  return {
    title: tidy(p[fa ? 'metaTitleFa' : 'metaTitleEn']) || title,
    description:
      tidy(p[fa ? 'metaDescriptionFa' : 'metaDescriptionEn']) || description,
  };
}
export function fillProductSeo(p: BearingProduct): BearingProduct {
  const en = productSeo(p, false),
    fa = productSeo(p, true);
  return {
    ...p,
    metaTitleEn: en.title,
    metaTitleFa: fa.title,
    metaDescriptionEn: en.description,
    metaDescriptionFa: fa.description,
    keywords: p.keywords?.length
      ? p.keywords
      : [p.code, p.nameEn, p.nameFa].filter(Boolean),
  };
}
export function canonicalPath(path: string) {
  return path.split(/[?#]/)[0].replace(/^\/+/, '/').replace(/\/+$/, '') || '/';
}
export function pageUrl(
  path: string,
  seo: Pick<SeoSettings, 'domainEn' | 'domainFa'>,
  fa: boolean,
) {
  return new URL(canonicalPath(path), seo[fa ? 'domainFa' : 'domainEn']).href;
}
export function languageFor(hostname: string, search = '') {
  const lang = new URLSearchParams(search).get('lang');
  return lang === 'fa' || (lang !== 'en' && hostname.endsWith('.ir'));
}
export function metadataFor(
  path: string,
  fa: boolean,
  value: unknown,
  company: CompanyContactInfo,
  p?: BearingProduct,
  content?: PublishedSeoContent,
  products: BearingProduct[] = [],
  search = '',
) {
  const seo = upgradeSeo(value),
    route = canonicalPath(path);
  const missing = route.startsWith('/product/')
    ? !p || Boolean(p.isArchived)
    : !['/', '/catalog', '/engineering', '/admin'].includes(route);
  const privatePage =
    route === '/admin' ||
    missing ||
    new URLSearchParams(search).get('preview') === '1';
  const page =
    route === '/catalog'
      ? seo.pages.catalog
      : route === '/engineering'
        ? seo.pages.engineering
        : undefined;
  const data = missing
    ? {
        title: fa
          ? 'صفحه یافت نشد | پولاد چرخش'
          : 'Page not found | Polad Charkhesh',
        description: fa
          ? 'صفحه مورد نظر یافت نشد. کاتالوگ محصولات پولاد چرخش را مشاهده کنید.'
          : 'This page could not be found. Explore the Polad Charkhesh product catalog.',
      }
    : route === '/admin'
      ? {
          title: fa
            ? 'مدیریت سایت | پولاد چرخش'
            : 'Website administration | Polad Charkhesh',
          description: '',
        }
      : p
        ? productSeo(p, fa)
        : {
            title: (page || seo)[fa ? 'titleFa' : 'titleEn'],
            description: (page || seo)[fa ? 'descriptionFa' : 'descriptionEn'],
          };
  const canonical = pageUrl(route, seo, fa),
    origin = seo[fa ? 'domainFa' : 'domainEn'];
  const absoluteImage = (url: string) => {
    try {
      const u = new URL(url, origin);
      return ['https:', 'http:'].includes(u.protocol) &&
        !u.username &&
        !u.password
        ? u.href
        : '';
    } catch {
      return '';
    }
  };
  const media = p ? mediaFor(p, content) : null;
  const exactImage = media && !media.reference ? absoluteImage(media.url) : '';
  const image =
    exactImage ||
    absoluteImage(seo.ogImage || content?.brand?.logoUrl || '/brand/logo.png');
  const orgId = pageUrl('/', seo, fa) + '#organization';
  const organization = {
    '@type': 'Organization',
    '@id': orgId,
    name: company[fa ? 'nameFa' : 'nameEn'],
    legalName: company[fa ? 'legalNameFa' : 'legalNameEn'],
    url: pageUrl('/', seo, fa),
    logo: absoluteImage(content?.brand?.logoUrl || '/brand/logo.png'),
    telephone:
      company.primaryPhoneTel?.replace(/^tel:/, '') || company.primaryPhone,
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company[fa ? 'addressFa' : 'addressEn'],
      addressLocality: company[fa ? 'cityFa' : 'cityEn'],
    },
  };
  const graph: Record<string, unknown>[] = privatePage
    ? []
    : [
        organization,
        {
          '@type': 'WebSite',
          '@id': pageUrl('/', seo, fa) + '#website',
          url: pageUrl('/', seo, fa),
          name: company[fa ? 'nameFa' : 'nameEn'],
          inLanguage: fa ? 'fa' : 'en',
          publisher: { '@id': orgId },
        },
      ];
  if (!privatePage) {
    graph.push({
      '@type': route === '/catalog' ? 'CollectionPage' : 'WebPage',
      '@id': canonical + '#webpage',
      url: canonical,
      name: data.title,
      description: data.description,
      inLanguage: fa ? 'fa' : 'en',
      isPartOf: { '@id': pageUrl('/', seo, fa) + '#website' },
      ...(p ? { mainEntity: { '@id': canonical + '#product' } } : {}),
    });
    if (p) {
      graph.push({
        '@type': 'Product',
        '@id': canonical + '#product',
        url: canonical,
        name: p[fa ? 'nameFa' : 'nameEn'] || p.code,
        sku: p.code,
        description: p[fa ? 'descriptionFa' : 'descriptionEn'],
        category: p.category,
        ...(exactImage ? { image: exactImage } : {}),
        additionalProperty: (
          [
            ['d', 'Bore diameter', 'mm'],
            ['D', 'Outside diameter', 'mm'],
            ['B', 'Width', 'mm'],
            ['weightKg', 'Weight', 'kg'],
            ['crKn', 'Dynamic load rating', 'kN'],
            ['corKn', 'Static load rating', 'kN'],
          ] as Array<[keyof BearingProduct, string, string]>
        )
          .filter(
            ([key]) =>
              typeof p[key] === 'number' &&
              Number.isFinite(p[key]) &&
              (p[key] as number) > 0,
          )
          .map(([key, name, unitText]) => ({
            '@type': 'PropertyValue',
            name,
            value: p[key],
            unitText,
          })),
      });
    }
    if (route === '/catalog')
      graph.push({
        '@type': 'ItemList',
        itemListElement: products
          .filter((item) => !item.isArchived)
          .map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item[fa ? 'nameFa' : 'nameEn'],
            url: pageUrl('/product/' + item.slug, seo, fa),
          })),
      });
    if (route !== '/')
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: fa ? 'خانه' : 'Home',
            item: pageUrl('/', seo, fa),
          },
          ...(p
            ? [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: fa ? 'کاتالوگ محصولات' : 'Product catalog',
                  item: pageUrl('/catalog', seo, fa),
                },
              ]
            : []),
          {
            '@type': 'ListItem',
            position: p ? 3 : 2,
            name: p ? p[fa ? 'nameFa' : 'nameEn'] : data.title,
            item: canonical,
          },
        ],
      });
  }
  return {
    ...data,
    canonical,
    alternates: privatePage
      ? {}
      : {
          en: pageUrl(route, seo, false),
          fa: pageUrl(route, seo, true),
          'x-default': pageUrl(route, seo, false),
        },
    image,
    siteName: company[fa ? 'nameFa' : 'nameEn'],
    locale: fa ? 'fa_IR' : 'en_US',
    robots: privatePage
      ? 'noindex,nofollow'
      : 'index,follow,max-image-preview:large',
    verification: seo.verification,
    structuredData: { '@context': 'https://schema.org', '@graph': graph },
    missing,
    privatePage,
  };
}
export type PageMetadata = ReturnType<typeof metadataFor>;
export const escapeHtml = (s: unknown) =>
  (typeof s === 'string' || typeof s === 'number' || typeof s === 'boolean'
    ? String(s)
    : ''
  ).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
export const jsonForHtml = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
export function metadataHead(data: PageMetadata) {
  const meta = (key: string, value: string, property = false) =>
    `<meta ${property ? 'property' : 'name'}="${key}" content="${escapeHtml(value)}"/>`;
  return (
    `<title>${escapeHtml(data.title)}</title>` +
    meta('description', data.description) +
    meta('robots', data.robots) +
    `<link rel="canonical" href="${escapeHtml(data.canonical)}"/>` +
    Object.entries(data.alternates)
      .map(
        ([lang, url]) =>
          `<link rel="alternate" hreflang="${lang}" href="${escapeHtml(url)}"/>`,
      )
      .join('') +
    Object.entries({
      'og:title': data.title,
      'og:description': data.description,
      'og:url': data.canonical,
      'og:site_name': data.siteName,
      'og:type': 'website',
      'og:locale': data.locale,
      'og:locale:alternate': data.locale === 'fa_IR' ? 'en_US' : 'fa_IR',
      'og:image': data.image,
      'og:image:alt': data.title,
    })
      .map(([k, v]) => meta(k, v, true))
      .join('') +
    Object.entries({
      'twitter:card': 'summary_large_image',
      'twitter:title': data.title,
      'twitter:description': data.description,
      'twitter:image': data.image,
      'twitter:image:alt': data.title,
    })
      .map(([k, v]) => meta(k, v))
      .join('') +
    (data.verification && !data.privatePage
      ? meta('google-site-verification', data.verification)
      : '') +
    `<script id="site-structured-data" type="application/ld+json">${jsonForHtml(data.structuredData)}</script>`
  );
}
