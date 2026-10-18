import { Fragment, lazy, Suspense } from 'react';
import { Provider } from '../components/platform/Context';
import Shell from '../components/platform/Shell';
import Home from '../components/platform/Home';
import NotFound from '../components/platform/NotFound';
import RecoveryBoundary, { WorkspaceRecovery } from '../components/platform/RecoveryBoundary';
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
            <Catalog />
          ) : path.startsWith('/product/') ? (
            <Product />
          ) : path === '/engineering' ? (
            <Engineering />
          ) : path === '/admin' ? (
            <Admin />
          ) : (
            <NotFound />
          )}
        </Suspense>
        </RecoveryBoundary>
      </Layout>
    </Provider>
  );
}
