import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Mesh } from 'three';
import { buildProductBearing3D } from '../lib/product-bearing-3d';
import { bearingGeometry } from '../lib/bearing-motion';
import { bearingProducts } from '../domain/catalog';

test('3D catalog models preserve outside diameter, bore and width with one uniform scale',()=>{
  for(const p of bearingProducts.filter(p=>bearingGeometry(p).supported)){
    const model=buildProductBearing3D(p),scale=4.6/p.D;
    const box=new Box3().setFromObject(model.root);
    assert.ok(Math.abs(box.max.x-box.min.x-4.6)<.025,`${p.code}: outside diameter`);
    assert.ok(Math.abs(box.max.z-box.min.z-p.B*scale)<.025,`${p.code}: width`);
    const ring=model.moving.children.find(o=>o instanceof Mesh&&o.geometry.type==='LatheGeometry') as Mesh;
    const points=ring.geometry.getAttribute('position');let minRadius=Infinity;
    for(let i=0;i<points.count;i++)minRadius=Math.min(minRadius,Math.hypot(points.getX(i),points.getY(i)));
    assert.ok(Math.abs(minRadius-p.d*scale/2)<.001,`${p.code}: bore`);
    assert.equal(model.spins.length,model.geometry.count*model.geometry.rows);
    assert.ok(model.geometry.elementDiameter<=2*model.geometry.outer*p.B/p.D);
    model.dispose();
  }
});

test('3D explorer changes rolling-element geometry and rows with the selected product',()=>{
  for(const type of ['deep-groove','tapered','spherical','cylindrical','needle','self-aligning-ball'] as const){
    const p=bearingProducts.find(p=>p.schematicType===type);if(!p)continue;
    const model=buildProductBearing3D(p);
    const element=model.spins[0].children[0] as Mesh;
    assert.equal(element.geometry.type,model.geometry.roller?'LatheGeometry':'SphereGeometry');
    assert.equal(model.geometry.rows,['spherical','self-aligning-ball'].includes(type)?2:1);
    model.dispose();
  }
  for(const p of bearingProducts.filter(p=>/double[\s-]+row/i.test(p.code+' '+p.nameEn))){
    assert.equal(bearingGeometry(p).rows,2,p.code);
  }
});

test('exploded product view separates four assemblies and restores catalog dimensions',()=>{
  const p=bearingProducts.find(p=>p.schematicType==='spherical')!;
  const model=buildProductBearing3D(p);
  const assembled=new Box3().setFromObject(model.root);
  assert.equal(model.parts.length,4);
  assert.ok(model.parts.every(part=>part.children.length>0));
  model.setExploded(1);
  assert.equal(new Set(model.parts.map(part=>part.position.z)).size,4);
  const exploded=new Box3().setFromObject(model.root);
  assert.ok(exploded.max.z-exploded.min.z>assembled.max.z-assembled.min.z);
  model.setExploded(0);
  const restored=new Box3().setFromObject(model.root);
  assert.ok(Math.abs(restored.max.z-assembled.max.z)<.001);
  assert.ok(Math.abs(restored.min.z-assembled.min.z)<.001);
  model.dispose();
});
