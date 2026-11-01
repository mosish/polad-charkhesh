import{test}from'node:test';import assert from'node:assert/strict';import * as THREE from'three';
import{renderBearingTrio,setBearingPresentationLayer}from'../lib/bearing-trio-composition';
import{buildBearing}from'../lib/bearing-family-3d';
import{heroFamilies}from'../lib/hero-presentation';
void test('every mesh including nested studs is assigned to its complete presentation layer',()=>{
 for(const family of heroFamilies){const model=buildBearing(family,THREE);try{for(const role of ['side','centre'] as const){setBearingPresentationLayer(model.root,role);model.root.traverse(object=>assert.equal(object.layers.mask,role==='side'?2:1));}}finally{model.dispose();}}
});
void test('foreground composition clears depth between independent assemblies and restores caller state on failure',()=>{
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera();camera.layers.set(3);
 for(const failAt of [0,1,2]){
  const calls:string[]=[];let count=0;
  const renderer={autoClear:false,render(){calls.push(`draw:${camera.layers.mask}:${this.autoClear}`);if(++count===failAt)throw Error('GPU failure');},clearDepth(){calls.push('depth');}};
  if(failAt)assert.throws(()=>renderBearingTrio(renderer,scene,camera));else{renderBearingTrio(renderer,scene,camera);assert.deepEqual(calls,['draw:2:true','depth','draw:1:false']);}
  assert.equal(renderer.autoClear,false);assert.equal(camera.layers.mask,8);
 }
});
