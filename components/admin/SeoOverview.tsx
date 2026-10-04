import { useState } from 'react';
import { metadataFor, type SeoSettings } from '../../domain/seo';
import { usePlatform } from '../platform/Context';
export default function SeoOverview({ seo }: { seo: SeoSettings }) {
  const { products, company, content, fa, t } = usePlatform();
  const [selected, setSelected] = useState('/');
  if (!company) return null;
  const product = products.find((p) => '/product/' + p.slug === selected);
  const data = metadataFor(
    selected,
    fa,
    seo,
    company,
    product,
    content,
    products,
  );
  const complete = products.filter((p) =>
    [
      'metaTitleEn',
      'metaTitleFa',
      'metaDescriptionEn',
      'metaDescriptionFa',
    ].every((key) =>
      String(
        p[
          key as
            | 'metaTitleEn'
            | 'metaTitleFa'
            | 'metaDescriptionEn'
            | 'metaDescriptionFa'
        ] || '',
      ).trim(),
    ),
  ).length;
  return (
    <section
      className="seo-overview"
      aria-label={t('SEO previews and coverage', 'پیش‌نمایش و پوشش سئو')}
    >
      <h2>{t('Search previews & coverage', 'پیش‌نمایش جستجو و پوشش سئو')}</h2>
      <div className="admin-stats">
        <div>
          <strong dir="ltr">
            {complete} / {products.length}
          </strong>
          <span>
            {t(
              'Products with English and Persian metadata',
              'محصولات با عنوان و توضیح سئو فارسی و انگلیسی',
            )}
          </span>
        </div>
        <div>
          <strong>3</strong>
          <span>
            {t(
              'Public pages with their own metadata',
              'صفحه عمومی با اطلاعات سئو مستقل',
            )}
          </span>
        </div>
        <div>
          <strong>{seo.ogImage ? '✓' : '—'}</strong>
          <span>{t('Social sharing image', 'تصویر اشتراک‌گذاری')}</span>
        </div>
      </div>
      <label>
        {t('Preview a page', 'پیش‌نمایش صفحه')}
        <select
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
        >
          <option value="/">{t('Homepage', 'صفحه اصلی')}</option>
          <option value="/catalog">{t('Catalog', 'کاتالوگ')}</option>
          <option value="/engineering">
            {t('Engineering tools', 'ابزارهای مهندسی')}
          </option>
          {products.map((p) => (
            <option key={p.id} value={'/product/' + p.slug}>
              {p.code}
            </option>
          ))}
        </select>
      </label>
      <div className="seo-search-preview" dir={fa ? 'rtl' : 'ltr'}>
        <small dir="ltr">{data.canonical}</small>
        <h3>{data.title}</h3>
        <p>{data.description}</p>
      </div>
      <p className="muted">
        {t(
          'Preview only; search engines choose the final snippet. Product SEO can be edited in Products → SEO. Blank product fields receive a descriptive default when saved.',
          'این نمایش پیش‌نمایش است؛ موتور جستجو متن نهایی را انتخاب می‌کند. سئوی محصول از محصولات ← سئو ویرایش می‌شود. فیلد خالی محصول هنگام ذخیره با متن پیش‌فرض توصیفی تکمیل می‌شود.',
        )}
      </p>
      <p>
        <a href="/sitemap.xml" target="_blank" rel="noreferrer">
          {t('View sitemap', 'مشاهده نقشه سایت')}
        </a>{' '}
        ·{' '}
        <a href="/robots.txt" target="_blank" rel="noreferrer">
          robots.txt
        </a>
      </p>
      <p className="muted">
        {t(
          'Search Console verification is optional here. Paste the token supplied for your domain, then submit /sitemap.xml after launch. A configured domain does not mean the domain is live or verified.',
          'تأیید سرچ کنسول در این بخش اختیاری است. توکن دامنه را وارد کنید و پس از انتشار /sitemap.xml را ثبت کنید. تنظیم دامنه به معنی فعال یا تأیید بودن آن نیست.',
        )}
      </p>
    </section>
  );
}
