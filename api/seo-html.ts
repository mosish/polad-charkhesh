import type { BearingProduct } from '../domain/product';
import type { CompanyContactInfo } from '../domain/company';
import type { PublishedSeoContent } from '../domain/seo';
import { escapeHtml as e } from '../domain/seo';
import { mediaFor } from '../lib/media';
import { relatedComponents } from '../lib/catalog-quality';
function publicUrl(value: unknown, image = false) {
  if (typeof value !== 'string') return '#';
  try {
    const parsed = new URL(value, 'https://poladcharkhesh.invalid');
    if (
      !(image ? ['https:'] : ['https:', 'mailto:', 'tel:']).includes(
        parsed.protocol,
      ) ||
      parsed.username ||
      parsed.password
    )
      return '#';
    return e(value);
  } catch {
    return '#';
  }
}
/** Public HTML for every visitor, from the same published records as the app.
 * React replaces it on startup. With JavaScript disabled it remains usable.
 * This is not a bot-specific page or a hidden SEO text block. */
export function initialPublicHtml(
  route: string,
  fa: boolean,
  data: {
    company: CompanyContactInfo;
    content: PublishedSeoContent;
    products: BearingProduct[];
  },
  missing: boolean,
  p?: BearingProduct,
) {
  const t = (en: string, persian: string) => (fa ? persian : en);
  const { company, content, products } = data;
  if (route === '/admin') return '';
  const lang = '?lang=' + (fa ? 'fa' : 'en');
  const href = (url: string) => e(url + lang);
  const productLink = (item: BearingProduct) =>
    `<a href="${href('/product/' + encodeURIComponent(item.slug || item.id))}">${e(item.code)} · ${e(item[fa ? 'nameFa' : 'nameEn'])}</a>`;
  const listing = (items: BearingProduct[]) =>
    '<ul>' +
    items.map((item) => '<li>' + productLink(item) + '</li>').join('') +
    '</ul>';
  const catalog = `<section id="catalog"><h2>${t('Product catalog', 'کاتالوگ محصولات')}</h2>${listing(products)}</section>`;
  const tools = `<section id="engineering"><h2>${e(content.engineering?.[fa ? 'titleFa' : 'titleEn'])}</h2><p>${t('Bearing life and equivalent load, known equivalent load, fit limits, technical comparison and unit conversion. Review assumptions alongside calculation results.', 'عمر بیرینگ و بار معادل، بار معادل معلوم، حدود انطباق، مقایسه فنی و تبدیل واحد؛ بررسی فرضیات همراه با نتایج محاسبات.')}</p><a href="${href('/engineering')}">${t('Open engineering tools', 'مشاهده ابزارهای مهندسی')}</a><noscript><p>${t('Interactive calculations and 3D views require JavaScript. Product specifications remain available below.', 'محاسبات تعاملی و نمایش سه‌بعدی نیاز به جاوااسکریپت دارند. مشخصات فنی محصولات همچنان در دسترس است.')}</p></noscript></section>`;
  const contacts = `<section id="contact"><h2>${e(content.contact?.[fa ? 'titleFa' : 'titleEn'])}</h2><p>${e(company[fa ? 'addressFa' : 'addressEn'])}</p><a href="${publicUrl(company.primaryPhoneTel)}">${e(company[fa ? 'primaryPhoneDisplayFa' : 'primaryPhoneDisplayEn'])}</a> · <a href="mailto:${e(company.email)}">${e(company.email)}</a></section>`;
  let body = '';
  if (missing)
    body = `<h1>${t('Page not found', 'صفحه یافت نشد')}</h1><a href="${href('/catalog')}">${t('Explore the catalog', 'مشاهده کاتالوگ')}</a>`;
  else if (p) {
    const media = mediaFor(p, content);
    const fields: Array<[keyof BearingProduct, string, string]> = [
      ['d', t('Bore diameter', 'قطر داخلی'), 'mm'],
      ['D', t('Outside diameter', 'قطر خارجی'), 'mm'],
      ['B', t('Width', 'عرض'), 'mm'],
      ['crKn', t('Dynamic load rating', 'ظرفیت بار دینامیکی'), 'kN'],
      ['corKn', t('Static load rating', 'ظرفیت بار استاتیکی'), 'kN'],
      ['weightKg', t('Weight', 'وزن'), 'kg'],
    ];
    body = `<nav aria-label="${t('Breadcrumbs', 'مسیر صفحه')}"><a href="${href('/')}">${t('Home', 'خانه')}</a> / <a href="${href('/catalog')}">${t('Product catalog', 'کاتالوگ')}</a> / ${e(p.code)}</nav><h1>${e(p.code)} · ${e(p[fa ? 'nameFa' : 'nameEn'])}</h1><p>${e(p[fa ? 'descriptionFa' : 'descriptionEn'])}</p>`;
    if (media.url)
      body += `<figure><img src="${publicUrl(media.url, true)}" alt="${e(media.reference ? t(p.category + ' bearing family reference illustration', 'تصویر مرجع خانواده بیرینگ') : p[fa ? 'nameFa' : 'nameEn'])}" width="400" height="400"/>${media.reference ? '<figcaption>' + t('Family reference · illustration only', 'تصویر مرجع خانواده · صرفاً نمایشی') + '</figcaption>' : ''}</figure>`;
    body +=
      `<h2>${t('Technical specifications', 'مشخصات فنی')}</h2><dl>` +
      fields
        .filter(
          ([key]) =>
            typeof p[key] === 'number' &&
            Number.isFinite(p[key]) &&
            (p[key] as number) > 0,
        )
        .map(
          ([key, label, unit]) =>
            `<dt>${e(label)}</dt><dd>${e(p[key])} ${unit}</dd>`,
        )
        .join('') +
      '</dl>';
    const applications = p[fa ? 'applicationsFa' : 'applicationsEn'] || [];
    if (applications.length)
      body +=
        `<h2>${t('Applications', 'کاربردها')}</h2><ul>` +
        applications.map((v: string) => `<li>${e(v)}</li>`).join('') +
        '</ul>';
    if (p.technicalSources?.some((source) => source.url))
      body +=
        `<h2>${t('Technical source documents', 'مستندات مرجع فنی')}</h2><ul>` +
        p.technicalSources
          .filter((source) => source.url)
          .map(
            (source) =>
              `<li><a href="${publicUrl(source.url)}">${e(source.manufacturer)} · ${e(source.reference)}</a></li>`,
          )
          .join('') +
        '</ul>';
    if (p.pdfUrl)
      body += `<h2>${t('Product documents', 'مستندات محصول')}</h2><a href="${publicUrl(p.pdfUrl)}">${e(p.code)} PDF</a>`;
    body +=
      `<h2>${t('Related components', 'قطعات مرتبط')}</h2>` +
      listing(relatedComponents(p, products)) +
      contacts;
  } else if (route === '/catalog')
    body =
      `<h1>${t('Industrial bearing catalog', 'کاتالوگ بیرینگ صنعتی')}</h1>` +
      catalog;
  else if (route === '/engineering')
    body =
      `<h1>${t('Mechanical engineering reference tools', 'ابزارهای مرجع مهندسی مکانیک')}</h1>` +
      tools;
  else {
    const sections: Record<string, string> = {
      hero: `<section><h1>${e(content.hero?.[fa ? 'titleFa' : 'titleEn'])}</h1><p>${e(content.hero?.[fa ? 'descriptionFa' : 'descriptionEn'])}</p></section>`,
      featured: catalog,
      engineering: tools,
      contact: contacts,
    };
    for (const id of [
      'about',
      'why',
      'industries',
      'support',
      'capabilities',
    ] as const) {
      const section = content[id] || {};
      sections[id] =
        `<section id="${id}">${section[fa ? 'titleFa' : 'titleEn'] ? '<h2>' + e(section[fa ? 'titleFa' : 'titleEn']) + '</h2>' : ''}${section[fa ? 'descriptionFa' : 'descriptionEn'] ? '<p>' + e(section[fa ? 'descriptionFa' : 'descriptionEn']) + '</p>' : ''}` +
        (content.cards?.[id] || [])
          .map(
            (card) =>
              `<article><h3>${e(card[fa ? 'titleFa' : 'titleEn'])}</h3><p>${e(card[fa ? 'descriptionFa' : 'descriptionEn'])}</p></article>`,
          )
          .join('') +
        '</section>';
    }
    for (const item of content.layout?.custom || [])
      if (item.enabled)
        sections[item.id] =
          `<section id="${e(item.id)}"><h2>${e(item[fa ? 'titleFa' : 'titleEn'])}</h2><p>${e(item[fa ? 'descriptionFa' : 'descriptionEn'])}</p></section>`;
    body = [
      ...(content.layout?.order || Object.keys(sections)),
      ...Object.keys(sections),
    ]
      .filter(
        (id, i, ids) =>
          ids.indexOf(id) === i && !content.layout?.hidden?.includes(id),
      )
      .map((id) => sections[id] || '')
      .join('');
  }
  return `<div class="seo-initial"><header><a href="${href('/')}">${e(company[fa ? 'nameFa' : 'nameEn'])}</a><nav><a href="${href('/catalog')}">${t('Products', 'محصولات')}</a> · <a href="${href('/engineering')}">${t('Engineering tools', 'ابزارهای مهندسی')}</a></nav></header><main id="main">${body}</main><footer>${e(content.footer?.[fa ? 'descriptionFa' : 'descriptionEn'])}</footer></div>`;
}
