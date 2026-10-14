import test from 'node:test';
import assert from 'node:assert/strict';
import {subscribeMediaQuery,gpuRendererPreference} from '../lib/browser-compat';

void test('motion preference subscriptions work with legacy Safari listeners and clean up',()=>{
  let active:(()=>void)|undefined;let changes=0;
  const media={addListener:(cb:()=>void)=>{active=cb;},removeListener:(cb:()=>void)=>{assert.equal(cb,active);active=undefined;}} as unknown as MediaQueryList;
  const unsubscribe=subscribeMediaQuery(media,()=>changes++);
  active?.();assert.equal(changes,1);unsubscribe();assert.equal(active,undefined);
});
void test('GPU preference probes once, releases its context and preserves WebGL 1 recovery',()=>{
  let probes=0,released=0;
  const canvas={getContext:(type:string)=>{assert.equal(type,'webgl2');probes++;return {getExtension:()=>({loseContext:()=>released++})};}} as unknown as HTMLCanvasElement;
  const modern=gpuRendererPreference(()=>canvas);
  assert.equal(modern(),'webgl2');assert.equal(modern(),'webgl2');assert.equal(probes,1);assert.equal(released,1);
  const legacy=gpuRendererPreference(()=>({getContext:()=>null}) as unknown as HTMLCanvasElement);
  assert.equal(legacy(),'webgl1');
  const blocked=gpuRendererPreference(()=>{throw new Error('GPU disabled');});assert.equal(blocked(),'webgl1');
});
void test('modern media-query subscriptions use EventTarget and remove the same callback',()=>{
  let active:(()=>void)|undefined;
  const media={addEventListener:(event:string,cb:()=>void)=>{assert.equal(event,'change');active=cb;},removeEventListener:(event:string,cb:()=>void)=>{assert.equal(event,'change');assert.equal(cb,active);active=undefined;}} as unknown as MediaQueryList;
  const unsubscribe=subscribeMediaQuery(media,()=>{});assert.equal(typeof active,'function');unsubscribe();assert.equal(active,undefined);
});
