import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const boot = readFileSync('public-site/theme-init.js', 'utf8');
void test('theme bootstrap validates preferences, survives blocked storage and keeps administration dark', () => {
  for (const [saved, path, blocked, expected] of [
    [null, '/', false, 'dark'], ['light', '/catalog', false, 'light'],
    ['invalid', '/', false, 'dark'], ['light', '/', true, 'dark'],
    ['light', '/admin', false, 'dark'], ['light', '/admin/', false, 'dark'],
  ] as const) {
    const document = { documentElement: { dataset: {} as Record<string, string> } };
    runInNewContext(boot, { document, location: { pathname: path }, localStorage: { getItem() { if (blocked) throw new Error('Blocked'); return saved; } } });
    assert.equal(document.documentElement.dataset.theme, expected);
  }
});
