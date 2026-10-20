import { test } from 'node:test';
import assert from 'node:assert/strict';
import { updateEditorPath, readEditorPath, textValue, stringList } from '../lib/editor-path';
import { loadAdminData } from '../lib/admin-data';
import { upgradeContent, siteExtras, correctLegacyPersianCopy, textKey } from '../domain/site-content';
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

void test('legacy Persian repair changes only known placeholders and preserves owner copy', () => {
  const legacy = { hero: { titleFa: 'عنوان مالک' }, copy: structuredClone(siteExtras.copy) };
  const originals = [
    'Engineered for', 'what keeps', 'industry moving.', 'Roller bearings',
    'BASIC RATING LIFE', 'SIDE VIEW', 'DIMENSIONAL ENVELOPE · mm · NOT TO SCALE',
    'AXIAL HALF-SECTION / IDEALIZED BALL BEARING',
    'Ball · p = 3', 'Roller · p = 10/3',
  ];
  for (const original of originals) legacy.copy[textKey(original)].fa = original;
  const expected = structuredClone(legacy);
  for (const original of originals)
    expected.copy[textKey(original)].fa = siteExtras.copy[textKey(original)].fa;
  const repaired = correctLegacyPersianCopy(legacy);
  assert.equal(repaired.count, 10);
  assert.deepEqual(repaired.content, expected);
  assert.equal(legacy.copy[textKey('SIDE VIEW')].fa, 'SIDE VIEW');
  assert.equal(correctLegacyPersianCopy(repaired.content).count, 0);

  legacy.copy[textKey('SIDE VIEW')].fa = 'نمای سفارشی مالک';
  legacy.copy[textKey('Roller bearings')].en = 'Owner English wording';
  const custom = correctLegacyPersianCopy(legacy);
  assert.equal(custom.count, 8);
  assert.deepEqual(readEditorPath(custom.content, ['copy', textKey('SIDE VIEW')]), legacy.copy[textKey('SIDE VIEW')]);
  assert.deepEqual(readEditorPath(custom.content, ['copy', textKey('Roller bearings')]), legacy.copy[textKey('Roller bearings')]);
  for (const copy of [null, false, 'bad', []]) {
    assert.deepEqual(correctLegacyPersianCopy({ copy }), { content: { copy }, count: 0 });
  }
});
