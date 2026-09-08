import {
  Globe2,
  ArrowUpRight,
  Phone,
  ArrowUp,
  MessageCircle,
} from 'lucide-react';
import { usePlatform } from './Context';
export default function Shell({ children }: { children: React.ReactNode }) {
  const { fa, t, toggle, company, content } = usePlatform();
  return (
    <>
      <a className="skip-link" href="#main">
        {t('Skip to content', 'رفتن به محتوا')}
      </a>
      <div className="utility">
        <span>
          {t(
            'BEARINGS. ENGINEERING. CONTINUITY.',
            'تأمین تخصصی بیرینگ و قطعات صنعتی',
          )}
        </span>
        <span>{company?.landlinePhoneDisplayEn || 'POLAD CHARKHESH'}</span>
      </div>
      <header className="navigation">
        <a href="/" className="brand">
          <img
            className="brand-logo"
            src={content?.brand?.logoUrl || '/brand/logo.png'}
            width={560}
            height={575}
            alt={
              content?.brand?.[fa ? 'logoAltFa' : 'logoAltEn'] ||
              t('Polad Charkhesh company logo', 'نشان شرکت پولاد چرخش')
            }
          />
          <span>
            {t('POLAD CHARKHESH', 'پولاد چرخش')}
            <small>{t('INDUSTRIAL ENGINEERING', 'مهندسی و تأمین صنعتی')}</small>
          </span>
        </a>
        <nav aria-label={t('Main navigation', 'ناوبری اصلی')}>
          {content?.navigation?.items?.map((item: any) => (
            <a key={item.id} href={item.href} aria-current={item.href === location.pathname ? 'page' : undefined}>
              {item[fa ? 'labelFa' : 'labelEn']}
            </a>
          ))}
        </nav>
        <button
          className="language"
          onClick={toggle}
          aria-label={t('Switch to Persian', 'Switch to English')}
        >
          <Globe2 size={16} />
          {fa ? 'EN' : 'فارسی'}
        </button>
        <a className="nav-contact" href={content?.links?.header || '/#contact'}>
          {t('Let’s talk engineering', 'مشاوره مهندسی')}
          <ArrowUpRight size={16} />
        </a>
      </header>
      {children}
      <footer>
        <a href="/" className="footer-brand">
          <img
            className="brand-logo"
            src={content?.brand?.logoUrl || '/brand/logo.png'}
            width={560}
            height={575}
            alt={
              content?.brand?.[fa ? 'logoAltFa' : 'logoAltEn'] ||
              t('Polad Charkhesh company logo', 'نشان شرکت پولاد چرخش')
            }
          />
          <span>{t('POLAD CHARKHESH', 'پولاد چرخش')}</span>
        </a>
        <span>{content?.footer?.[fa ? 'descriptionFa' : 'descriptionEn']}</span>
        <a href="/asset-credits.html">{t('Image credits', 'منابع تصاویر')}</a>
        <a href="/admin">
          {t('Administration', 'مدیریت')}
          <ArrowUpRight size={14} />
        </a>
      </footer>
      {company && (
        <div className="floating">
          <a
            href={company.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
          >
            <MessageCircle size={20} />
          </a>
          <a
            href={company.primaryPhoneTel}
            aria-label={t('Call company', 'تماس با شرکت')}
          >
            <Phone size={18} />
          </a>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label={t('Back to top', 'بازگشت به بالا')}
          >
            <ArrowUp size={18} />
          </button>
        </div>
      )}
    </>
  );
}
