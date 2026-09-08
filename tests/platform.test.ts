import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { basicLife, calculate } from '../lib/engineering';
import { bearingProducts } from '../domain/catalog';
import { validateProduct, validateSettings } from '../api/validation';
process.env.TEST_IMPORT = '1';
process.env.DATABASE_PATH = path.join(
  mkdtempSync(path.join(tmpdir(), 'polad-test-')),
  'test.sqlite',
);
process.env.UPLOAD_DIR = path.join(
  path.dirname(process.env.DATABASE_PATH),
  'uploads',
);
let server: any,
  base: string,
  cookie = '',
  database: any;
before(async () => {
  const { app } = await import('../api/index');
  database = await import('../api/database');
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = 'http://127.0.0.1:' + server.address().port;
});
after(() => {
  server?.close();
  database?.db.close();
});
async function req(
  url: string,
  method = 'GET',
  body?: any,
  auth = true,
  extra: any = {},
) {
  const r = await fetch(base + '/api' + url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && cookie ? { Cookie: cookie } : {}),
      ...extra,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { r, b: await r.json() };
}
test('catalog baseline preserves all 68 canonical identities and engineering values', async () => {
  assert.equal(bearingProducts.length, 68);
  const { b } = await req('/products');
  assert.equal(b.count, 68);
  for (const p of bearingProducts)
    assert.deepEqual(
      b.products.find((v: any) => v.id === p.id),
      p,
    );
});
test('server rejects invalid dimensions, incomplete numbers and unsafe fields', () => {
  const p = bearingProducts[0];
  assert.ok(validateProduct({ ...p, d: 50, D: 20 }).length);
  assert.ok(validateProduct({ ...p, d: undefined }).length);
  assert.ok(validateProduct({ ...p, calculationFactorX: Infinity }).length);
  assert.ok(
    validateProduct({ ...p, technicalSources: [{ manufacturer: 'x' }] }).length,
  );
  assert.ok(validateProduct({ ...p, imageUrl: 'javascript:alert(1)' }).length);
  assert.ok(validateProduct({ ...p, password_hash: 'x' }).length);
});
test('production canonical settings reject localhost and non-HTTPS', () => {
  assert.ok(
    validateSettings('seo', {
      domainEn: 'http://localhost',
      domainFa: 'https://poladcharkhesh.ir',
    }).length,
  );
  assert.deepEqual(
    validateSettings('seo', {
      domainEn: 'https://poladcharkhesh.com',
      domainFa: 'https://poladcharkhesh.ir',
    }),
    [],
  );
});
test('basic ball and roller life regression; invalid input rejected', () => {
  assert.equal(basicLife(10, 1, 1000, false).L10, 1000);
  assert.ok(
    Math.abs(basicLife(10, 1, 1000, false).hours - 16666.6666667) < 0.001,
  );
  assert.ok(Math.abs(basicLife(10, 1, 1000, true).L10 - 2154.43469) < 0.001);
  assert.throws(() => basicLife(10, 0, 1000, false));
  assert.throws(() => basicLife(10, 1, 0, false));
});
test('family restrictions prevent misleading outputs', () => {
  const nu = bearingProducts.find((p) => p.schematicType === 'cylindrical')!;
  assert.throws(() => calculate(nu, 2, 1, 1500));
  const thrust = bearingProducts.find((p) => p.schematicType === 'thrust')!;
  assert.throws(() => calculate(thrust, 1, 2, 1500));
  const tapered = bearingProducts.find((p) => p.schematicType === 'tapered')!;
  assert.throws(() => calculate(tapered, 2, 1, 1500));
  const seal = bearingProducts.find((p) => p.category === 'seal')!;
  assert.throws(() => calculate(seal, 2, 0, 1500));
  const ball = bearingProducts[0],
    r = calculate(ball, 2, 0, 1500, 95);
  assert.equal(r.P, 2);
  assert.equal(r.exponent, 3);
  assert.equal(r.adjustedHours, r.hours * 0.64);
  const sph = bearingProducts.find((p) => p.schematicType === 'spherical')!;
  assert.throws(() =>
    calculate({ ...sph, calculationFactorY1: undefined }, 2, 1, 1500),
  );
});
test('unauthorized API, CSRF and malformed payload defenses', async () => {
  assert.equal(
    (await req('/products', 'POST', bearingProducts[0], false)).r.status,
    401,
  );
  assert.equal(
    (await req('/system/backup', 'GET', undefined, false)).r.status,
    401,
  );
  assert.equal((await req('/company', 'PUT', {}, false)).r.status, 401);
  assert.equal(
    (
      await req(
        '/auth/login',
        'POST',
        { username: 'x', password: 'x' },
        false,
        { Origin: 'https://attacker.example' },
      )
    ).r.status,
    403,
  );
  assert.equal(
    (await req('/products', 'POST', JSON.parse('{"__proto__":{}}'), false)).r
      .status,
    400,
  );
});
test('secure provisioning, session issuance, CRUD, archive, restore and role enforcement', async () => {
  const setup = await req(
    '/auth/setup',
    'POST',
    { username: 'test_admin', password: 'test-only-strong-passphrase' },
    false,
  );
  assert.equal(setup.r.status, 201);
  const c = setup.r.headers.get('set-cookie')!;
  assert.ok(c.includes('HttpOnly'));
  assert.ok(c.includes('SameSite=Strict'));
  cookie = c.split(';')[0];
  assert.equal((await req('/auth/status')).b.user.role, 'superadmin');
  assert.equal(
    (
      await req(
        '/auth/setup',
        'POST',
        { username: 'another', password: 'test-only-passphrase' },
        false,
      )
    ).r.status,
    403,
  );
  const original = bearingProducts[0];
  const created = await req('/products', 'POST', {
    ...original,
    code: 'QA-TEST-6204',
    slug: 'qa-test-6204',
    calculationFactorX: 0.56,
    contactAngle: '15°',
  });
  assert.equal(created.r.status, 201);
  const id = created.b.product.id;
  assert.equal(
    (await req('/products/' + id)).b.product.calculationFactorX,
    0.56,
  );
  assert.equal((await req('/products/' + id)).b.product.contactAngle, '15°');
  const duplicate = await req('/products', 'POST', {
    ...original,
    code: 'QA-TEST-6204',
    slug: 'duplicate-qa',
  });
  assert.equal(duplicate.r.status, 409);
  assert.equal((await req('/products/' + id, 'PUT', { d: 99 })).r.status, 400);
  assert.equal(
    (await req('/products/' + id, 'PUT', { nameEn: 'QA updated' })).r.status,
    200,
  );
  assert.equal((await req('/products/' + id, 'PATCH', {})).r.status, 404);
  assert.equal(
    (await req('/products/' + id + '/archive', 'PATCH', {})).b.product
      .isArchived,
    true,
  );
  assert.equal(
    (await req('/products/' + id, 'GET', undefined, false)).r.status,
    404,
  );
  assert.equal(
    (await req('/products/' + id + '/archive', 'PATCH', {})).b.product
      .isArchived,
    false,
  );
  database.db
    .prepare('UPDATE admins SET role=? WHERE username=?')
    .run('editor', 'test_admin');
  assert.equal(
    (await req('/system/restore', 'POST', { confirm: 'RESTORE', backup: {} })).r
      .status,
    403,
  );
  assert.equal(
    (await req('/products/' + id, 'DELETE', { confirm: 'QA-TEST-6204' })).r
      .status,
    403,
  );
  database.db
    .prepare('UPDATE admins SET role=? WHERE username=?')
    .run('superadmin', 'test_admin');
  await req('/products/' + id + '/archive', 'PATCH', {});
  assert.equal(
    (await req('/products/' + id, 'DELETE', { confirm: 'wrong' })).r.status,
    400,
  );
  assert.equal(
    (await req('/products/' + id, 'DELETE', { confirm: 'QA-TEST-6204' })).r
      .status,
    200,
  );
});
test('inquiry persistence, status changes and upload validation', async () => {
  const invalid = await req(
    '/inquiries',
    'POST',
    { name: 'A', phone: '123', message: 'short' },
    false,
  );
  assert.equal(invalid.r.status, 400);
  const r = await req(
    '/inquiries',
    'POST',
    {
      name: 'Test engineer',
      phone: '+1 202 555 0100',
      company: 'QA fixture',
      email: 'qa@example.com',
      message: 'Local test inquiry for bearing selection.',
    },
    false,
  );
  assert.equal(r.r.status, 201);
  assert.equal((await req('/inquiries')).b.inquiries.length, 1);
  assert.equal(
    (await req('/inquiries/' + r.b.id, 'PATCH', { status: 'contacted' })).r
      .status,
    200,
  );
  assert.equal(
    (await req('/inquiries/' + r.b.id, 'PATCH', { status: 'invalid' })).r
      .status,
    400,
  );
  assert.equal(
    (
      await req('/media', 'POST', {
        name: 'x.png',
        mime: 'image/png',
        base64: Buffer.from('<svg>bad</svg>').toString('base64'),
      })
    ).r.status,
    400,
  );
});
test('backup omits secrets, validates restore, snapshots and transactions roll back', async () => {
  const backup = (await req('/system/backup')).b;
  assert.equal(backup.products.length, 68);
  const text = JSON.stringify(backup);
  assert.ok(!text.includes('password_hash'));
  assert.ok(!text.includes('token_hash'));
  assert.equal(
    (
      await req('/system/restore', 'POST', {
        confirm: 'RESTORE',
        backup: { ...backup, products: [{ ...backup.products[0], D: 0 }] },
      })
    ).r.status,
    400,
  );
  assert.equal(
    (await req('/system/restore', 'POST', { confirm: 'RESTORE', backup })).r
      .status,
    200,
  );
  assert.equal(
    (
      database.db
        .prepare('SELECT count(*) n FROM backup_snapshots')
        .get() as any
    ).n,
    1,
  );
  assert.throws(() =>
    database.transaction(() => {
      database.db.prepare('DELETE FROM products').run();
      throw new Error('force rollback');
    }),
  );
  assert.equal(database.allProducts().length, 68);
});
test('password change revokes all sessions, login and logout revoke cookies', async () => {
  const changed = await req('/auth/change-password', 'POST', {
    currentPassword: 'test-only-strong-passphrase',
    newPassword: 'second-test-only-strong-passphrase',
  });
  assert.equal(changed.r.status, 200);
  assert.equal((await req('/system/backup')).r.status, 401);
  const wrong = await req(
    '/auth/login',
    'POST',
    { username: 'test_admin', password: 'test-only-strong-passphrase' },
    false,
  );
  assert.equal(wrong.r.status, 401);
  const login = await req(
    '/auth/login',
    'POST',
    { username: 'test_admin', password: 'second-test-only-strong-passphrase' },
    false,
  );
  assert.equal(login.r.status, 200);
  cookie = login.r.headers.get('set-cookie')!.split(';')[0];
  assert.equal((await req('/auth/logout', 'POST', {})).r.status, 200);
  assert.equal((await req('/system/backup')).r.status, 401);
});

