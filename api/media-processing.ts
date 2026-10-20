import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';

let active = 0;
export class MediaValidationError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export async function normalizeMedia(input: Buffer, mime: string) {
  if (!['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(mime))
    throw new MediaValidationError('Choose a PNG, JPEG, WebP or static PDF.');
  if (active >= 2) throw new MediaValidationError('Media processing is busy. Try again shortly.', 503);
  active++;
  try {
    return await new Promise<{ bytes: Buffer; mime: 'image/webp' | 'application/pdf'; ext: string }>((resolve, reject) => {
      const source = import.meta.url.endsWith('.ts');
      const options = {
        execArgv: [...(source ? ['--import', 'tsx'] : []), '--max-old-space-size=128'],
        stdio: ['ignore', 'ignore', 'ignore', 'ipc'] as const, windowsHide: true,
        // Decoders do not need session secrets, MFA keys or database paths.
        env: Object.fromEntries(['PATH', 'Path', 'SystemRoot', 'TEMP', 'TMP', 'TMPDIR', 'QPDF_PATH']
          .filter(key => process.env[key] !== undefined).map(key => [key, process.env[key]])),
      };
      const child = fork(fileURLToPath(new URL(source ? './media-worker.ts' : './media-worker.js', import.meta.url)), [], {
        ...options, stdio: [...options.stdio],
      });
      let settled = false;
      const finish = (error?: MediaValidationError, output?: string) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        // Successful workers disconnect after removing their private scratch files.
        if (error) child.kill();
        if (error || !output) reject(error || new MediaValidationError('The file could not be validated.'));
        else resolve({
          bytes: Buffer.from(output, 'base64'),
          mime: mime === 'application/pdf' ? mime : 'image/webp',
          ext: mime === 'application/pdf' ? 'pdf' : 'webp',
        });
      };
      const timer = setTimeout(() => finish(new MediaValidationError('File processing exceeded its resource limit.')), 25_000);
      child.once('error', () => finish(new MediaValidationError('Media validation is unavailable.', 503)));
      child.once('exit', () => finish());
      child.once('message', (result: { ok?: boolean; base64?: string; unavailable?: boolean }) =>
        finish(result.ok ? undefined : new MediaValidationError(
          result.unavailable ? 'PDF validation is unavailable. Contact the administrator.' :
            'Upload a valid static PDF or a single-frame image up to 4000 × 4000 pixels.',
          result.unavailable ? 503 : 400,
        ), result.base64));
      child.send({ mime, base64: input.toString('base64') });
    });
  } finally { active--; }
}
