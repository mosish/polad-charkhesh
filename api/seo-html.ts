import type { BearingProduct } from '../domain/product';
import type { CompanyContactInfo } from '../domain/company';
import type { PublishedSeoContent, SeoSettings } from '../domain/seo';
import { escapeHtml as e } from '../domain/seo';
import { mediaFor } from '../lib/media';
import { relatedComponents } from '../lib/catalog-quality';
import { breadcrumbsFor } from '../domain/breadcrumbs';
import {referenceMedia} from '../lib/reference-media';
import { catalogHubs, catalogHubForPath, hubPath, productBelongsToHub, productHub } from '../domain/catalog-hubs';
import { productHeading, productSpecifications } from '../domain/product-presentation';
import { catalogHubGuides } from '../domain/catalog-hub-guides';
import { ballBearingExamples, ballBearingIntro } from '../domain/ball-bearing-navigation';
import { ballBearingLearning } from '../domain/ball-bearing-learning';
import { technicalTextParts } from '../domain/technical-text';
const technical = (text: string) => technicalTextParts(text).map(part => part.ltr ? `<bdi dir="ltr">${e(part.text)}</bdi>` : e(part.text)).join('');
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
    seo?: Pick<SeoSettings, 'domainEn' | 'domainFa'>;
    hostname?: string;
  },
  missing: boolean,
  p?: BearingProduct,
) {
  const t = (en: string, persian: string) => (fa ? persian : en);
  const { company, content, products } = data;
  const hub = catalogHubForPath(route);
  if (route === '/admin') return '';
  const lang = '?lang=' + (fa ? 'fa' : 'en');
  const live = data.seo && data.hostname && [data.seo.domainEn, data.seo.domainFa].some(origin => new URL(origin).hostname === data.hostname);
  const href = (url: string) => e(live ? new URL(url, data.seo![fa ? 'domainFa' : 'domainEn']).href : url + lang);
  const productLink = (item: BearingProduct) =>
    `<a href="${href('/product/' + encodeURIComponent(item.slug || item.id))}"><bdi dir="ltr">${e(item.code)}</bdi> · ${technical(item[fa ? 'nameFa' : 'nameEn'])}</a>`;
  const listing = (items: BearingProduct[]) =>
    '<ul>' +
    items.map((item) => '<li>' + productLink(item) + '</li>').join('') +
    '</ul>';
  const hubLinks = `<nav class="catalog-hub-links" aria-label="${t('Component selection guides', 'راهنمای خانواده‌های قطعات')}">${catalogHubs.map(item => `<a href="${href(hubPath(item))}"${item.slug === hub?.slug ? ' aria-current="page"' : ''}><span>${technical(item[fa ? 'fa' : 'en'].title)}</span></a>`).join('')}</nav>`;
  const catalog = `<section id="catalog"><h2>${t('Product catalog', 'کاتالوگ محصولات')}</h2>${hubLinks}${listing(products)}</section>`;
  const tools = `<section id="engineering"><h2>${e(content.engineering?.[fa ? 'titleFa' : 'titleEn'])}</h2><p>${t('Bearing life and equivalent load, known equivalent load, fit limits, technical comparison and unit conversion. Review assumptions alongside calculation results.', 'عمر بیرینگ و بار معادل، بار معادل معلوم، حدود انطباق، مقایسه فنی و تبدیل واحد؛ بررسی فرضیات همراه با نتایج محاسبات.')}</p><a href="${href('/engineering')}">${t('Open engineering tools', 'مشاهده ابزارهای مهندسی')}</a><noscript><p>${t('Interactive calculations and 3D views require JavaScript. Product specifications remain available below.', 'محاسبات تعاملی و نمایش سه‌بعدی نیاز به جاوااسکریپت دارند. مشخصات فنی محصولات همچنان در دسترس است.')}</p></noscript></section>`;
  const contacts = `<section id="contact"><h2>${e(content.contact?.[fa ? 'titleFa' : 'titleEn'])}</h2><p>${e(company[fa ? 'addressFa' : 'addressEn'])}</p><a href="${publicUrl(company.primaryPhoneTel)}">${e(company[fa ? 'primaryPhoneDisplayFa' : 'primaryPhoneDisplayEn'])}</a> · <a href="mailto:${e(company.email)}">${e(company.email)}</a></section>`;
  let body = '';
  if (missing)
    body = `<div class="not-found-card"><p>404 / ${e(company[fa ? 'nameFa' : 'nameEn'])}</p><h1>${t('Page not found', 'صفحه یافت نشد')}</h1><p>${t('The link may have changed. Explore our components or return to the company website.', 'ممکن است نشانی صفحه تغییر کرده باشد. محصولات را بررسی کنید یا به صفحه اصلی شرکت برگردید.')}</p><a href="${href('/catalog')}">${t('Explore the catalog', 'مشاهده کاتالوگ')}</a> · <a href="${href('/')}">${t('Return home', 'بازگشت به خانه')}</a></div>`;
  else if (p) {
    const media = mediaFor(p, content);
    body = `<h1>${technical(productHeading(p, fa))}</h1><p>${e(p[fa ? 'descriptionFa' : 'descriptionEn'])}</p>`;
    if (media.url){
      const resized=referenceMedia(media.url);
      const image=`<img src="${publicUrl(resized?.src||media.url,true)}" ${resized?`srcset="${e(resized.srcSet)}" sizes="(max-width: 760px) 90vw, 640px"`:''} alt="${e(media.reference ? t(p.category + ' bearing family reference illustration', 'تصویر مرجع خانواده بیرینگ') : p[fa ? 'nameFa' : 'nameEn'])}" width="400" height="400" decoding="async"/>`;
      body+=`<figure>${resized?`<picture><source type="image/webp" srcset="${e(resized.webpSrcSet)}" sizes="(max-width: 760px) 90vw, 640px"/>${image}</picture>`:image}</figure>`;
    }
    body +=
      `<div class="product-spec-table-wrap"><table class="product-spec-table"><caption>${t('Technical specifications', 'مشخصات فنی')} · ${e(p.code)}</caption><thead><tr><th scope="col">${t('Property', 'مشخصه')}</th><th scope="col">${t('Recorded value', 'مقدار ثبت‌شده')}</th></tr></thead><tbody>` +
      productSpecifications(p, fa)
        .map(row => `<tr><th scope="row">${e(row.label)}</th><td dir="auto">${e(row.value)}</td></tr>`)
        .join('') +
      '</tbody></table></div>';
    const family = productHub(p);
    if (family) body += `<p class="product-hub-backlink"><a href="${href(hubPath(family))}">${technical(family[fa ? 'fa' : 'en'].title)}</a></p>`;
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
  } else if (hub) {
    const copy = hub[fa ? 'fa' : 'en'];
    let navigation = '';
    let learningQuestions = '';
    if (hub.slug === 'ball-bearings') {
      const language = fa ? 'fa' : 'en';
      const intro = ballBearingIntro[language];
      const learning = ballBearingLearning[language];
      learningQuestions = `<section id="bearing-questions" class="ball-bearing-questions" aria-labelledby="bearing-questions-title"><h2>${e(learning.dimensionsTitle)}</h2><p>${e(learning.dimensionsText)}</p>`
        + `<table><caption>${e(learning.dimensionsTitle)}</caption><thead><tr>${learning.columns.map(label => `<th scope="col">${e(label)}</th>`).join('')}</tr></thead>`
        + `<tbody>${learning.dimensions.map(([symbol, label]) => `<tr><th scope="row"><bdi dir="ltr">${e(symbol)}</bdi></th><td>${e(label)}</td></tr>`).join('')}</tbody></table>`
        + `<h2 id="bearing-questions-title">${e(learning.questionsTitle)}</h2>${learning.questions.map(item => `<section><h3>${e(item.question)}</h3><p>${e(item.answer)}</p></section>`).join('')}</section>`;
      const cards = ballBearingExamples(products).map(group => {
        const examples = group.products.map(product =>
          `<li><a href="${href('/product/' + encodeURIComponent(product.slug!))}"><bdi dir="ltr">${e(product.code)}</bdi></a></li>`,
        ).join('');
        return `<section><h3>${e(group[language].title)}</h3><p>${e(group[language].text)}</p>`
          + (examples ? `<span class="ball-bearing-example-label">${e(intro.examples)}</span><ul>${examples}</ul>` : `<p>${e(intro.empty)}</p>`)
          + '</section>';
      }).join('');
      navigation = `<section class="ball-bearing-overview" aria-labelledby="bearing-definition"><h2 id="bearing-definition">${e(learning.title)}</h2><p>${e(learning.definition)}</p>`
        + `<h3>${e(learning.differenceTitle)}</h3><p>${e(learning.difference)}</p><a href="${href('/catalog/roller-bearings')}">${e(learning.rollerLink)} ↗</a>`
        + `<nav class="bearing-contents" aria-label="${e(learning.contentsLabel)}"><a href="#ball-bearing-types-heading">${e(learning.typesLink)}</a><a href="#bearing-components">${e(learning.productsLink)}</a><a href="#selection-guide">${e(learning.guideLink)}</a><a href="#bearing-questions">${e(learning.questionsLink)}</a></nav></section>`
        + '<section class="ball-bearing-navigation" aria-labelledby="ball-bearing-types-heading">'
        + `<h2 id="ball-bearing-types-heading">${e(intro.title)}</h2><p>${e(intro.text)}</p>`
        + `<div class="ball-bearing-type-grid">${cards}</div>`
        + `<aside class="ball-bearing-contact"><div><h3>${e(intro.contactTitle)}</h3><p>${e(intro.contactText)}</p></div>`
        + (company.primaryPhoneTel ? `<a class="button" href="${publicUrl(company.primaryPhoneTel)}">${e(intro.contact)}<bdi dir="ltr">${e(company[fa ? 'primaryPhoneDisplayFa' : 'primaryPhoneDisplayEn'])}</bdi></a>` : '')
        + '</aside></section>';
    }
    body = `<h1>${technical(copy.title)}</h1><p>${technical(copy.description)}</p><a href="#selection-guide">${t('Read the selection guide', 'مطالعه راهنمای انتخاب')}</a>`
      + navigation + hubLinks + `<h2${hub.slug === 'ball-bearings' ? ' id="bearing-components"' : ''}>${t('Products in this family', 'محصولات این خانواده')}</h2>`
      + listing(products.filter(item => productBelongsToHub(item, hub)))
      + `<article id="selection-guide" class="catalog-hub-guide">${catalogHubGuides[hub.slug][fa ? 'fa' : 'en'].map(section => `<section><h2>${technical(section.title)}</h2><p>${technical(section.text)}</p></section>`).join('')}`
      + learningQuestions
      + `<aside class="catalog-hub-references"><h2>${t('Technical references', 'مراجع فنی')}</h2><ul>${hub.references.map(reference => `<li><a href="${publicUrl(reference.url)}">${e(reference.title)}</a></li>`).join('')}</ul>`
      + `<a href="${href('/engineering')}">${t('Open engineering tools', 'مشاهده ابزارهای مهندسی')}</a> · <a href="/#contact">${t('Discuss the application', 'بررسی فنی کاربرد')}</a></aside></article>`;
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
    if (content.layout?.hidden?.includes('hero'))
      body = `<h1>${e(company[fa ? 'nameFa' : 'nameEn'])}</h1>` + body;
  }
  const crumbs = missing ? [] : breadcrumbsFor(route, fa, p);
  if (crumbs.length) body = `<nav class="breadcrumbs" aria-label="${t('Breadcrumbs', 'مسیر صفحه')}"><ol>${crumbs.map((item, index) => `<li>${index === crumbs.length - 1 ? `<span aria-current="page">${technical(item.label)}</span>` : `<a href="${href(item.path)}">${technical(item.label)}</a>`}</li>`).join('')}</ol></nav>` + body;
  return `<div class="seo-initial"><header><a href="${href('/')}">${e(company[fa ? 'nameFa' : 'nameEn'])}</a><nav><a href="${href('/catalog')}">${t('Products', 'محصولات')}</a> · <a href="${href('/engineering')}">${t('Engineering tools', 'ابزارهای مهندسی')}</a></nav></header><main id="main">${body}</main><footer>${e(content.footer?.[fa ? 'descriptionFa' : 'descriptionEn'])}</footer></div>`;
}
