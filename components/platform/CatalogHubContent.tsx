import { catalogHubs, hubPath, type CatalogHub } from '../../domain/catalog-hubs';
import { catalogHubGuides } from '../../domain/catalog-hub-guides';
import { ballBearingExamples, ballBearingIntro } from '../../domain/ball-bearing-navigation';
import { ballBearingLearning } from '../../domain/ball-bearing-learning';
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
    {hub.slug === 'ball-bearings' && <BallBearingQuestions />}
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

export function BallBearingOverview() {
  const { fa } = usePlatform();
  const copy = ballBearingLearning[fa ? 'fa' : 'en'];
  return <section className="ball-bearing-overview" aria-labelledby="bearing-definition">
    <h2 id="bearing-definition">{copy.title}</h2><p>{copy.definition}</p>
    <h3>{copy.differenceTitle}</h3><p>{copy.difference}</p>
    <a href="/catalog/roller-bearings">{copy.rollerLink} ↗</a>
    <nav className="bearing-contents" aria-label={copy.contentsLabel}>
      <a href="#ball-bearing-types-heading">{copy.typesLink}</a>
      <a href="#bearing-components">{copy.productsLink}</a>
      <a href="#selection-guide">{copy.guideLink}</a>
      <a href="#bearing-questions">{copy.questionsLink}</a>
    </nav>
  </section>;
}

export function BallBearingQuestions() {
  const { fa } = usePlatform();
  const copy = ballBearingLearning[fa ? 'fa' : 'en'];
  return <section id="bearing-questions" className="ball-bearing-questions" aria-labelledby="bearing-questions-title">
    <h2>{copy.dimensionsTitle}</h2><p>{copy.dimensionsText}</p>
    <table><caption>{copy.dimensionsTitle}</caption>
      <thead><tr>{copy.columns.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{copy.dimensions.map(([symbol, label]) => <tr key={symbol}><th scope="row"><bdi dir="ltr">{symbol}</bdi></th><td>{label}</td></tr>)}</tbody>
    </table>
    <h2 id="bearing-questions-title">{copy.questionsTitle}</h2>
    {copy.questions.map(item => <section key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></section>)}
  </section>;
}
