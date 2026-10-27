import type { BearingProduct } from '../domain/product';
import type { CompanyContactInfo } from '../domain/company';
import { metadataFor, pageUrl, upgradeSeo, type PublishedSeoContent } from '../domain/seo';
import { initialPublicHtml } from '../api/seo-html';
import { publicPagePaths } from '../domain/catalog-hubs';

export interface PublicSeoSnapshot {
  products: BearingProduct[];
  company: CompanyContactInfo;
  content: PublishedSeoContent;
  seo: unknown;
}
export interface SeoIssue { route: string; language: string; issue: string }
const text = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const unfinished = /\blorem ipsum\b|\bcoming soon\b|\byour company\b|\b(?:TODO|TBD)\b|example\.com|در دست ساخت|متن آزمایشی/i;

/** Read-only validation of the exact published snapshot used for initial HTML. */
export function auditPublishedSeo(snapshot: PublicSeoSnapshot) {
  const products = snapshot.products.filter(p => !p.isArchived);
  const seo = upgradeSeo(snapshot.seo);
  const routes = [...publicPagePaths(), ...products.map(p => '/product/' + p.slug)];
  const issues: SeoIssue[] = [];
  for (const fa of [false, true]) {
    const titles = new Map<string, string>(), headings = new Map<string, string>();
    for (const route of routes) {
      const product = products.find(p => route === '/product/' + p.slug);
      const data = metadataFor(route, fa, seo, snapshot.company, product, snapshot.content, products);
      const html = initialPublicHtml(route, fa, { ...snapshot, products, seo, hostname: new URL(seo[fa ? 'domainFa' : 'domainEn']).hostname }, data.missing, product);
      const report = (issue: string) => issues.push({ route, language: fa ? 'fa' : 'en', issue });
      for (const [value, label, seen] of [[data.title, 'title', titles], [text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] || ''), 'H1', headings]] as const) {
        if (!value.trim()) report(`Missing ${label}`);
        else if (seen.has(value)) report(`Duplicate ${label} with ${seen.get(value)}`);
        seen.set(value, route);
      }
      if ((html.match(/<h1\b/g) || []).length !== 1) report('Expected exactly one H1');
      if (!data.description.trim()) report('Missing meta description');
      if (data.canonical !== pageUrl(route, seo, fa)) report('Canonical mismatch');
      if (data.missing || data.privatePage) report('Published page is not indexable');
      if (unfinished.test(text(html) + ' ' + data.title + ' ' + data.description)) report('Unfinished public copy');
      for (const image of html.matchAll(/<img\b[^>]*>/g)) {
        if (!/\balt="[^"]+"/.test(image[0])) report('Product image is missing descriptive alt text');
      }
      for (const anchor of html.matchAll(/<a\b[^>]*href="([^"]*)"/g)) {
        const url = anchor[1];
        if (url === '#') report('Empty or invalid destination');
        const target = new URL(url, pageUrl(route, seo, fa));
        if (![new URL(seo.domainEn).hostname, new URL(seo.domainFa).hostname].includes(target.hostname) || target.pathname.startsWith('/uploads/')) continue;
        const path = target.pathname;
        if (!routes.includes(decodeURI(path)) && !/\.(pdf|png|jpe?g|webp|svg)$/i.test(path)) report(`Broken internal page link: ${path}`);
      }
    }
  }
  return { products: products.length, pages: routes.length, languageVariants: routes.length * 2, issues };
}
