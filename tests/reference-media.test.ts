import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,statSync} from 'node:fs';
import {referenceMedia} from '../lib/reference-media';

void test('reference display copies exist, retain fallback formats and do not replace owner photos',()=>{
  for(const filename of ['ball-bearing.jpg','cylindrical-roller.png','needle-bearing.jpg','pillow-block.jpg','shaft-seal.jpg','spherical-roller.png','tapered-roller-bearing.jpg']){
    const original='/reference-images/'+filename,media=referenceMedia(original)!;
    assert.ok(existsSync('public-site'+original));assert.ok(existsSync('public-site'+media.src));
    assert.equal(media.src.split('.').pop(),filename.split('.').pop());
    const widths=new Set();
    for(const candidate of media.webpSrcSet.split(', ')){
      const [src,width]=candidate.split(' ');assert.ok(!widths.has(width));widths.add(width);
      assert.ok(existsSync('public-site'+src));assert.ok(statSync('public-site'+src).size<statSync('public-site'+original).size);
    }
  }
  for(const url of ['/uploads/owner-photo.png','https://manufacturer.example/exact-photo.jpg','__proto__','constructor',''])assert.equal(referenceMedia(url),null);
});
