import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { auth } from './auth';
import { products } from './products';
import { content } from './content';
import { system } from './system';
import { media, uploadDir } from './media';
import { cookieSecret, production, getUser } from './security';
import { safeObject } from './validation';
import { allProducts, setting, product } from './database';
export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ws:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  });
  if (production) res.set('Strict-Transport-Security', 'max-age=31536000');
  next();
});
app.use(cookieParser(cookieSecret));
app.use((req, res, next) => {
  if (req.method === 'GET' && req.query.preview === '1' && getUser(req)) {
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('Cache-Control', 'private, no-store');
    res.set(
      'Content-Security-Policy',
      String(res.getHeader('Content-Security-Policy')).replace(
        "frame-ancestors 'none'",
        "frame-ancestors 'self'",
      ),
    );
  }
  next();
});
app.use(express.json({ limit: '12mb' }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!safeObject(req.body))
    return res.status(400).json({ error: 'Invalid request structure.' });
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.get('origin');
    if (origin) {
      let hostname;
      try {
        hostname = new URL(origin).host;
      } catch {
        return res.status(403).json({ error: 'Invalid origin.' });
      }
      if (hostname !== req.get('host'))
        return res
          .status(403)
          .json({ error: 'Cross-origin request rejected.' });
    }
    if (!req.is('application/json'))
      return res.status(415).json({ error: 'JSON content type required.' });
  }
  next();
});
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api', content);
app.use('/api/system', system);
app.use('/api/media', media);
app.use('/api', (_req, res) =>
  res.status(404).json({ error: 'API route not found.' }),
);
app.use(
  '/uploads',
  express.static(uploadDir, {
    setHeaders: (res, file) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (file.endsWith('.pdf'))
        res.setHeader('Content-Disposition', 'attachment');
    },
  }),
);
const escape = (s: any) =>
  String(s || '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
app.get('/robots.txt', (_req, res) =>
  res.type('text').send('User-agent: *\nDisallow: /admin\nDisallow: /api/\n'),
);
app.get('/sitemap.xml', (req, res) => {
  const seo = setting('seo'),
    origin = req.hostname.endsWith('.ir') ? seo.domainFa : seo.domainEn;
  res
    .type('xml')
    .send(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        [
          '/',
          '/catalog',
          '/engineering',
          ...allProducts().map((p) => '/product/' + p.slug),
        ]
          .map((p) => '<url><loc>' + escape(origin + p) + '</loc></url>')
          .join('') +
        '</urlset>',
    );
});
if (production) {
  app.use(
    '/assets',
    express.static(path.resolve('dist/client/assets'), {
      immutable: true,
      maxAge: '1y',
    }),
  );
  app.use(express.static(path.resolve('dist/client'), { index: false }));
  app.get('/{*path}', (req, res) => {
    const routePath = req.path === '/' ? '/' : req.path.replace(/\/+$/, '');
    let productSlug = '';
    if (routePath.startsWith('/product/')) {
      try {
        productSlug = decodeURIComponent(routePath.slice(9));
      } catch {
        // Malformed product URLs are missing pages, not server errors.
      }
    }
    const p = productSlug ? product(productSlug) : null;
    const missing = routePath.startsWith('/product/')
      ? !p || p.isArchived
      : !['/', '/catalog', '/engineering', '/admin'].includes(routePath);
    const fa =
      req.query.lang === 'fa' ||
      (req.query.lang !== 'en' && req.hostname.endsWith('.ir'));
    const seo = setting('seo'),
      company = setting('company'),
      suffix = fa ? 'Fa' : 'En',
      base = seo['domain' + suffix];
    const title = missing
        ? fa
          ? 'صفحه یافت نشد'
          : 'Page not found'
        : p
          ? p['metaTitle' + suffix] || p['name' + suffix]
          : seo['title' + suffix],
      description = p ? p['description' + suffix] : seo['description' + suffix];
    let html = readFileSync(path.resolve('dist/client/index.html'), 'utf8')
      .replace(
        '<html lang="en">',
        `<html lang="${fa ? 'fa' : 'en'}" dir="${fa ? 'rtl' : 'ltr'}">`,
      )
      .replace(/<title>.*?<\/title>/s, `<title>${escape(title)}</title>`)
      .replace(
        /<meta name="description"[^>]*>/,
        `<meta name="description" content="${escape(description)}"/>`,
      );
    const json = p
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p['name' + suffix],
          sku: p.code,
          mpn: p.code,
          description,
          category: p.category,
          additionalProperty: ['d', 'D', 'B', 'crKn', 'corKn'].map((k) => ({
            '@type': 'PropertyValue',
            name: k,
            value: p[k],
            unitText: ['d', 'D', 'B'].includes(k) ? 'mm' : 'kN',
          })),
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: company['name' + suffix],
          telephone: company.primaryPhone,
          email: company.email,
          address: company['address' + suffix],
        };
    html = html.replace(
      '</head>',
      `<link rel="canonical" href="${escape(base + routePath)}"/><link rel="alternate" hreflang="en" href="${escape(seo.domainEn + routePath)}"/><link rel="alternate" hreflang="fa" href="${escape(seo.domainFa + routePath)}"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(description)}"/><meta property="og:url" content="${escape(base + routePath)}"/><meta name="twitter:card" content="summary"/>${routePath === '/admin' || missing ? '<meta name="robots" content="noindex,nofollow"/>' : ''}<script type="application/ld+json">${JSON.stringify(json).replace(/</g, '\\u003c')}</script></head>`,
    );
    res.set(
      'Cache-Control',
      routePath === '/admin' || missing ? 'no-store' : 'no-cache',
    );
    res.status(missing ? 404 : 200).send(html);
  });
}
app.use((err: any, _req: any, res: any, _next: any) => {
  if (
    err?.code?.startsWith('ERR_SQLITE') ||
    String(err.message).includes('UNIQUE constraint')
  )
    return res
      .status(409)
      .json({ error: 'A record with this code or URL already exists.' });
  res.status(err.status === 413 ? 413 : err.status === 400 ? 400 : 500).json({
    error:
      err.status === 413
        ? 'Request too large.'
        : err.status === 400
          ? 'Malformed JSON.'
          : 'Unable to complete the request.',
  });
});
if (!process.env.TEST_IMPORT)
  app.listen(
    Number(process.env.PORT) || 3001,
    process.env.HOST || '127.0.0.1',
    () =>
      console.log(
        'Polad Charkhesh API ready on http://127.0.0.1:' +
          (process.env.PORT || 3001),
      ),
  );
