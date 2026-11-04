import { Fragment, lazy, Suspense, type ComponentType } from 'react';
import { Provider } from '../components/platform/Context';
import Shell from '../components/platform/Shell';
import Home from '../components/platform/Home';
import NotFound from '../components/platform/NotFound';
import RecoveryBoundary, { WorkspaceRecovery } from '../components/platform/RecoveryBoundary';
import { catalogHubForPath, type CatalogHub } from '../domain/catalog-hubs';
import PageView from '../components/platform/PageView';
const Catalog = lazy(() => import('../components/platform/Catalog')),
  Product = lazy(() => import('../components/platform/Product')),
  Engineering = lazy(() => import('../components/platform/Engineering')),
  Admin = lazy(() => import('../components/admin/Admin'));
export default function Router({ workspace }: { workspace?: ComponentType<{ hub?: CatalogHub }> } = {}) {
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const hub = catalogHubForPath(path);
  const Layout = path === '/admin' ? Fragment : Shell;
  const CatalogPage = workspace || Catalog, ProductPage = workspace || Product,
    EngineeringPage = workspace || Engineering, AdminPage = workspace || Admin;
  return (
    <Provider>
      <PageView />
      <Layout>
        <RecoveryBoundary fallback={<WorkspaceRecovery />}>
        <Suspense
          fallback={
            <output id="main" className="state" >
              Loading workspace…
            </output>
          }
        >
          {path === '/' ? (
            <Home />
          ) : path === '/catalog' ? (
            <CatalogPage />
          ) : hub ? (
            <CatalogPage hub={hub} />
          ) : path.startsWith('/product/') ? (
            <ProductPage />
          ) : path === '/engineering' ? (
            <EngineeringPage />
          ) : path === '/admin' ? (
            <AdminPage />
          ) : (
            <NotFound />
          )}
        </Suspense>
        </RecoveryBoundary>
      </Layout>
    </Provider>
  );
}
