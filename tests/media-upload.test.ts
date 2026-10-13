import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readMediaUpload } from '../lib/media-upload';

// FileReader is a browser API; exercise its success, failure and cancellation contracts.
class ReaderStub {
  static outcome: 'load' | 'error' | 'abort' = 'load';
  static contents: string | ArrayBuffer | null = 'data:image/png;base64,aGVsbG8=';
  result: string | ArrayBuffer | null = null;
  onload?: () => void;
  onerror?: () => void;
  onabort?: () => void;
  readAsDataURL() {
    this.result = ReaderStub.contents;
    queueMicrotask(() => this['on' + ReaderStub.outcome as 'onload' | 'onerror' | 'onabort']?.());
  }
}
function installReader() {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'FileReader');
  Object.defineProperty(globalThis, 'FileReader', { value: ReaderStub, configurable: true });
  return () => {
    if (previous) Object.defineProperty(globalThis, 'FileReader', previous);
    else Reflect.deleteProperty(globalThis, 'FileReader');
  };
}
const image = () => new File(['hello'], 'bearing.png', { type: 'image/png' });

void test('media reader returns only a complete base64 upload payload', async (t) => {
  t.after(installReader());
  ReaderStub.outcome = 'load';
  ReaderStub.contents = 'data:image/png;base64,aGVsbG8=';
  assert.deepEqual(await readMediaUpload(image()), { name: 'bearing.png', mime: 'image/png', base64: 'aGVsbG8=' });
});

void test('media reader rejects empty, oversized and unsupported files before reading', async () => {
  await assert.rejects(readMediaUpload(new File([], 'empty.png', { type: 'image/png' })), /non-empty file/);
  await assert.rejects(readMediaUpload(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' })), /up to 5 MB/);
  await assert.rejects(readMediaUpload(new File(['x'], 'script.svg', { type: 'image/svg+xml' })), /PNG, JPEG, WebP or PDF/);
});

void test('media reader surfaces read errors and aborts, then permits retry', async (t) => {
  t.after(installReader());
  ReaderStub.outcome = 'error';
  await assert.rejects(readMediaUpload(image()), /could not be read/);
  ReaderStub.outcome = 'abort';
  await assert.rejects(readMediaUpload(image()), /cancelled/);
  ReaderStub.outcome = 'load';
  ReaderStub.contents = 'data:image/png;base64,aGVsbG8=';
  assert.equal((await readMediaUpload(image())).name, 'bearing.png');
});

void test('media reader rejects incomplete or non-text FileReader results', async (t) => {
  t.after(installReader());
  ReaderStub.outcome = 'load';
  for (const value of [null, new ArrayBuffer(4), 'not a data URL', 'data:image/png;base64,']) {
    ReaderStub.contents = value;
    await assert.rejects(readMediaUpload(image()));
  }
});
