import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePublicSnapshot} from '../lib/public-snapshot';

void test('fresh public snapshots retain exact published data and missing snapshots require API loading',()=>{
  const published={products:[{id:'6204',code:'6204-2RSH / 2RS1',d:20,D:47,B:14}],company:{nameFa:'پولاد چرخش آرین تک'},content:{hero:{titleEn:'Owner heading'}},seo:{domainFa:'https://poladcharkhesh.ir'},fa:true};
  assert.deepEqual(parsePublicSnapshot(JSON.stringify(published)),published);
  for(const raw of [null,'not json','null','[]',JSON.stringify({...published,products:null}),JSON.stringify({...published,company:null}),JSON.stringify({...published,seo:[]})])assert.equal(parsePublicSnapshot(raw),null);
});
