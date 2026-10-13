import { ArrowUpRight, Search } from 'lucide-react';
import { usePlatform } from './Context';

export default function NotFound({ productCode }: { productCode?: string }) {
  const { fa, t } = usePlatform();
  const lang = fa ? 'fa' : 'en';
  return (
    <main id="main" className="section not-found">
      <div className="not-found-card">
        <span className="section-label">404 / {t('POLAD CHARKHESH ARIAN TECH', 'پولاد چرخش آرین تک')}</span>
        <div className="not-found-mark" aria-hidden="true">404</div>
        <h1>{productCode ? t('Product not found', 'محصول یافت نشد') : t('This page is out of reach.', 'این صفحه پیدا نشد.')}</h1>
        <p>{t('The link may have changed. Explore our components or return to the company website.', 'ممکن است نشانی صفحه تغییر کرده باشد. محصولات را بررسی کنید یا به صفحه اصلی شرکت برگردید.')}</p>
        <div className="not-found-actions">
          <a className="button primary" href={`/catalog?lang=${lang}${productCode ? '&q=' + encodeURIComponent(productCode) : ''}`}><Search size={18} />{t('Explore the catalog', 'مشاهده کاتالوگ')}</a>
          <a className="button" href={`/?lang=${lang}`}>{t('Return home', 'بازگشت به خانه')}<ArrowUpRight size={18} /></a>
          <a href={`/engineering?lang=${lang}`}>{t('Engineering tools', 'ابزارهای مهندسی')}</a>
        </div>
      </div>
    </main>
  );
}
