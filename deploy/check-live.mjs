#!/usr/bin/env node
// Read-only checks against a deployed HTTPS origin; never disables TLS validation.
import assert from 'node:assert/strict';

const origin = new URL(process.argv[2] || '');
assert.equal(origin.protocol, 'https:', 'Pass the deployed HTTPS origin.');
assert.equal(origin.username + origin.password, '', 'Do not put credentials in the URL.');
const request = async (path) => {
  const response = await fetch(new URL(path, origin), {signal: AbortSignal.timeout(20000)});
  return {status: response.status, headers: response.headers, body: await response.text()};
};
const health = await request('/api/health');
assert.equal(health.status, 200);
assert.equal(JSON.parse(health.body).status, 'ok');
const catalog = await request('/api/products');
assert.equal(catalog.status, 200);
const {products, count} = JSON.parse(catalog.body);
assert.equal(products.length, count);
assert.ok(count > 0, 'The deployed catalog is empty.');
const routes = ['/', '/catalog', '/engineering', ...products.map(p => '/product/' + encodeURIComponent(p.slug))];
const titles = {en: new Set(), fa: new Set()};
let checkedPages = 0;
const work = routes.flatMap(route => ['en', 'fa'].map(lang => ({route, lang})));
let next = 0;
await Promise.all(Array.from({length: 4}, async () => {
  while (next < work.length) {
    const {route, lang} = work[next++];
    const page = await request(route + '?lang=' + lang);
    assert.equal(page.status, 200, `${route} (${lang})`);
    assert.match(page.body, new RegExp(`<html lang="${lang}" dir="${lang === 'fa' ? 'rtl' : 'ltr'}"`));
    assert.match(page.body, /<h1\b/);
    assert.equal((page.body.match(/rel="canonical"/g) || []).length, 1);
    assert.match(page.body, /hreflang="fa"/);
    assert.match(page.body, /hreflang="en"/);
    assert.doesNotMatch(page.body, /password_hash|SESSION_SECRET|COOKIE_SECRET/);
    const title = page.body.match(/<title>([^<]+)<\/title>/)?.[1];
    assert.ok(title);
    assert.ok(!titles[lang].has(title), `Duplicate ${lang} title: ${route}`);
    titles[lang].add(title);
    checkedPages++;
  }
}));
for (const path of ['/admin', '/admin/', '/robots.txt', '/sitemap.xml', '/llms.txt', '/favicon.svg', '/asset-credits.html']) {
  assert.equal((await request(path)).status, 200, path);
}
assert.equal((await request('/deployment-check-missing-page')).status, 404);
for (const path of ['/api/system/status', '/api/system/backup', '/api/media', '/api/inquiries']) {
  assert.equal((await request(path)).status, 401, `Unauthenticated access: ${path}`);
}
const home = await request('/');
assert.match(home.headers.get('content-security-policy') || '', /frame-ancestors 'none'/);
assert.equal(home.headers.get('x-content-type-options'), 'nosniff');
assert.equal(home.headers.get('x-frame-options'), 'DENY');
assert.ok(home.headers.get('strict-transport-security'));
const assets = new Set(Array.from(home.body.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[^"<>]*)"/g), m => m[1])
  .filter(path => path.startsWith('/assets/') || /\.(svg|png|jpe?g|webp|woff2?)$/.test(path)));
for (const path of assets) assert.equal((await request(path)).status, 200, `Asset: ${path}`);
console.log(JSON.stringify({status:'passed', origin:origin.origin, products:count, pages:checkedPages,
  assets:assets.size, checks:['trusted TLS', 'health', 'both languages and all product pages',
    'unique titles and canonical/hreflang', 'admin routes', 'SEO files and custom 404',
    'unauthenticated private-API denial', 'security headers', 'referenced local assets'],
  limitations:['Does not authenticate as the owner or replace browser, accessibility or engineering-data review.'],
  checkedAt:new Date().toISOString()}, null, 2));
