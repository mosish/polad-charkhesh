import React from 'react';
import { createRoot } from 'react-dom/client';
import Router from './Router';
import RecoveryBoundary, { PageRecovery } from '../components/platform/RecoveryBoundary';
import './globals.css';
import './platform.css';
import './liquid-glass.css';
import './seo.css';
import './catalog-refinement.css';
import './catalog-hubs.css';
import './hero-banner.css';
document.body.classList.add('liquid-glass');
// Keep the readable server HTML until the selected workspace is downloaded.
// Mounting its Suspense fallback first briefly placed the footer above results.
const route = location.pathname.replace(/\/+$/, '') || '/';
const workspace = route === '/catalog' || route.startsWith('/catalog/') ? import('../components/platform/Catalog')
  : route.startsWith('/product/') ? import('../components/platform/Product')
  : route === '/engineering' ? import('../components/platform/Engineering')
  : route === '/admin' ? import('../components/admin/Admin') : Promise.resolve();
const mount = (workspace?: NonNullable<Parameters<typeof Router>[0]>['workspace']) => createRoot(document.getElementById('root')!).render(<RecoveryBoundary fallback={<PageRecovery />}><Router workspace={workspace} /></RecoveryBoundary>);
void workspace.then(module => mount(module && 'default' in module ? module.default : undefined), () => mount());
