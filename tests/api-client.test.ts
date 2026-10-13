import { test } from 'node:test';
import assert from 'node:assert/strict';
import { api, ApiError } from '../lib/api';

void test('API client preserves credentials and JSON mutation payloads', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ saved: true }));
  assert.deepEqual(await api('/products/x', 'patch', { featured: false }), { saved: true });
  const [url, options] = fetch.mock.calls[0].arguments as unknown as [string, RequestInit];
  assert.equal(url, '/api/products/x');
  assert.equal(options.method, 'PATCH');
  assert.equal(options.credentials, 'include');
  assert.equal(options.body, '{"featured":false}');
});

void test('API client rejects malformed success responses instead of reporting a save', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<html>Proxy error</html>', { status: 200 }));
  await assert.rejects(api('/content', 'PUT', {}), /Unexpected server response/);
});

void test('API client handles JSON error variants and preserves useful server messages', async (t) => {
  for (const payload of [null, { error: {} }, { error: '' }, ['failure']]) {
    const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json(payload, { status: 403 }));
    await assert.rejects(api('/products'), /Request failed/);
    fetch.mock.restore();
  }
  t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'Your session has expired.' }, { status: 401 }));
  await assert.rejects(api('/products'), (error: unknown) => error instanceof ApiError
    && error.status === 401 && error.message === 'Your session has expired.');
});

void test('API client reports connection failures and supports a subsequent retry', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(api('/products'), /Connection unavailable/);
  fetch.mock.mockImplementation(async () => Response.json({ products: [] }));
  assert.deepEqual(await api('/products'), { products: [] });
});

void test('API client rejects bodies on reads without making a network request', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({}));
  for (const method of ['GET', 'get', 'HEAD'])
    await assert.rejects(api('/products', method, {}), /Read requests cannot contain a body/);
  assert.equal(fetch.mock.callCount(), 0);
  await api('/products');
  const options = fetch.mock.calls[0].arguments[1] as RequestInit;
  assert.equal(Object.hasOwn(options, 'body'), false);
});
