import {BearingJourneyProvider} from './BearingJourney';
import ContinuousBearingBackground from './ContinuousBearingBackground';
import ScrollReveal from './ScrollReveal';
import { useEffect, useRef, useState } from 'react';
import {
  Globe2,
  ArrowUpRight,
  Phone,
  ArrowUp,
  MessageCircle,
  Menu,
  X,
} from 'lucide-react';
import { usePlatform } from './Context';
import { publicHref } from '../../lib/public-links';
export default function Shell({ children }: { children: React.ReactNode }) {
  const { fa, t, toggle, company, content } = usePlatform();
  const [menuOpen, setMenuOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
    };
    const outside = (event: PointerEvent) => { if (!header.current?.contains(event.target as Node)) setMenuOpen(false); };
    const desktop = matchMedia('(min-width: 761px)');
    const resized = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener('keydown', dismiss); document.addEventListener('pointerdown', outside);
    desktop.addEventListener('change', resized);
    return () => { document.removeEventListener('keydown', dismiss); document.removeEventListener('pointerdown', outside); desktop.removeEventListener('change', resized); };
  }, [menuOpen]);
  return (
    <BearingJourneyProvider>
      <ContinuousBearingBackground/>
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
      <header ref={header} className={'navigation' + (menuOpen ? ' menu-open' : '')}>
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
        <button ref={menuButton} className="public-menu-toggle" aria-expanded={menuOpen} aria-controls="public-navigation" aria-label={t(menuOpen ? 'Close navigation' : 'Open navigation', menuOpen ? 'بستن ناوبری' : 'باز کردن ناوبری')} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <nav id="public-navigation" className={menuOpen ? 'is-open' : ''} aria-label={t('Main navigation', 'ناوبری اصلی')}>
          {content?.navigation?.items?.map((item: any) => (
            <a key={item.id} href={publicHref(item.href)} onClick={() => setMenuOpen(false)}>
              {item[fa ? 'labelFa' : 'labelEn']}
            </a>
          ))}
        </nav>
        <button
          className="language"
          onClick={() => { setMenuOpen(false); toggle(); }}
          aria-label={t('Switch to Persian', 'تغییر زبان به انگلیسی')}
        >
          <Globe2 size={16} />
          {fa ? 'EN' : 'فارسی'}
        </button>
        <a className="nav-contact" href={publicHref(content?.links?.header || '/#contact')}>
          {t('Let’s talk engineering', 'مشاوره مهندسی')}
          <ArrowUpRight size={16} />
        </a>
      </header>
      {children}
      <ScrollReveal/>
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
    </BearingJourneyProvider>
  );
}
