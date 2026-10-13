export interface Breadcrumb {
  label: string;
  path: string;
}

/** Shared by the visible navigation, initial HTML and JSON-LD. */
export function breadcrumbsFor(route: string, fa: boolean, product?: { code: string }): Breadcrumb[] {
  if (route === '/' || route === '/admin') return [];
  const items = [{ label: fa ? 'خانه' : 'Home', path: '/' }];
  if (route === '/catalog' || product)
    items.push({ label: fa ? 'کاتالوگ محصولات' : 'Product catalog', path: '/catalog' });
  if (route === '/engineering')
    items.push({ label: fa ? 'ابزارهای مهندسی' : 'Engineering tools', path: route });
  if (product) items.push({ label: product.code, path: route });
  return items;
}
