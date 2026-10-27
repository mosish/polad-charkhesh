import type { BearingProduct } from './product';
import { catalogHubForPath, hubPath, productHub } from './catalog-hubs';

export interface Breadcrumb {
  label: string;
  path: string;
}

/** Shared by the visible navigation, initial HTML and JSON-LD. */
export function breadcrumbsFor(route: string, fa: boolean, product?: Pick<BearingProduct, 'code'> & Partial<Pick<BearingProduct, 'category' | 'schematicType' | 'isArchived'>>): Breadcrumb[] {
  if (route === '/' || route === '/admin') return [];
  const items = [{ label: fa ? 'خانه' : 'Home', path: '/' }];
  const hub = product?.category && product.schematicType
    ? productHub({ category: product.category, schematicType: product.schematicType, isArchived: product.isArchived })
    : catalogHubForPath(route);
  if (route === '/catalog' || hub || product)
    items.push({ label: fa ? 'کاتالوگ محصولات' : 'Product catalog', path: '/catalog' });
  if (hub) items.push({ label: hub[fa ? 'fa' : 'en'].title, path: hubPath(hub) });
  if (route === '/engineering')
    items.push({ label: fa ? 'ابزارهای مهندسی' : 'Engineering tools', path: route });
  if (product) items.push({ label: product.code, path: route });
  return items;
}
