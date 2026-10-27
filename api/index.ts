import { metadataFor, metadataHead, pageUrl, languageFor, escapeHtml, jsonForHtml } from '../domain/seo';
import { initialPublicHtml } from './seo-html';
import { llmsText } from '../domain/llms';
import express, { type ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { auth } from './auth';
import { products } from './products';
import { content } from './content';
import { system } from './system';
import { media, uploadDir } from './media';
import { cookieSecret, production, getUser, cleanupSecurityState } from './security';
import { safeObject } from './validation';
import { allProducts, setting, product, db } from './database';
import { publicError } from './http-errors';
import { accessBoundary } from './access';
import { indexingEnabled } from './indexing';
import { compactPublicContent } from '../lib/public-snapshot';
export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 'loopback');
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy':
      `default-src 'self'; script-src 'self'${production ? '' : " 'unsafe-inline'"}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'${production ? '' : ' ws:'}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`,
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-Robots-Tag': 'noindex, nofollow',
  });
  if (production) res.set('Strict-Transport-Security', 'max-age=31536000');
  next();
});
app.use(cookieParser(cookieSecret));
app.use(accessBoundary);
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
// Browser clients send plain JSON; reject compressed request bodies before
// allocating a decompression stream (GHSA-27r3-jxmh-p828 defense in depth).
app.use(express.json({ limit: '12mb', inflate: false }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!safeObject(req.body))
    return res.status(400).json({ error: 'Invalid request structure.' });
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.get('origin');
    if (origin) {
      let expectedOrigin;
      try {
        expectedOrigin = new URL(origin).origin;
      } catch {
        return res.status(403).json({ error: 'Invalid origin.' });
      }
      if (expectedOrigin !== `${req.protocol}://${req.get('host')}`)
        return res
          .status(403)
          .json({ error: 'Cross-origin request rejected.' });
    }
    if (!req.is('application/json'))
      return res.status(415).json({ error: 'JSON content type required.' });
  }
  next();
});
app.get('/api/health', (_req, res) => {
  try {
    db.prepare('SELECT id FROM products LIMIT 1').get();
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
});
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
app.get('/llms.txt', (req, res) => {
  res.set('Cache-Control', 'no-cache').type('text/plain').send(
    llmsText(setting('seo'), setting('company'), languageFor(req.hostname, req.url.split('?')[1] || '')),
  );
});
app.get('/robots.txt', (req, res) => {
  const seo = setting('seo');
  res.type('text/plain').send(indexingEnabled
    ? 'User-agent: *\nDisallow: /api/\nDisallow: /admin/\nSitemap: ' + pageUrl('/sitemap.xml', seo, languageFor(req.hostname)) + '\n'
    : 'User-agent: *\nDisallow: /\n');
});
app.get('/sitemap.xml', (req, res) => {
  const seo = setting('seo'), fa = languageFor(req.hostname);
  const routes = ['/', '/catalog', '/engineering', ...allProducts().map((p) => '/product/' + p.slug)];
  res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
    + routes.map((route) => '<url><loc>' + escapeHtml(pageUrl(route, seo, fa)) + '</loc>'
      + [['en', false], ['fa', true], ['x-default', false]].map(([lang, persian]) => '<xhtml:link rel="alternate" hreflang="' + lang + '" href="' + escapeHtml(pageUrl(route, seo, Boolean(persian))) + '"/>').join('') + '</url>').join('') + '</urlset>');
});
if (production) {
  for(const folder of ['fonts','reference-images/optimized']){
    app.use('/'+folder,express.static(path.resolve('dist/client',folder),{
      setHeaders(res,file){
        if(/-[a-f0-9]{12}(?:-\d+)?\.(woff2|webp|jpg|png)$/.test(file))res.setHeader('Cache-Control','public, max-age=31536000, immutable');
      },
    }));
  }
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
    const fa = languageFor(req.hostname, req.url.split('?')[1] || '');
    const seo = setting('seo'), company = setting('company'), content = setting('content'), products = allProducts();
    const data = metadataFor(routePath, fa, seo, company, p ?? undefined, content, products, req.url.split('?')[1] || '');
    if (!indexingEnabled) data.robots = 'noindex,nofollow';
    let html = readFileSync(path.resolve('dist/client/index.html'), 'utf8')
      .replace('<html lang="en">', `<html lang="${fa ? 'fa' : 'en'}" dir="${fa ? 'rtl' : 'ltr'}">`)
      .replace(/<title>.*?<\/title>/s, '')
      .replace(/<meta name="description"[^>]*>/, '')
      .replace('</head>', metadataHead(data) + '</head>');
    html = html.replace('<div id="root"></div>', '<div id="root">' + initialPublicHtml(routePath, fa, { company, content, products }, data.missing, p ?? undefined) + '</div>');
    // Published records are preserved; only the copy dictionary is language-scoped.
    // No account, draft, session, archived product or inquiry data is embedded.
    if (!data.privatePage) html = html.replace('</body>', `<script id="public-data" type="application/json">${jsonForHtml({ company, ...compactPublicContent(content, fa), products, seo, fa, indexingEnabled })}</script></body>`);
    res.set('Cache-Control', data.privatePage ? 'private, no-store' : 'no-cache');
    res.set('X-Robots-Tag', data.robots.startsWith('index,follow') ? 'index, follow' : 'noindex, nofollow');
    res.status(data.missing ? 404 : 200).send(html);
  });
}
const handleError: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  const result = publicError(err);
  if (result.status === 503) res.set('Retry-After', '5');
  // Do not log request bodies, passwords, cookies or database contents.
  if (result.status >= 500) console.error('Request failed:', err instanceof Error ? err.name : 'UnknownError');
  res.status(result.status).json({ error: result.error });
};
app.use(handleError);
if (!process.env.TEST_IMPORT) {
  cleanupSecurityState();
  const cleanupTimer = setInterval(cleanupSecurityState, 3600_000);
  cleanupTimer.unref();
  const server = app.listen(
    Number(process.env.PORT) || 3001,
    process.env.HOST || '127.0.0.1',
    () =>
      console.log(
        'Polad Charkhesh Arian Tech API ready on http://127.0.0.1:' +
          (process.env.PORT || 3001),
      ),
  );
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => process.exit(1), 10_000);
    deadline.unref();
    server.close((error) => {
      clearTimeout(deadline);
      db.close();
      process.exit(error ? 1 : 0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
