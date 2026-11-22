import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const boot = readFileSync('public-site/theme-init.js', 'utf8');
function browser(saved: string | null, hour: number, blocked = false, path = '/') {
  const clock = { hour };
  class VisitorDate extends Date { getHours() { return clock.hour; } }
  const document = Object.assign(new EventTarget(), { documentElement: { dataset: {} as Record<string, string> } });
  let timer = () => {};
  const window = Object.assign(new EventTarget(), {
    poladTheme: undefined as undefined | { setPreference(value: string): void; refresh(): void },
    setTimeout(callback: () => void) { timer = callback; },
  });
  const storage = {
    getItem() { if (blocked) throw new Error('Blocked'); return saved; },
    setItem(_key: string, value: string) { if (blocked) throw new Error('Blocked'); saved = value; },
  };
  runInNewContext(boot, { document, window, Event, Date: VisitorDate, location: { pathname: path }, localStorage: storage });
  return { document, window, clock, tick: () => timer(), saved: () => saved,
    fromOtherTab(value: string | null) { saved = value; window.dispatchEvent(Object.assign(new Event('storage'), { key: 'pc-theme' })); } };
}
void test('automatic theme uses visitor day/night boundaries and preserves manual choices', () => {
  for (const hour of [0, 6, 7, 12, 18, 19, 23]) for (const saved of [null, 'auto', 'invalid', 'light', 'dark']) {
    const b = browser(saved, hour);
    assert.equal(b.document.documentElement.dataset.theme, saved === 'light' || saved === 'dark' ? saved : hour >= 7 && hour < 19 ? 'light' : 'dark');
  }
});
void test('automatic pages update at time boundaries and synchronize manual overrides and resets', () => {
  const b = browser(null, 18);
  b.clock.hour = 19; b.tick();
  assert.equal(b.document.documentElement.dataset.theme, 'dark');
  b.window.poladTheme!.setPreference('light'); b.tick();
  assert.equal(b.saved(), 'light');
  assert.equal(b.document.documentElement.dataset.theme, 'light');
  b.window.poladTheme!.setPreference('auto');
  assert.equal(b.document.documentElement.dataset.theme, 'dark');
  b.clock.hour = 7; b.window.dispatchEvent(new Event('focus'));
  assert.equal(b.document.documentElement.dataset.theme, 'light');
  b.fromOtherTab('dark');
  assert.equal(b.document.documentElement.dataset.theme, 'dark');
  b.fromOtherTab(null);
  assert.equal(b.document.documentElement.dataset.themeMode, 'auto');
  assert.equal(b.document.documentElement.dataset.theme, 'light');
});
void test('blocked storage still permits manual overrides and administration remains dark', () => {
  const b = browser(null, 12, true);
  b.window.poladTheme!.setPreference('dark'); b.tick();
  assert.equal(b.document.documentElement.dataset.theme, 'dark');
  b.window.poladTheme!.setPreference('auto');
  assert.equal(b.document.documentElement.dataset.theme, 'light');
  for (const path of ['/admin', '/admin/']) {
    const a = browser('light', 12, false, path);
    assert.equal(a.document.documentElement.dataset.theme, 'dark');
    assert.equal(a.window.poladTheme, undefined);
  }
});
