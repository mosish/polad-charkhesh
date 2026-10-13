import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseHeroFamily, heroFamilies, heroHeadlines } from '../lib/hero-presentation';

void test('a new hero pick reaches every bearing family without repeating the previous page', () => {
  assert.deepEqual(new Set(Array.from({ length: 100 }, (_, i) => chooseHeroFamily(null, () => i / 100))), new Set(heroFamilies));
  for (const previous of heroFamilies) {
    for (let i = 0; i < 100; i++) assert.notEqual(chooseHeroFamily(previous, () => i / 100), previous);
  }
  assert.ok(heroFamilies.includes(chooseHeroFamily('old-invalid-selection', () => .5)));
});

void test('typing phrases keep the CMS heading and language, deduplicate and accept admin overrides', () => {
  assert.equal(heroHeadlines(false, 'Engineered for\nindustry.')[0], 'Engineered for industry.');
  assert.deepEqual(heroHeadlines(true, 'حرکت مطمئن', ' حرکتی دقیق \n\nحرکت مطمئن\nحرکتی دقیق'), ['حرکت مطمئن', 'حرکتی دقیق']);
  assert.ok(heroHeadlines(true).every(phrase => /[\u0600-\u06ff]/.test(phrase)));
  assert.equal(heroHeadlines(false, 'Title', Array.from({ length: 10 }, (_, i) => `Phrase ${i}`).join('\n')).length, 7);
});
