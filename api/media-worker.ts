// Runs in a disposable process so a timeout terminates native decoding as well.
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { inspectPdfObjects } from './pdf-policy';

sharp.cache(false);
sharp.concurrency(1);
process.once('message', async (message: { mime: string; base64: string }) => {
  let temporary = '';
  let result: { ok: boolean; base64?: string; unavailable?: boolean } = { ok: false };
  try {
    const input = Buffer.from(message.base64, 'base64');
    if (!input.length || input.length > 5 * 1024 * 1024) throw new Error('Invalid size');
    let output: Buffer;
    if (message.mime === 'application/pdf') {
      if (!/^%PDF-1\.[0-7]|^%PDF-2\.0/.test(input.toString('ascii', 0, 8)) ||
          !/%%EOF\s*$/.test(input.subarray(-1024).toString('ascii')))
        throw new Error('Invalid PDF envelope');
      temporary = mkdtempSync(path.join(tmpdir(), 'polad-pdf-'));
      const source = path.join(temporary, 'input.pdf');
      const target = path.join(temporary, 'normalized.pdf');
      writeFileSync(source, input, { mode: 0o600, flag: 'wx' });
      const qpdf = process.env.QPDF_PATH || 'qpdf';
      const run = (args: string[]) => {
        const limited = process.platform === 'linux';
        return execFileSync(limited ? '/usr/bin/prlimit' : qpdf,
          limited ? ['--as=536870912', '--cpu=10', '--fsize=16777216', '--', qpdf, ...args] : args,
          { timeout: 8000, maxBuffer: 16 * 1024 * 1024, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
      };
      run(['--check', source]); // Warnings/repair exit codes also reject the upload.
      const document: unknown = JSON.parse(run([
        '--json', '--json-stream-data=none', '--json-key=qpdf',
        '--json-key=encrypt', '--json-key=pages', source,
      ]).toString('utf8'));
      inspectPdfObjects(document);
      run([source, '--object-streams=generate', target]);
      output = readFileSync(target);
    } else {
      const formats: Record<string, string> = {
        'image/png': 'png', 'image/jpeg': 'jpeg', 'image/webp': 'webp',
      };
      if (!formats[message.mime]) throw new Error('Unsupported format');
      const image = sharp(input, {
        limitInputPixels: 16_000_000, failOn: 'warning', sequentialRead: true,
      }).timeout({ seconds: 8 });
      const metadata = await image.metadata();
      if (metadata.format !== formats[message.mime] || !metadata.width || !metadata.height ||
          metadata.width > 4000 || metadata.height > 4000 || (metadata.pages || 1) !== 1)
        throw new Error('Unsupported dimensions or animation');
      output = await image.rotate().resize({
        width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true,
      }).toColourspace('srgb').webp({ quality: 85 }).toBuffer();
    }
    if (!output.length || output.length > 5 * 1024 * 1024) throw new Error('Output size');
    result = { ok: true, base64: output.toString('base64') };
  } catch (error) {
    const unavailable = error instanceof Error &&
      (('code' in error && error.code === 'ENOENT') || ('status' in error && error.status === 127));
    result = { ok: false, unavailable };
  } finally {
    // This path is created here under the OS temporary directory, never supplied by a client.
    if (temporary && path.dirname(temporary) === path.resolve(tmpdir()) &&
        path.basename(temporary).startsWith('polad-pdf-'))
      rmSync(temporary, { recursive: true, force: true });
    process.send?.(result, () => process.disconnect?.());
  }
});