test('website editor persists content, rejects unsafe layout/media and preserves legacy backups', async () => {
  const login = await req(
    '/auth/login',
    'POST',
    { username: 'test_admin', password: 'second-test-only-strong-passphrase' },
    false,
  );
  cookie = login.r.headers.get('set-cookie')!.split(';')[0];
  const original = (await req('/content')).b.data;
  assert.equal(original.media.heroPresentation, 'animation');
  assert.equal(original.layout.order.length, 9);
  assert.ok(Object.keys(original.copy).length > 200);
  const changed = structuredClone(original);
  changed.media.heroPresentation = 'photo';
  changed.hero.titleEn = 'Saved editorial headline';
  changed.hero.titleFa = 'عنوان ویرایش‌شده';
  changed.layout.hidden = ['support'];
  changed.layout.order.reverse();
  changed.navigation.items[0].labelEn = 'Our components';
  changed.cards.industries[0].titleEn = 'Edited steel sector';
  changed.brand.accent = '#234567';
  const textId = Object.keys(changed.copy)[0];
  changed.copy[textId].en = 'Edited public label';
  changed.layout.custom.push({
    id: 'custom-test',
    titleEn: 'Custom section',
    titleFa: 'بخش سفارشی',
    descriptionEn: 'Plain <script> text stays text',
    descriptionFa: 'توضیح بخش',
    imageUrl: '/brand/logo.png',
    href: '/catalog',
    buttonEn: 'Browse',
    buttonFa: 'مشاهده',
    enabled: true,
  });
  changed.layout.order.push('custom-test');
  assert.equal((await req('/content', 'PUT', changed, false)).r.status, 401);
  assert.equal((await req('/content', 'PUT', changed)).r.status, 200);
  assert.deepEqual((await req('/content')).b.data, changed);
  const badLink = structuredClone(changed);
  const badPresentation = structuredClone(changed);
  badPresentation.media.heroPresentation = 'unknown';
  assert.equal((await req('/content', 'PUT', badPresentation)).r.status, 400);
  badLink.media.heroUrl = 'javascript:alert(1)';
  assert.equal((await req('/content', 'PUT', badLink)).r.status, 400);
  const badOrder = structuredClone(changed);
  badOrder.layout.order.push('hero');
  assert.equal((await req('/content', 'PUT', badOrder)).r.status, 400);
  const badText = structuredClone(changed);
  badText.copy[textId].en = { html: 'bad' };
  assert.equal((await req('/content', 'PUT', badText)).r.status, 400);
  assert.deepEqual((await req('/content')).b.data, changed);
  const backup = (await req('/system/backup')).b;
  await req('/content', 'PUT', original);
  assert.equal(
    (await req('/system/restore', 'POST', { confirm: 'RESTORE', backup })).r
      .status,
    200,
  );
  assert.equal(
    (await req('/content')).b.data.hero.titleEn,
    changed.hero.titleEn,
  );
  const legacy = structuredClone(backup);
  for (const k of [
    'brand',
    'layout',
    'media',
    'navigation',
    'links',
    'cards',
    'copy',
  ])
    delete legacy.content[k];
  assert.equal(
    (
      await req('/system/restore', 'POST', {
        confirm: 'RESTORE',
        backup: legacy,
      })
    ).r.status,
    200,
  );
  const restored = (await req('/content')).b.data;
  assert.equal(restored.media.heroPresentation, 'animation');
  assert.equal(restored.hero.titleEn, changed.hero.titleEn);
  assert.equal(restored.layout.order.length, 9);
  assert.equal(
    (
      await fetch(base + '/?preview=1', { headers: { Cookie: cookie } })
    ).headers.get('x-frame-options'),
    'SAMEORIGIN',
  );
  assert.equal(
    (await fetch(base + '/?preview=1')).headers.get('x-frame-options'),
    'DENY',
  );
  await req('/content', 'PUT', original);
});

test('local preview forwards same-origin writes and rejects foreign origins', async () => {
  const { createServer } = await import('vite');
  const preview = await createServer({
    configFile: path.resolve('vite.vps.config.ts'),
    server: { port: 15173, strictPort: false, open: false, proxy: { '/api': { target: base } } },
  });
  try {
    await preview.listen();
    const address = preview.httpServer!.address() as { port: number };
    const origin = `http://127.0.0.1:${address.port}`;
    const probe = (requestOrigin: string) => fetch(origin + '/api/origin-probe', {
      method: 'POST',
      headers: { Origin: requestOrigin, 'Content-Type': 'application/json' },
      body: '{}',
    });
    const sameOrigin = await probe(origin);
    assert.equal(sameOrigin.status, 404);
    assert.equal((await sameOrigin.json()).error, 'API route not found.');
    const foreignOrigin = await probe('https://unrelated.example');
    assert.equal(foreignOrigin.status, 403);
    assert.equal((await foreignOrigin.json()).error, 'Cross-origin request rejected.');
  } finally {
    await preview.close();
  }
});
