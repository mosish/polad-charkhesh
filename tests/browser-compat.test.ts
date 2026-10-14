import test from 'node:test';
import assert from 'node:assert/strict';
import {subscribeMediaQuery} from '../lib/browser-compat';

void test('motion preference subscriptions work with legacy Safari listeners and clean up',()=>{
  let active:(()=>void)|undefined;let changes=0;
  const media={addListener:(cb:()=>void)=>{active=cb;},removeListener:(cb:()=>void)=>{assert.equal(cb,active);active=undefined;}} as unknown as MediaQueryList;
  const unsubscribe=subscribeMediaQuery(media,()=>changes++);
  active?.();assert.equal(changes,1);unsubscribe();assert.equal(active,undefined);
});
void test('modern media-query subscriptions use EventTarget and remove the same callback',()=>{
  let active:(()=>void)|undefined;
  const media={addEventListener:(event:string,cb:()=>void)=>{assert.equal(event,'change');active=cb;},removeEventListener:(event:string,cb:()=>void)=>{assert.equal(event,'change');assert.equal(cb,active);active=undefined;}} as unknown as MediaQueryList;
  const unsubscribe=subscribeMediaQuery(media,()=>{});assert.equal(typeof active,'function');unsubscribe();assert.equal(active,undefined);
});
