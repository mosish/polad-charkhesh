import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseHeroLineup, chooseHeroFamily, heroFamilies, heroHeadlines } from '../lib/hero-presentation';

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

void test('hero trio is distinct and replaces exactly one physical slot after each reload', () => {
  let trio = chooseHeroLineup(null, () => 0);
  const slots = new Set<number>();
  const seen = new Set<string>(trio);
  for (let i=0;i<120;i++) {
    const next = chooseHeroLineup(trio, () => i/120);
    assert.equal(new Set(next).size, 3);
    const changed=next.flatMap((f,index)=>f===trio[index]?[]:[index]);
    assert.equal(changed.length,1);
    slots.add(changed[0]);next.forEach(f=>seen.add(f));trio=next;
  }
  assert.equal(slots.size,3);assert.deepEqual(seen,new Set(heroFamilies));
  for (const invalid of [null,{},['ball','ball','roller'],['missing','ball','roller'],['ball']]) {
    const next=chooseHeroLineup(invalid,()=>.99);
    assert.equal(new Set(next).size,3);assert.ok(next.every(f=>heroFamilies.includes(f)));
  }
});
