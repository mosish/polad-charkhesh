import PageSection, { CustomSections } from './PageSection';
import Copy from './Copy';
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  ShieldCheck,
  Compass,
  FileCheck2,
} from 'lucide-react';
import { usePlatform } from './Context';
import HomeSections from './HomeSections';
import HeroBearing from './HeroBearing';
import { publicHref } from '../../lib/public-links';
import { useEffect } from 'react';
export default function Home() {
  const { fa, t, content, loading } = usePlatform();
  useEffect(() => {
    if (loading || !location.hash) return;
    const id = decodeURIComponent(location.hash.slice(1));
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' }), 120);
    return () => window.clearTimeout(timer);
  }, [loading]);
  return (
    <main id="main" className="managed-home">
      <PageSection id="hero">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span />
              {content?.hero?.[fa ? 'badgeFa' : 'badgeEn']}
            </div>
            <h1>
              {content?.hero?.[fa ? 'titleFa' : 'titleEn']
                ?.split('\n')
                .map((line: string, i: number, lines: string[]) => (
                  <span
                    className={i === lines.length - 1 ? 'hero-last' : ''}
                    key={i}
                  >
                    {line}
                    <br />
                  </span>
                )) || (
                <>
                  <Copy text="Engineered for" />
                  <br />
                  <Copy text="what keeps" />
                  <br />
                  <em>
                    <Copy text="industry moving." />
                  </em>
                </>
              )}
            </h1>
            <p>{content?.hero?.[fa ? 'descriptionFa' : 'descriptionEn']}</p>
            <div className="hero-actions">
              <a className="button primary" href={publicHref(content?.links?.heroPrimary)}>
                {t('Explore product catalog', 'مشاهده کاتالوگ محصولات')}
                <ArrowRight size={18} />
              </a>
              <a className="text-link" href={publicHref(content?.links?.heroSecondary)}>
                {t('Talk to an engineer', 'مشاوره فنی')}
                <ArrowUpRight size={18} />
              </a>
            </div>
            <form className="hero-search" action="/" onSubmit={(event) => {
              event.preventDefault();
              const query = String(new FormData(event.currentTarget).get('q') || '').trim();
              const params = new URLSearchParams();
              const language = new URLSearchParams(location.search).get('lang');
              if (language) params.set('lang', language);
              if (query) params.set('q', query);
              location.assign('/' + (params.size ? '?' + params.toString() : '') + '#catalog');
            }}>
              <Search size={20} />
              <input
                aria-label="Search catalog"
                name="q"
                placeholder={t(
                  'Search bearing code, dimensions or application…',
                  'کد بیرینگ، ابعاد یا کاربرد…',
                )}
              />
              <button aria-label="Search">
                <ArrowRight size={19} />
              </button>
            </form>
            <div className="search-hints">
              {t('QUICK SEARCH', 'جستجوی سریع')}{' '}
              <a href="/?q=6204#catalog">6204</a>
              <a href="/?q=22212#catalog">22212</a>
              <a href="/?q=NU208#catalog">
                <Copy text="NU208" />
              </a>
            </div>
          </div>
          {content?.media?.heroPresentation !== 'photo' ? <HeroBearing /> : <div className="hero-visual">
            <div className="visual-top">
              <span>
                <Copy text="● ENGINEERING / 01" />
              </span>
              <span>
                <Copy text="DEEP GROOVE BALL BEARING" />
              </span>
            </div>
            <div className="bearing-stage">
              {content?.media?.heroUrl&&<img
                src={content?.media?.heroUrl}
                alt={content?.media?.[fa ? 'heroAltFa' : 'heroAltEn']}
                width={880}
                height={620}
              />}
              <span className="callout c1">
                <Copy text="01 — OUTER RING" />
              </span>
              <span className="callout c2">
                <Copy text="02 — ROLLING ELEMENTS" />
              </span>
              <span className="callout c3">
                <Copy text="03 — INNER RING" />
              </span>
            </div>
            <div className="visual-bottom">
              <div>
                <small>
                  {t('BEARING FAMILY REFERENCE', 'تصویر مرجع خانواده بیرینگ')}
                </small>
                <strong>
                  {t('Built around your application.', 'متناسب با کاربرد شما.')}
                </strong>
              </div>
              <a
                href={publicHref(content?.links?.heroVisual)}
                aria-label="Explore engineering"
              >
                <ArrowUpRight size={24} />
              </a>
            </div>
          </div>}
        </section>
      </PageSection>
      <PageSection id="capabilities">
        <section className="capabilities">
          {content?.cards?.capabilities.map((card: any) => (
            <div key={card.id}>
              {card.imageUrl ? (
                <img className="card-icon-image" src={card.imageUrl} alt="" width={64} height={64} />
              ) : (
                <Compass />
              )}
              <span>
                {card.href ? (
                  <a href={publicHref(card.href)}>{card[fa ? 'titleFa' : 'titleEn']}</a>
                ) : (
                  card[fa ? 'titleFa' : 'titleEn']
                )}
                <small>{card[fa ? 'descriptionFa' : 'descriptionEn']}</small>
              </span>
            </div>
          ))}
          <a href={publicHref(content?.links?.capabilities)}>
            {t('Explore engineering tools', 'ابزارهای مهندسی')}
            <ArrowUpRight size={19} />
          </a>
        </section>
      </PageSection>
      <PageSection id="about">
        <section className="section intro" id="about">
          <div className="section-label">
            01 / {t('THE RIGHT COMPONENT', 'قطعه مناسب')}
          </div>
          <h2>{content?.about?.[fa ? 'titleFa' : 'titleEn']}</h2>
          <p>{content?.about?.[fa ? 'descriptionFa' : 'descriptionEn']}</p>
        </section>
      </PageSection>
      <HomeSections />
      <CustomSections />
    </main>
  );
}
