import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  continuousBearingState,
  bearingReturnProgress,
  bearingScrollProgress,
  bearingScrollState,
} from '../lib/bearing-scroll';
test('scroll assembly opens progressively and reverses without exceeding model bounds', () => {
  assert.equal(bearingScrollState(0).phase, 'assembled');
  assert.equal(bearingScrollState(0.5).phase, 'opening');
  assert.equal(bearingScrollState(1).phase, 'components');
  let previous = 0;
  for (let step = 0; step <= 100; step++) {
    const state = bearingScrollState(step / 100);
    assert.ok(state.expansion >= previous && state.expansion <= 1);
    previous = state.expansion;
  }
  assert.equal(bearingScrollState(-1).expansion, 0);
  assert.equal(bearingScrollState(2).expansion, 1);
  assert.equal(bearingScrollState(Number.NaN).expansion, 0);
  assert.equal(bearingScrollState(0.5).expansion, 0.5);
  assert.equal(bearingScrollState(0).turn, 0);
  assert.equal(bearingScrollState(.6).recession, 0);
  assert.equal(bearingScrollState(1).recession, 1);
  assert.equal(bearingScrollState(Number.NaN).recession, 0);
});
test('pinned progress follows available document travel, never viewport scroll locking', () => {
  assert.equal(bearingScrollProgress(90, 1400, 750), 0);
  assert.equal(bearingScrollProgress(-235, 1400, 750), 0.5);
  assert.equal(bearingScrollProgress(-560, 1400, 750), 1);
  assert.equal(bearingScrollProgress(-1000, 1400, 750), 1);
  assert.equal(bearingScrollProgress(500, 1400, 750), 0);
  assert.equal(bearingScrollProgress(0, 700, 750), 0);
});

test('closing assembly finishes at the page end and reverses on upward scroll',()=>{
 assert.equal(bearingReturnProgress(1000,480,1000),0);
 assert.equal(bearingReturnProgress(760,480,1000),.5);
 assert.equal(bearingReturnProgress(520,480,1000),1);
 assert.equal(bearingReturnProgress(-50,480,1000),1);
 assert.equal(bearingReturnProgress(0,0,1000),0);
 assert.equal(bearingReturnProgress(0,480,0),0);
});

test('continuous background opens across the page and closes at both ends',()=>{
 assert.equal(continuousBearingState(0).assembly,0);
 assert.equal(continuousBearingState(.5).assembly,1);
 assert.equal(continuousBearingState(1).assembly,0);
 assert.equal(continuousBearingState(0).opacity,0);
 assert.equal(continuousBearingState(1).opacity,0);
 assert.equal(continuousBearingState(Number.NaN).opacity,0);
 for(let i=0;i<=100;i++){const state=continuousBearingState(i/100);assert.ok(state.opacity>=0&&state.opacity<=.1);assert.ok(state.assembly>=0&&state.assembly<=1);}
});
