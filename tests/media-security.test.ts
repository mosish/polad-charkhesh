import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { jsPDF } from 'jspdf';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { normalizeMedia } from '../api/media-processing';

void test('image decoding strips metadata and appended payloads while preserving oriented pixels', async () => {
  const input = await sharp({ create: { width: 40, height: 20, channels: 3, background: '#123456' } })
    .withMetadata({ orientation: 6 }).jpeg().toBuffer();
  const result = await normalizeMedia(Buffer.concat([input, Buffer.from('<script>alert(1)</script>')]), 'image/jpeg');
  assert.equal(result.mime, 'image/webp');
  const info = await sharp(result.bytes).metadata();
  assert.equal(info.format, 'webp'); assert.equal(info.width, 20); assert.equal(info.height, 40);
  assert.equal(info.exif, undefined); assert.equal(info.icc, undefined);
  assert.ok(!result.bytes.includes(Buffer.from('<script>')));
});
void test('signatures alone, truncated images, format mismatches and excessive dimensions are rejected', async () => {
  await assert.rejects(normalizeMedia(Buffer.from('89504e470d0a1a0a', 'hex'), 'image/png'));
  const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: 'white' } }).png().toBuffer();
  await assert.rejects(normalizeMedia(png, 'image/jpeg'));
  await assert.rejects(normalizeMedia(png.subarray(0, png.length / 2), 'image/png'));
  const wide = await sharp({ create: { width: 4001, height: 1, channels: 3, background: 'white' } }).png().toBuffer();
  await assert.rejects(normalizeMedia(wide, 'image/png'));
  const bomb = await sharp({ create: { width: 4001, height: 4001, channels: 3, background: 'white' } }).png().toBuffer();
  await assert.rejects(normalizeMedia(bomb, 'image/png'));
});
void test('PDF parser accepts static documents and rejects JavaScript in escaped/compressed objects', async () => {
  const pdf = new jsPDF(); pdf.text('Synthetic static technical reference', 10, 20);
  const clean = Buffer.from(pdf.output('arraybuffer'));
  const result = await normalizeMedia(clean, 'application/pdf');
  assert.equal(result.mime, 'application/pdf'); assert.ok(result.bytes.subarray(0, 5).equals(Buffer.from('%PDF-')));
  const active = new jsPDF(); active.text('Synthetic active-content fixture', 10, 20); active.addJS('app.alert("test")');
  const folder = mkdtempSync(path.join(tmpdir(), 'polad-pdf-test-'));
  const source = path.join(folder, 'source.pdf'), packed = path.join(folder, 'packed.pdf');
  writeFileSync(source, Buffer.from(active.output('arraybuffer')));
  execFileSync(process.env.QPDF_PATH || 'qpdf', [source, '--object-streams=generate', packed], { windowsHide: true });
  await assert.rejects(normalizeMedia(readFileSync(packed), 'application/pdf'));
  // Escape a name without changing offsets; qpdf must canonicalize it.
  const escaped = Buffer.from(active.output('arraybuffer')).toString('latin1').replace('/JavaScript', '/Java#53cript');
  // qpdf repairs xref offsets for this synthetic variant, then emits a valid file.
  writeFileSync(source, escaped, 'latin1');
  try { execFileSync(process.env.QPDF_PATH || 'qpdf', [source, '--object-streams=generate', packed], { windowsHide: true, stdio: 'ignore' }); }
  catch (error) { if (!(error && typeof error === 'object' && 'status' in error && error.status === 3)) throw error; }
  await assert.rejects(normalizeMedia(readFileSync(packed), 'application/pdf'));
  await assert.rejects(normalizeMedia(Buffer.from('%PDF-1.7\n%%EOF\n'), 'application/pdf'));
  writeFileSync(source, clean);
  execFileSync(process.env.QPDF_PATH || 'qpdf', ['--encrypt', 'reader', 'owner', '256', '--', source, packed], { windowsHide: true });
  await assert.rejects(normalizeMedia(readFileSync(packed), 'application/pdf'));
});
