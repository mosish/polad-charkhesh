import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildBearing} from '../lib/bearing-family-3d';
import {heroFamilies} from '../lib/hero-presentation';
import {bearingScrollState} from '../lib/bearing-scroll';
import {bearingTrioGap,createTrioBounds,layoutBearingTrio} from '../lib/bearing-trio-layout';

void test('reported thrust/track intersection is reproduced and removed using full stud geometry',()=>{
  const centre=buildBearing('thrust',THREE),left=buildBearing('track',THREE),right=buildBearing('roller',THREE);
  try {
    centre.root.scale.setScalar(1.28);centre.root.position.y=-.48;centre.root.rotation.set(.14,-.14,-.08);
    [left,right].forEach((m,i)=>{const side=i===0?-1:1;m.root.scale.setScalar(.86);m.root.position.set(side*3.25,-.6,-1.7);m.root.rotation.set(.22,-side*.24,side*.12);});
    const before=new THREE.Box3().setFromObject(left.root);
    assert.ok(before.intersectsBox(new THREE.Box3().setFromObject(centre.root)),'fixture must expose the old spatial intersection');
    const boxes=createTrioBounds(THREE),camera=new THREE.PerspectiveCamera(34,1440/590,.1,100);
    layoutBearingTrio(centre.root,[left.root,right.root],camera,boxes);
    assert.ok(!new THREE.Box3().setFromObject(left.root).intersectsBox(new THREE.Box3().setFromObject(centre.root)));
    assert.ok(boxes.centre.min.x-boxes.left.max.x>=bearingTrioGap-1e-8);
  }finally{[centre,left,right].forEach(m=>m.dispose());}
});

void test('all 60 distinct trios keep real geometry separated and framed across scroll, rotation and viewport changes',()=>{
  const models=Object.fromEntries(heroFamilies.map(f=>[f,buildBearing(f,THREE)])) as Record<typeof heroFamilies[number],ReturnType<typeof buildBearing>>;
  const boxes=createTrioBounds(THREE),camera=new THREE.PerspectiveCamera(34,1,.1,100),point=new THREE.Vector3();
  let trios=0,poses=0;
  try {
    for(const central of heroFamilies)for(const l of heroFamilies)for(const r of heroFamilies){
      if(new Set([central,l,r]).size!==3)continue;
      trios++;
      const centre=models[central],left=models[l],right=models[r];
      for(const progress of [0,.15,.3,.5,.7,.85,1])for(const angle of [0,2.7]){
        poses++;
        const {expansion,recession}=bearingScrollState(progress);
        centre.setExploded(expansion);
        centre.root.scale.setScalar(1.28*(1-expansion*.23)*(1-recession*.3));
        centre.root.position.set(0,-.48*(1-expansion),-recession*2.2);
        centre.root.rotation.set(.14+progress*.16,-.14-progress*.55-expansion*.62,-.08);
        centre.moving.rotation.z=angle;centre.cage.rotation.z=centre.elements.rotation.z=angle*.4;
        [left,right].forEach((m,i)=>{const side=i===0?-1:1;m.setExploded(0);m.root.scale.setScalar(.72);m.root.position.set(side*3.25,-.6,-1.7);m.root.rotation.set(.22,-side*.24,side*.12);m.moving.rotation.z=angle;m.cage.rotation.z=m.elements.rotation.z=angle*.4;});
        for(const aspect of [320/330,390/360,768/500,1440/590,2350/660]){
          camera.aspect=aspect;
          layoutBearingTrio(centre.root,[left.root,right.root],camera,boxes);
          const c=new THREE.Box3().setFromObject(centre.root),a=new THREE.Box3().setFromObject(left.root),b=new THREE.Box3().setFromObject(right.root);
          assert.ok(c.min.x-a.max.x>=bearingTrioGap-1e-7 && b.min.x-c.max.x>=bearingTrioGap-1e-7,`${l}/${central}/${r} p=${progress}`);
          const range=(box:THREE.Box3)=>{const values:number[]=[];for(const x of [box.min.x,box.max.x])for(const z of [box.min.z,box.max.z])values.push(point.set(x,0,z).project(camera).x);return [Math.min(...values),Math.max(...values)];};
          assert.ok(range(c)[0]-range(a)[1]>=.035 && range(b)[0]-range(c)[1]>=.035,'projected silhouettes must have visible clearance');
          for(const box of [a,b,c])for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
            point.set(x,y,z).project(camera);
            assert.ok(Math.abs(point.x)<=1/1.08+1e-6 && Math.abs(point.y)<=1/1.08+1e-6 && Math.abs(point.z)<1,'complete model must stay inside camera frame');
          }
        }
      }
    }
    assert.equal(trios,60);assert.equal(poses,840);
  }finally{Object.values(models).forEach(m=>m.dispose());}
});
