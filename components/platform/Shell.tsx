import {BearingJourneyProvider} from './BearingJourney';
import {subscribeMediaQuery} from '../../lib/browser-compat';
import ScrollReveal from './ScrollReveal';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Phone,
  ArrowUp,
  MessageCircle,
  Menu,
  X,
} from 'lucide-react';
import { usePlatform } from './Context';
import { publicHref } from '../../lib/public-links';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { publicNavigation } from '../../domain/site-navigation';
export default function Shell({ children }: { children: React.ReactNode }) {
  const { fa, t, company, content } = usePlatform();
  const [menuOpen, setMenuOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const navigationHref = (href: string) => {
    const target = publicHref(href);
    if (!target.startsWith('/#')) return target;
    const language = new URLSearchParams(location.search).get('lang');
    const search = location.pathname === '/' ? location.search : language === 'fa' || language === 'en' ? '?lang=' + language : '';
    return '/' + search + target.slice(1);
  };
  useLayoutEffect(() => {
    const node = header.current;
    if (!node) return;
    const measure = () => document.documentElement.style.setProperty('--public-header-offset', (node.offsetHeight + (parseFloat(getComputedStyle(node).top) || 0) + 16) + 'px');
    measure();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(node);
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); document.documentElement.style.removeProperty('--public-header-offset'); };
  }, [menuOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
    };
    const outside = (event: PointerEvent) => { if (!header.current?.contains(event.target as Node)) setMenuOpen(false); };
    const desktop = matchMedia('(min-width: 761px)');
    const resized = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener('keydown', dismiss); document.addEventListener('pointerdown', outside);
    const unsubscribe = subscribeMediaQuery(desktop, resized);
    return () => { document.removeEventListener('keydown', dismiss); document.removeEventListener('pointerdown', outside); unsubscribe(); };
  }, [menuOpen]);
  return (
    <BearingJourneyProvider>
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
        <span>{company?.landlinePhoneDisplayEn || 'POLAD CHARKHESH ARIAN TECH'}</span>
      </div>
      <header ref={header} className={'navigation' + (menuOpen ? ' menu-open' : '')}>
        <a href="/" className="brand">
          <BrandLogo
            className="brand-logo"
            source={content?.brand?.logoUrl}
            width={560}
            height={575}
            alt={
              content?.brand?.[fa ? 'logoAltFa' : 'logoAltEn'] ||
              t('Polad Charkhesh Arian Tech company logo', 'نشان شرکت پولاد چرخش آرین تک')
            }
          />
          <span>
            {t('POLAD CHARKHESH ARIAN TECH', 'پولاد چرخش آرین تک')}
            <small>{t('INDUSTRIAL ENGINEERING', 'مهندسی و تأمین صنعتی')}</small>
          </span>
        </a>
        <button ref={menuButton} className="public-menu-toggle" aria-expanded={menuOpen} aria-controls="public-navigation" aria-label={t(menuOpen ? 'Close navigation' : 'Open navigation', menuOpen ? 'بستن ناوبری' : 'باز کردن ناوبری')} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <nav id="public-navigation" className={menuOpen ? 'is-open' : ''} aria-label={t('Main navigation', 'ناوبری اصلی')}>
          {publicNavigation(content?.navigation?.items || []).map((item) => (
            <a key={item.id} href={navigationHref(item.href)} onClick={() => setMenuOpen(false)}>
              {item[fa ? 'labelFa' : 'labelEn']}
            </a>
          ))}
        </nav>
        <ThemeToggle />
        <LanguageToggle onSelect={() => setMenuOpen(false)} />
        <a className="nav-contact" href={publicHref(content?.links?.header || '/#contact')}>
          {t('Let’s talk engineering', 'مشاوره مهندسی')}
          <ArrowUpRight size={16} />
        </a>
      </header>
      {children}
      <ScrollReveal/>
      <footer>
        <a href="/" className="footer-brand">
          <BrandLogo
            className="brand-logo"
            source={content?.brand?.logoUrl}
            width={560}
            height={575}
            alt={
              content?.brand?.[fa ? 'logoAltFa' : 'logoAltEn'] ||
              t('Polad Charkhesh Arian Tech company logo', 'نشان شرکت پولاد چرخش آرین تک')
            }
          />
          <span>{t('POLAD CHARKHESH ARIAN TECH', 'پولاد چرخش آرین تک')}</span>
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
