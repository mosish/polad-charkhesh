import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import net from 'node:net';

const root = process.cwd();
const serverFile = path.join(root, 'dist/server/index.js');
const clientFile = path.join(root, 'dist/client/index.html');
assert.ok(existsSync(serverFile) && existsSync(clientFile), 'Run pnpm build before the production smoke check.');

const tempRoot = mkdtempSync(path.join(tmpdir(), 'polad-production-smoke-'));
const setupToken = randomBytes(32).toString('hex');
const port = await new Promise<number>((resolve, reject) => {
  const listener = net.createServer();
  listener.once('error', reject);
  listener.listen(0, '127.0.0.1', () => {
    const address = listener.address();
    assert.ok(address && typeof address !== 'string');
    listener.close(() => resolve(address.port));
  });
});
const child = spawn(process.execPath, [serverFile], {
  cwd: root,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    TEST_IMPORT: '',
    HOST: '127.0.0.1',
    PORT: String(port),
    DATABASE_PATH: path.join(tempRoot, 'platform.sqlite'),
    UPLOAD_DIR: path.join(tempRoot, 'uploads'),
    SESSION_SECRET: randomBytes(32).toString('hex'),
    COOKIE_SECRET: randomBytes(32).toString('hex'),
    SETUP_TOKEN: setupToken,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '';
for (const stream of [child.stdout, child.stderr]) {
  stream.on('data', (chunk) => {
    serverOutput = (serverOutput + String(chunk)).slice(-2000);
  });
}

function request(route: string, host = 'poladcharkhesh.com', options: { method?: string; body?: unknown; cookie?: string } = {}) {
  return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }>((resolve, reject) => {
    const body = options.body === undefined ? undefined : JSON.stringify(options.body);
    const req = http.request(
      {
        hostname: '127.0.0.1', port, path: route, method: options.method || 'GET',
        headers: {
          Host: host,
          ...(body === undefined ? {} : { Origin: 'https://' + host, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }),
          ...(options.cookie ? { Cookie: options.cookie } : {}),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => resolve({
          status: res.statusCode || 0,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf8'),
        }));
      },
    );
    req.once('error', reject);
    req.end(body);
  });
}

async function ready() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline && child.exitCode === null) {
    try {
      const response = await request('/api/health');
      if (response.status === 200 && JSON.parse(response.body).status === 'ok') return;
    } catch {
      // The production server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error('Production server did not become healthy. ' + serverOutput);
}

try {
  const unsafeStartup = spawnSync(process.execPath, [serverFile], {
    cwd: root,
    env: { ...process.env, NODE_ENV: 'production', DATABASE_PATH: './relative.sqlite' },
    encoding: 'utf8',
    timeout: 5000,
  });
  assert.notEqual(unsafeStartup.status, 0, 'Production should reject a relative database path.');
  assert.match(unsafeStartup.stderr, /DATABASE_PATH must be an absolute persistent path/);
  const shortSecretStartup = spawnSync(process.execPath, [serverFile], {
    cwd: root,
    env: {
      ...process.env, NODE_ENV: 'production', DATABASE_PATH: path.join(tempRoot, 'weak.sqlite'),
      UPLOAD_DIR: path.join(tempRoot, 'weak-uploads'), SESSION_SECRET: 'short', COOKIE_SECRET: 'short', SETUP_TOKEN: setupToken,
    },
    encoding: 'utf8', timeout: 5000,
  });
  assert.notEqual(shortSecretStartup.status, 0, 'Production should reject weak secrets.');
  assert.match(shortSecretStartup.stderr, /at least 32 characters/);
  const missingSetupStartup = spawnSync(process.execPath, [serverFile], {
    cwd: root,
    env: {
      ...process.env, NODE_ENV: 'production', DATABASE_PATH: path.join(tempRoot, 'no-setup.sqlite'),
      UPLOAD_DIR: path.join(tempRoot, 'no-setup-uploads'),
      SESSION_SECRET: randomBytes(32).toString('hex'), COOKIE_SECRET: randomBytes(32).toString('hex'), SETUP_TOKEN: '',
    },
    encoding: 'utf8', timeout: 5000,
  });
  assert.notEqual(missingSetupStartup.status, 0, 'A new production site should require a setup token.');
  assert.match(missingSetupStartup.stderr, /SETUP_TOKEN must contain at least 24 characters/);
  await ready();
  const home = await request('/');
  assert.equal(home.status, 200, 'English homepage');
  assert.match(home.body, /<html lang="en" dir="ltr">/);
  assert.match(home.body, /rel="canonical" href="https:\/\/poladcharkhesh\.com\/"/);
  assert.ok(home.headers['strict-transport-security'], 'HSTS header');
  assert.ok(home.headers['content-security-policy'], 'Content security policy');

  const persian = await request('/', 'poladcharkhesh.ir');
  assert.equal(persian.status, 200, 'Persian homepage');
  assert.match(persian.body, /<html lang="fa" dir="rtl">/);
  assert.match(persian.body, /rel="canonical" href="https:\/\/poladcharkhesh\.ir\/"/);

  for (const route of ['/catalog', '/catalog/', '/engineering', '/engineering/', '/admin', '/admin/']) {
    const response = await request(route);
    assert.equal(response.status, 200, `${route} should open`);
    if (route.startsWith('/admin')) assert.match(response.body, /noindex,nofollow/);
  }
  const assets = home.body.match(/src="(\/assets\/[^"]+\.js)"/);
  assert.ok(assets, 'Built JavaScript asset');
  const builtAsset = await request(assets[1]);
  assert.equal(builtAsset.status, 200, 'Built asset is served');
  assert.match(String(builtAsset.headers['cache-control']), /immutable/);
  assert.equal((await request('/brand/logo.png')).status, 200, 'Company logo is served');
  assert.equal((await request('/fonts/IRANSans.ttf')).status, 200, 'Company typeface is served');

  const catalog = await request('/api/products');
  assert.equal(catalog.status, 200, 'Public product API');
  const products = JSON.parse(catalog.body).products;
  assert.ok(products.length >= 68, 'Seeded product catalog');
  const product = await request('/product/' + encodeURIComponent(products[0].slug));
  assert.equal(product.status, 200, 'Product page');
  assert.match(product.body, /"@type":"Product"/);
  assert.equal((await request('/product/' + encodeURIComponent(products[0].slug) + '/')).status, 200, 'Product trailing slash');

  const missing = await request('/missing-page');
  assert.equal(missing.status, 404, 'Unknown pages return 404');
  assert.match(missing.body, /noindex,nofollow/);
  assert.equal((await request('/api/system/backup')).status, 401, 'Backup stays protected');
  const setup = await request('/api/auth/setup', 'poladcharkhesh.com', {
    method: 'POST', body: { username: 'smoke-admin', password: randomBytes(24).toString('hex'), setupToken },
  });
  assert.equal(setup.status, 201, 'First administrator can be created in production');
  const cookieHeader = setup.headers['set-cookie']?.[0] || '';
  assert.match(cookieHeader, /HttpOnly/i);
  assert.match(cookieHeader, /Secure/i);
  assert.match(cookieHeader, /SameSite=Strict/i);
  const sessionCookie = cookieHeader.split(';')[0];
  assert.equal((await request('/api/system/status', 'poladcharkhesh.com', { cookie: sessionCookie })).status, 200, 'Administrator can access protected status');
  const savedContent = JSON.parse((await request('/api/content')).body).data;
  const editedContent = { ...savedContent, hero: { ...savedContent.hero, titleEn: 'Production smoke title' } };
  assert.equal((await request('/api/content', 'poladcharkhesh.com', { method: 'PUT', body: editedContent, cookie: sessionCookie })).status, 200, 'Administrator can save website content');
  assert.equal(JSON.parse((await request('/api/content')).body).data.hero.titleEn, 'Production smoke title', 'Saved content is public');

  const editedProduct = { ...products[0], descriptionEn: 'Production smoke product description.' };
  assert.equal((await request('/api/products/' + encodeURIComponent(editedProduct.id), 'poladcharkhesh.com', { method: 'PUT', body: editedProduct, cookie: sessionCookie })).status, 200, 'Administrator can save product data');
  assert.equal(JSON.parse((await request('/api/products/' + encodeURIComponent(editedProduct.id))).body).product.descriptionEn, editedProduct.descriptionEn);

  const inquiry = await request('/api/inquiries', 'poladcharkhesh.com', { method: 'POST', body: { name: 'Smoke test', phone: '+12025550123', message: 'Temporary production inquiry.' } });
  assert.equal(inquiry.status, 201, 'Public inquiry can be saved');
  const inquiryId = JSON.parse(inquiry.body).id;
  assert.equal((await request('/api/inquiries/' + inquiryId, 'poladcharkhesh.com', { method: 'PATCH', body: { status: 'reviewed' }, cookie: sessionCookie })).status, 200, 'Administrator can review an inquiry');
  assert.equal(JSON.parse((await request('/api/inquiries', 'poladcharkhesh.com', { cookie: sessionCookie })).body).inquiries.find((item: { id: string }) => item.id === inquiryId).status, 'reviewed');

  const upload = await request('/api/media', 'poladcharkhesh.com', {
    method: 'POST', cookie: sessionCookie,
    body: { name: 'smoke.png', mime: 'image/png', base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y0EtOYAAAAASUVORK5CYII=' },
  });
  assert.equal(upload.status, 201, 'Administrator can upload media');
  const uploadUrl = JSON.parse(upload.body).media.url;
  assert.equal((await request(uploadUrl)).status, 200, 'Uploaded media is served');
  assert.equal((await request('/api/system/backup', 'poladcharkhesh.com', { cookie: sessionCookie })).status, 200, 'Administrator can export metadata backup');
  assert.equal((await request('/api/auth/logout', 'poladcharkhesh.com', { method: 'POST', body: {}, cookie: sessionCookie })).status, 200, 'Administrator can sign out');
  assert.equal((await request('/api/system/status', 'poladcharkhesh.com', { cookie: sessionCookie })).status, 401, 'Signed-out session is revoked');
  assert.match((await request('/robots.txt')).body, /Disallow: \/admin/);
  assert.match((await request('/sitemap.xml')).body, /https:\/\/poladcharkhesh\.com\/product\//);
  console.log('Production smoke check passed: pages, assets, metadata, admin setup, product/content edits, inquiry, media, backup and logout.');
} finally {
  if (child.exitCode === null && child.signalCode === null) {
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => child.kill('SIGKILL'), 3000);
      child.once('exit', () => {
        clearTimeout(timer);
        resolve();
      });
      child.kill('SIGTERM');
    });
  }
  const resolved = path.resolve(tempRoot);
  assert.ok(path.dirname(resolved) === path.resolve(tmpdir()) && path.basename(resolved).startsWith('polad-production-smoke-'));
  rmSync(resolved, { recursive: true, force: true });
}
