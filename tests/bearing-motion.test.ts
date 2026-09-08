import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advanceRotation, bearingGeometry } from '../lib/bearing-motion';
import { bearingProducts } from '../domain/catalog';

test('RPM integrates elapsed seconds and playback rate without a fixed animation speed', () => {
  assert.equal(advanceRotation(0, 60, .25), 90);
  assert.equal(advanceRotation(0, 120, .25), 180);
  assert.equal(advanceRotation(0, 6000, .25, .02), 180);
  assert.equal(advanceRotation(42, 0, 10), 42);
  assert.equal(advanceRotation(42, 1500, 10, 0), 42);
  assert.equal(advanceRotation(350, 60, .1), 26);
  assert.equal(advanceRotation(12, NaN, 1), 12);
});
test('model scales to selected product dimensions and estimates slower cage rotation', () => {
  const ball = bearingProducts.find(p => p.schematicType === 'deep-groove')!;
  const g = bearingGeometry(ball);
  assert.equal(g.bore/g.outer, ball.d/ball.D);
  assert.equal(g.depth, 2*g.outer*ball.B/ball.D*.42);
  assert.ok(g.cageRatio > 0 && g.cageRatio < .5);
  assert.equal(g.roller, false);
  const tapered = bearingProducts.find(p => p.schematicType === 'tapered')!;
  assert.equal(bearingGeometry(tapered).roller, true);
  assert.equal(bearingGeometry({...ball, category:'seal'}).supported, false);
});
