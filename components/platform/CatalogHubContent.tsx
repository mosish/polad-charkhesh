import { catalogHubs, hubPath, type CatalogHub } from '../../domain/catalog-hubs';
import { catalogHubGuides } from '../../domain/catalog-hub-guides';
import { ballBearingExamples, ballBearingIntro } from '../../domain/ball-bearing-navigation';
import { usePlatform } from './Context';
import TechnicalText from './TechnicalText';

export function CatalogHubLinks({ current }: { current?: CatalogHub }) {
  const { fa, t } = usePlatform();
  return <nav className="catalog-hub-links" aria-label={t('Component selection guides', 'راهنمای خانواده‌های قطعات')}>
    {catalogHubs.map(hub => <a key={hub.slug} href={hubPath(hub)} aria-current={current?.slug === hub.slug ? 'page' : undefined}>
      <span><TechnicalText text={hub[fa ? 'fa' : 'en'].title} /></span><small>{t('Explore products and guide', 'محصولات و راهنمای انتخاب')} ↗</small>
    </a>)}
  </nav>;
}

export function CatalogHubGuide({ hub }: { hub: CatalogHub }) {
  const { fa, t } = usePlatform();
  const sections = catalogHubGuides[hub.slug][fa ? 'fa' : 'en'];
  return <article id="selection-guide" className="catalog-hub-guide" aria-label={t('Technical selection guide', 'راهنمای فنی انتخاب')}>
    {sections.map(section => <section key={section.title}><h2><TechnicalText text={section.title} /></h2><p><TechnicalText text={section.text} /></p></section>)}
    <aside className="catalog-hub-references">
      <h2>{t('Technical references', 'مراجع فنی')}</h2>
      <ul>{hub.references.map(reference => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a></li>)}</ul>
      <div className="action-row"><a className="button" href="/engineering">{t('Open engineering tools', 'مشاهده ابزارهای مهندسی')}</a><a className="button" href="/#contact">{t('Discuss the application', 'بررسی فنی کاربرد')}</a></div>
    </aside>
  </article>;
}

export function BallBearingNavigation() {
  const { fa, products, company } = usePlatform();
  const language = fa ? 'fa' : 'en';
  const copy = ballBearingIntro[language];
  return <section className="ball-bearing-navigation" aria-labelledby="ball-bearing-types-heading">
    <h2 id="ball-bearing-types-heading">{copy.title}</h2>
    <p>{copy.text}</p>
    <div className="ball-bearing-type-grid">
      {ballBearingExamples(products).map(group => <section key={group.type}>
        <h3>{group[language].title}</h3>
        <p>{group[language].text}</p>
        {group.products.length ? <><span className="ball-bearing-example-label">{copy.examples}</span><ul>{group.products.map(product => <li key={product.id}>
          <a href={'/product/' + encodeURIComponent(product.slug!)}><bdi dir="ltr">{product.code}</bdi></a>
        </li>)}</ul></> : <p>{copy.empty}</p>}
      </section>)}
    </div>
    <aside className="ball-bearing-contact">
      <div><h3>{copy.contactTitle}</h3><p>{copy.contactText}</p></div>
      {company?.primaryPhoneTel && <a className="button" href={company.primaryPhoneTel}>{copy.contact}<bdi dir="ltr">{company[fa ? 'primaryPhoneDisplayFa' : 'primaryPhoneDisplayEn']}</bdi></a>}
    </aside>
  </section>;
}
