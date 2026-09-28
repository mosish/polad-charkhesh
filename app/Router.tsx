import { Fragment, lazy, Suspense } from 'react';
import { Provider } from '../components/platform/Context';
import Shell from '../components/platform/Shell';
import Home from '../components/platform/Home';
const Catalog = lazy(() => import('../components/platform/Catalog')),
  Product = lazy(() => import('../components/platform/Product')),
  Engineering = lazy(() => import('../components/platform/Engineering')),
  Admin = lazy(() => import('../components/admin/Admin'));
export default function Router() {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const Layout = path === '/admin' ? Fragment : Shell;
  return (
    <Provider>
      <Layout>
        <Suspense
          fallback={
            <main id="main" className="state" role="status">
              Loading workspace…
            </main>
          }
        >
          {path === '/' ? (
            <Home />
          ) : path === '/catalog' ? (
            <Catalog />
          ) : path.startsWith('/product/') ? (
            <Product />
          ) : path === '/engineering' ? (
            <Engineering />
          ) : path === '/admin' ? (
            <Admin />
          ) : (
            <main id="main" className="state">
              <h1>Page not found / صفحه یافت نشد</h1>
              <a className="button primary" href="/catalog">
                Explore the catalog / کاتالوگ محصولات
              </a>
            </main>
          )}
        </Suspense>
      </Layout>
    </Provider>
  );
}
