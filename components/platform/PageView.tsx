import { useEffect } from 'react';
import { usePlatform } from './Context';
import { catalogHubForPath } from '../../domain/catalog-hubs';

let sent = false;
export default function PageView() {
  const { fa, products, loading } = usePlatform();
  useEffect(() => {
    const route = location.pathname.replace(/\/+$/, '') || '/';
    const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (
      loading ||
      sent ||
      window.parent !== window ||
      navigator.doNotTrack === '1' ||
      privacy.globalPrivacyControl ||
      new URLSearchParams(location.search).get('preview') === '1'
    )
      return;
    let slug = '';
    try {
      slug = decodeURIComponent(route.slice(9));
    } catch {
      return;
    }
    const valid =
      ['/', '/catalog', '/engineering'].includes(route) ||
      catalogHubForPath(route) ||
      (route.startsWith('/product/') &&
        products.some((product) => product.slug === slug));
    if (!valid) return;
    const report = () => {
      if (sent || document.visibilityState !== 'visible') return;
      sent = true;
      void fetch('/api/analytics/pageview', {
        method: 'POST',
        credentials: 'omit',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: route, language: fa ? 'fa' : 'en' }),
      }).catch(() => {
        /* Statistics must never interrupt the public website. */
      });
    };
    report();
    document.addEventListener('visibilitychange', report);
    return () => document.removeEventListener('visibilitychange', report);
  }, [fa, products, loading]);
  return null;
}
