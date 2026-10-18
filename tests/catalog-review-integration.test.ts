import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fieldValue, type CatalogReviewPatch } from '../api/catalog-review-patch';
import type { BearingProduct } from '../domain/product';

// Only public review fixtures enter a brand-new temporary SQLite database.
process.env.TEST_IMPORT = '1';
process.env.NODE_ENV = 'test';
process.env.DATABASE_PATH = path.join(mkdtempSync(path.join(tmpdir(), 'polad-review-')), 'review.sqlite');
process.env.UPLOAD_DIR = path.join(path.dirname(process.env.DATABASE_PATH), 'uploads');

void test('110-product review: authenticated preview, conflict rollback, owner edits and exact field persistence', async () => {
  const baseline: BearingProduct[] = JSON.parse(readFileSync('docs/catalog-review/baseline.json','utf8')).products;
  const patch: CatalogReviewPatch = JSON.parse(readFileSync('docs/catalog-review/review.patch.json','utf8'));
  const { app } = await import('../api/index');
  const { db, transaction, putProduct, allProducts, product: lookupProduct } = await import('../api/database');
  const product = (id: string) => {
    const value = lookupProduct(id);
    assert.ok(value, `Expected stored product ${id}`);
    return value;
  };
  transaction(() => { db.exec('DELETE FROM products'); baseline.forEach(putProduct); });
  const initial = allProducts(true);
  const server = await new Promise<ReturnType<typeof app.listen>>(resolve => {
    const s = app.listen(0,'127.0.0.1',()=>resolve(s));
  });
  const base = `http://127.0.0.1:${(server.address() as {port:number}).port}/api`;
  let cookie = '';
  async function post(route:string, body:unknown) {
    const response=await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
    return {response,data:await response.json() as {error:string;revision:string;created:number;updated:number}};
  }
  try {
    assert.equal((await post('/products/import',{reviewPatch:patch,preview:true})).response.status,401);
    const setup=await post('/auth/setup',{username:'isolated_review_test',password:randomBytes(24).toString('hex')});
    assert.equal(setup.response.status,201);
    cookie=setup.response.headers.get('set-cookie')!.split(';')[0];
    const preview=await post('/products/import',{reviewPatch:patch,preview:true});
    assert.equal(preview.response.status,200,preview.data.error);
    assert.equal(preview.data.created,0);
    assert.equal(preview.data.updated,patch.rows.length);
    assert.deepEqual(allProducts(true),initial,'preview must not persist any change');
    const id=patch.rows[0].id;
    const edited={...product(id),featured:!product(id).featured,applicationsEn:['Owner edit after preview']};
    putProduct(edited);
    const current=allProducts(true);
    const stale=await post('/products/import',{reviewPatch:patch,confirm:'IMPORT',revision:preview.data.revision});
    assert.equal(stale.response.status,409);
    assert.deepEqual(allProducts(true),current,'stale preview rejects entire batch');
    const renewed=await post('/products/import',{reviewPatch:patch,preview:true});
    assert.equal(renewed.response.status,200,renewed.data.error);
    // A specification conflict on even the last row must block earlier rows too.
    const tailId=patch.rows.at(-1)!.id;
    const tail=product(tailId);
    putProduct({...tail,crKn:tail.crKn+0.1});
    const conflicting=allProducts(true);
    const rejected=await post('/products/import',{reviewPatch:patch,confirm:'IMPORT',revision:renewed.data.revision});
    assert.equal(rejected.response.status,409);
    assert.match(rejected.data.error,/baseline conflict/);
    assert.deepEqual(allProducts(true),conflicting);
    putProduct(tail);
    const ready=await post('/products/import',{reviewPatch:patch,preview:true});
    const saved=await post('/products/import',{reviewPatch:patch,confirm:'IMPORT',revision:ready.data.revision});
    assert.equal(saved.response.status,200,saved.data.error);
    const actual=allProducts(true);
    assert.equal(actual.length,110);
    assert.deepEqual(actual.map((p:BearingProduct)=>[p.id,p.slug,p.code,p.brands,p.category,p.schematicType]),initial.map((p:BearingProduct)=>[p.id,p.slug,p.code,p.brands,p.category,p.schematicType]));
    assert.equal(product(id).featured,edited.featured);
    assert.deepEqual(product(id).applicationsEn,edited.applicationsEn);
    for(const row of patch.rows) for(const change of row.changes)
      assert.deepEqual(fieldValue(product(row.id),change.field),change.after,`${row.id}/${change.field}`);
    const changedIds=new Set(patch.rows.map(r=>r.id));
    for(const p of initial) if(!changedIds.has(p.id)) assert.deepEqual(product(p.id),p,'held record must remain untouched');
    assert.equal((db.prepare("SELECT count(*) n FROM audit_logs WHERE action='CATALOG_IMPORTED'").get() as {n:number}).n,1);
    const beforeDelete=product(id);
    const deletion:CatalogReviewPatch={schemaVersion:1,baselineSha256:patch.baselineSha256,rows:[{id,
      identity:{code:beforeDelete.code,slug:beforeDelete.slug,brands:beforeDelete.brands,category:beforeDelete.category,schematicType:beforeDelete.schematicType},
      guards:{},changes:[{field:'speedReferenceRpm',before:fieldValue(beforeDelete,'speedReferenceRpm'),after:{present:false},evidence:['test-only optional omission']}]}]};
    const deletionPreview=await post('/products/import',{reviewPatch:deletion,preview:true});
    assert.equal(deletionPreview.response.status,200,deletionPreview.data.error);
    const removed=await post('/products/import',{reviewPatch:deletion,confirm:'IMPORT',revision:deletionPreview.data.revision});
    assert.equal(removed.response.status,200,removed.data.error);
    assert.equal(Object.hasOwn(product(id),'speedReferenceRpm'),false,'ordinary import merge must not restore omitted optional field');
    const mediaPatch: CatalogReviewPatch = JSON.parse(readFileSync('docs/catalog-review/media.patch.json', 'utf8'));
    const beforeMedia = allProducts(true);
    const mediaPreview = await post('/products/import', { reviewPatch: mediaPatch, preview: true });
    assert.equal(mediaPreview.response.status, 200, mediaPreview.data.error);
    assert.equal(mediaPreview.data.updated, mediaPatch.rows.length);
    assert.deepEqual(allProducts(true), beforeMedia, 'media preview must not persist changes');
    const mediaSaved = await post('/products/import', { reviewPatch: mediaPatch, confirm: 'IMPORT', revision: mediaPreview.data.revision });
    assert.equal(mediaSaved.response.status, 200, mediaSaved.data.error);
    for (const row of mediaPatch.rows) assert.deepEqual(fieldValue(product(row.id), 'imageUrl'), row.changes[0].after);
    assert.equal(allProducts(true).length, baseline.length);
    assert.equal(product(id).featured, edited.featured, 'media import preserves unrelated owner edits');
  } finally {
    await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
    db.close();
  }
});
