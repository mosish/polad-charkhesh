import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clientLanguage } from '../lib/language';

void test('production snapshots preserve local language selection without overriding canonical domain defaults', () => {
  const initial = { fa: false, seo: { domainEn: 'https://poladcharkhesh.com', domainFa: 'https://poladcharkhesh.ir' } };
  assert.equal(clientLanguage('127.0.0.1', '', 'fa', initial), true);
  assert.equal(clientLanguage('localhost', '?lang=en', 'fa', initial), false);
  assert.equal(clientLanguage('poladcharkhesh.com', '', 'fa', initial), false);
  assert.equal(clientLanguage('poladcharkhesh.ir', '', 'en', { ...initial, fa: true }), true);
  assert.equal(clientLanguage('poladcharkhesh.com', '?lang=fa', null, initial), true);
  assert.equal(clientLanguage('localhost', '?lang=invalid', 'fa', initial), true);
  assert.equal(clientLanguage('localhost', '', null, initial), false);
});
