import { breadcrumbsFor } from '../../domain/breadcrumbs';
import { usePlatform } from './Context';
import TechnicalText from './TechnicalText';

export default function Breadcrumbs({ route, product }: { route: string; product?: { code: string } }) {
  const { fa, t } = usePlatform();
  const items = breadcrumbsFor(route, fa, product);
  if (!items.length) return null;
  return (
    <nav className="breadcrumbs" aria-label={t('Breadcrumbs', 'مسیر صفحه')}>
      <ol>
        {items.map((item, index) => (
          <li key={item.path}>
            {index === items.length - 1 ? <span aria-current="page"><TechnicalText text={item.label} /></span> :
              <a href={`${item.path}?lang=${fa ? 'fa' : 'en'}`}><TechnicalText text={item.label} /></a>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
