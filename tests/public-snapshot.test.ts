import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePublicSnapshot} from '../lib/public-snapshot';
import { compactPublicContent } from '../lib/public-snapshot';
import { siteExtras, type SiteContent } from '../domain/site-content';

void test('fresh public snapshots retain exact published data and missing snapshots require API loading',()=>{
  const published={products:[{id:'6204',code:'6204-2RSH / 2RS1',d:20,D:47,B:14}],company:{nameFa:'پولاد چرخش آرین تک'},content:{hero:{titleEn:'Owner heading'}},seo:{domainFa:'https://poladcharkhesh.ir'},fa:true};
  assert.deepEqual(parsePublicSnapshot(JSON.stringify(published)),published);
  for(const raw of [null,'not json','null','[]',JSON.stringify({...published,products:null}),JSON.stringify({...published,company:null}),JSON.stringify({...published,seo:[]})])assert.equal(parsePublicSnapshot(raw),null);
});
void test('public dictionary contains one language and preserves custom CMS translations', () => {
  const content: SiteContent = { ...structuredClone(siteExtras), hero: {}, about: {}, why: {}, industries: {}, engineering: {}, contact: {}, footer: {} };
  const key = Object.keys(content.copy)[0];
  content.copy[key] = { ...content.copy[key], en: 'Owner English', fa: 'متن سفارشی' };
  const en = compactPublicContent(content, false), fa = compactPublicContent(content, true);
  assert.equal(en.localizedCopy[key], 'Owner English');
  assert.equal(fa.localizedCopy[key], 'متن سفارشی');
  assert.deepEqual(en.content.copy, {});
  assert.ok(JSON.stringify(en).length < JSON.stringify(content).length);
  assert.equal(content.copy[key].en, 'Owner English', 'published source is not mutated');
});
