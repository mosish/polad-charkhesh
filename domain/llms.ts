import type { CompanyContactInfo } from './company';
import { pageUrl, upgradeSeo } from './seo';
import { catalogHubs, hubPath } from './catalog-hubs';

const plain = (value: string) => value.replace(/[\r\n]+/g, ' ').replace(/([\\`*_[\]<>#])/g, '\\$1');

/** A public guide, not an export of admin records or an indexing directive. */
export function llmsText(value: unknown, company: CompanyContactInfo, fa: boolean) {
  const seo = upgradeSeo(value);
  const t = (en: string, persian: string) => fa ? persian : en;
  const link = (label: string, path: string, description: string) =>
    `- [${label}](${pageUrl(path, seo, fa)}): ${description}`;
  return [
    '# ' + plain(company[fa ? 'nameFa' : 'nameEn']),
    '',
    '> ' + t('Company presentation, industrial bearing specifications and engineering reference tools. This website is not an online shop.', 'معرفی شرکت، مشخصات بیرینگ‌های صنعتی و ابزارهای مرجع مهندسی؛ این وب‌سایت فروشگاه اینترنتی نیست.'),
    '',
    t('Product records may include family reference images and illustrative 3D geometry. These are labelled and must not be described as exact product photos or manufacturer CAD. Company-generated datasheets are distinct from original manufacturer publications.', 'برخی رکوردها دارای تصاویر مرجع خانواده و هندسه سه‌بعدی نمایشی هستند. این موارد برچسب دارند و عکس دقیق محصول یا مدل CAD سازنده محسوب نمی‌شوند. برگه‌های تولیدشده توسط شرکت با مستندات اصلی سازنده متفاوت‌اند.'),
    '',
    '## ' + t('Public pages', 'صفحات عمومی'),
    link(t('Company website', 'وب‌سایت شرکت'), '/', t('Company information, capabilities, industries and contact details.', 'معرفی شرکت، توانمندی‌ها، صنایع و اطلاعات تماس.')),
    link(t('Product catalog', 'کاتالوگ محصولات'), '/catalog', t('Published components with links to individual product specifications and available source documents.', 'قطعات منتشرشده همراه با پیوند مشخصات هر محصول و مستندات مرجع موجود.')),
    ...catalogHubs.map(hub => link(hub[fa ? 'fa' : 'en'].title, hubPath(hub), hub[fa ? 'fa' : 'en'].description)),
    link(t('Engineering tools', 'ابزارهای مهندسی'), '/engineering', t('Bearing life, equivalent load, fit limits, comparison and unit conversion. Read assumptions; results do not replace manufacturer verification.', 'عمر بیرینگ، بار معادل، حدود انطباق، مقایسه و تبدیل واحد؛ فرضیات را مطالعه کنید. نتایج جایگزین تأیید سازنده نیستند.')),
    link(t('Sitemap', 'نقشه سایت'), '/sitemap.xml', t('Current published page URLs and language alternatives.', 'نشانی صفحات منتشرشده و نسخه‌های زبانی.')),
    '',
    '## ' + t('Contact', 'تماس'),
    plain(company[fa ? 'addressFa' : 'addressEn']),
    plain(company.primaryPhoneTel.replace(/^tel:/, '') || company.primaryPhone),
    plain(company.email),
    '',
    '## ' + t('Languages', 'زبان‌ها'),
    `- [English](${pageUrl('/', seo, false)})`,
    `- [فارسی](${pageUrl('/', seo, true)})`,
    '',
  ].join('\n');
}
