import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { brandLogo, brandVariants } from '../lib/brand-logo';

void test('bundled responsive logos decode, match content hashes and reduce bytes', async () => {
  const original = await readFile('public-site/brand/logo.png');
  for (const variant of brandVariants) {
    const bytes = await readFile('public-site' + variant.url);
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.width, variant.width);
    assert.equal(metadata.format, 'webp');
    assert.ok(bytes.length < original.length);
    assert.ok(
      variant.url.includes(
        createHash('sha256').update(bytes).digest('hex').slice(0, 12),
      ),
    );
  }
  const icon = await sharp(
    'public-site/brand/favicon-af94365cf274.png',
  ).metadata();
  assert.equal(icon.width, 48);
  assert.equal(icon.height, 48);
});
void test('owner supplied logos stay authoritative and receive no bundled srcset', () => {
  for (const source of [
    '/uploads/owner-logo.webp',
    'https://example.com/company.png',
  ])
    assert.deepEqual(brandLogo(source), { src: source });
  assert.deepEqual(brandLogo(), brandLogo('/brand/logo.png'));
});
