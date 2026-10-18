import { test } from 'node:test';
import assert from 'node:assert/strict';
import { updateEditorPath, readEditorPath, textValue, stringList } from '../lib/editor-path';
import { loadAdminData } from '../lib/admin-data';
import { upgradeContent, siteExtras } from '../domain/site-content';
import { validateContent } from '../api/content-validation';

void test('nested editor updates preserve Persian copy, other cards and the original draft', () => {
  const draft = { hero: { titleEn: 'Owner title', titleFa: 'عنوان مالک' }, cards: [{ id: 'a', titleEn: 'A' }, { id: 'b', titleEn: 'B' }] };
  const next = updateEditorPath(draft, ['cards', 1, 'titleEn'], 'Edited B');
  assert.equal(next.cards[1].titleEn, 'Edited B');
  assert.equal(draft.cards[1].titleEn, 'B');
  assert.deepEqual(next.hero, draft.hero);
  assert.deepEqual(next.cards[0], draft.cards[0]);
  assert.equal(readEditorPath(updateEditorPath(next, ['hero', 'titleEn'], ''), ['hero', 'titleEn']), '');
  assert.equal(textValue(0), '0');
  assert.equal(textValue(undefined), '');
  assert.deepEqual(stringList(['English', 'فارسی']), ['English', 'فارسی']);
});
void test('invalid editor paths cannot modify prototypes or silently create missing sections', () => {
  const original = { hero: { titleEn: 'Owner title' } };
  for (const path of [[], ['missing', 'titleEn'], ['__proto__', 'polluted'], ['hero', 'constructor'], ['hero', 'prototype']])
    assert.throws(() => updateEditorPath(original, path, true));
  assert.equal(readEditorPath(original, ['__proto__']), undefined);
  assert.deepEqual(original, { hero: { titleEn: 'Owner title' } });
});
void test('admin workspace loaders preserve endpoint identity and propagate retryable failures', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async (url) => Response.json({ from: String(url) }));
  for (const [tab, endpoint] of [['products', '/products?includeArchived=true'], ['inquiries', '/inquiries'], ['media', '/media'], ['audit', '/system/audit'], ['overview', '/system/status'], ['system', '/system/status']]) {
    const result = await loadAdminData(tab);
    assert.equal(result.tab, tab);
    assert.deepEqual(result.value, { from: '/api' + endpoint });
  }
  await assert.rejects(loadAdminData('unknown'), /Unsupported/);
  fetch.mock.mockImplementation(async () => Response.json({ error: 'Your session has expired.' }, { status: 401 }));
  await assert.rejects(loadAdminData('products'), /session/);
  fetch.mock.mockImplementation(async () => Response.json({ products: [] }));
  assert.deepEqual(await loadAdminData('products'), { tab: 'products', value: { products: [] } });
});
void test('content upgrades preserve owner overrides and keep malformed copy visible to validation', () => {
  const legacy = Object.fromEntries(['hero', 'about', 'why', 'industries', 'engineering', 'contact', 'footer'].map(key => [key, { titleEn: 'Owner text', titleFa: 'متن مالک' }]));
  const upgraded = upgradeContent(legacy);
  assert.deepEqual(validateContent(upgraded), []);
  assert.deepEqual(upgraded.hero, legacy.hero);
  assert.equal(Object.hasOwn(legacy, 'brand'), false);
  for (const copy of [null, false, 'bad', []]) assert.ok(validateContent(upgradeContent({ ...legacy, copy })).length);
  const copy = structuredClone(siteExtras.copy);
  const key = Object.keys(copy)[0]; copy[key].en = 'Owner override';
  assert.deepEqual(readEditorPath(upgradeContent({ ...legacy, copy }), ['copy', key]), copy[key]);
});
