import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installUnloadGuard } from '../lib/unload-guard';

void test('dirty editor guard cancels unloading and returns legacy confirmation, then restores clean behavior', () => {
  const previous = () => null;
  const host: Pick<Window, 'onbeforeunload'> = { onbeforeunload: previous };
  const dispose = installUnloadGuard(host);
  const event = new Event('beforeunload', { cancelable: true });
  assert.ok(host.onbeforeunload?.call(host as Window, event as BeforeUnloadEvent));
  assert.equal(event.defaultPrevented, true);
  dispose();
  assert.equal(host.onbeforeunload, previous);
});

void test('overlapping dirty editors can close in either order without a stale unload prompt', () => {
  const host: Pick<Window, 'onbeforeunload'> = { onbeforeunload: null };
  const first = installUnloadGuard(host), second = installUnloadGuard(host);
  first(); first();
  assert.ok(host.onbeforeunload);
  second();
  assert.equal(host.onbeforeunload, null);
  const dispose = installUnloadGuard(host);
  const replacement = () => null;
  host.onbeforeunload = replacement;
  dispose();
  assert.equal(host.onbeforeunload, replacement, 'Cleanup must not remove another feature’s handler');
});
