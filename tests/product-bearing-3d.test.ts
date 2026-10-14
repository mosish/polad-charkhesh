import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Mesh } from 'three';
import { buildProductBearing3D } from '../lib/product-bearing-3d';
import { bearingGeometry } from '../lib/bearing-motion';
import { bearingProducts } from '../domain/catalog';
import * as ModernThree from 'three';
import * as LegacyThree from 'three-webgl1/src/Three.js';
import {buildBearingRoom} from '../lib/bearing-room';

void test('3D catalog models preserve outside diameter, bore and width with one uniform scale',()=>{
  for(const p of bearingProducts.filter(p=>bearingGeometry(p).supported)){
    const model=buildProductBearing3D(p,ModernThree),scale=4.6/p.D;
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

void test('3D explorer changes rolling-element geometry and rows with the selected product',()=>{
  for(const type of ['deep-groove','tapered','spherical','cylindrical','needle','self-aligning-ball'] as const){
    const p=bearingProducts.find(p=>p.schematicType===type);if(!p)continue;
    const model=buildProductBearing3D(p,ModernThree);
    const element=model.spins[0].children[0] as Mesh;
    assert.equal(element.geometry.type,model.geometry.roller?'LatheGeometry':'SphereGeometry');
    assert.equal(model.geometry.rows,['spherical','self-aligning-ball'].includes(type)?2:1);
    model.dispose();
  }
  for(const p of bearingProducts.filter(p=>/double[\s-]+row/i.test(p.code+' '+p.nameEn))){
    assert.equal(bearingGeometry(p).rows,2,p.code);
  }
});

void test('exploded product view separates four assemblies and restores catalog dimensions',()=>{
  const p=bearingProducts.find(p=>p.schematicType==='spherical')!;
  const model=buildProductBearing3D(p,ModernThree);
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

void test('WebGL 1 uses the same selected-product dimensions, parts and exploded travel',()=>{
  for(const p of bearingProducts.filter(product=>bearingGeometry(product).supported)){
    const modern=buildProductBearing3D(p,ModernThree),legacy=buildProductBearing3D(p,LegacyThree as unknown as typeof ModernThree);
    assert.ok(legacy.root instanceof LegacyThree.Group);
    assert.ok(!(legacy.root instanceof ModernThree.Group));
    assert.deepEqual(legacy.geometry,modern.geometry);
    assert.equal(legacy.spins.length,modern.spins.length);
    for(const expansion of [0,.5,1,0]){
      modern.setExploded(expansion);legacy.setExploded(expansion);
      const expected=new Box3().setFromObject(modern.root),actual=new Box3().setFromObject(legacy.root);
      assert.ok(expected.min.distanceTo(actual.min)<.001,p.code);
      assert.ok(expected.max.distanceTo(actual.max)<.001,p.code);
    }
    modern.dispose();legacy.dispose();
  }
});

void test('studio scene never mixes materials or meshes from different Three.js versions',()=>{
  for(const engine of [ModernThree,LegacyThree]){
    const room=buildBearingRoom(engine as unknown as typeof ModernThree);
    room.scene.traverse(object=>{
      if(object instanceof engine.Mesh){
        assert.ok(object.geometry instanceof engine.BufferGeometry);
        const materials=Array.isArray(object.material)?object.material:[object.material];
        materials.forEach(material=>assert.ok(material instanceof engine.Material));
      }
    });
    room.dispose();
  }
});
