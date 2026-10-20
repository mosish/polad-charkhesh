import crypto from 'node:crypto';

export const mfaRequired = process.env.MFA_REQUIRED === 'true' ||
  (process.env.NODE_ENV === 'production' && process.env.MFA_REQUIRED !== 'false');
const configuredKey = process.env.MFA_ENCRYPTION_KEY;
if (mfaRequired && !/^[a-f0-9]{64}$/i.test(configuredKey || ''))
  throw new Error('MFA_ENCRYPTION_KEY must be a separate 32-byte hex key when MFA is required.');
// Optional development enrollment is available only with an explicitly persistent key.
export const mfaAvailable = /^[a-f0-9]{64}$/i.test(configuredKey || '');
const key = () => {
  if (!mfaAvailable) throw new Error('MFA encryption is not configured.');
  return Buffer.from(configuredKey!, 'hex');
};
export function sealSecret(secret: string, adminId: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  cipher.setAAD(Buffer.from(adminId));
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map(b => b.toString('base64url')).join('.');
}
export function openSecret(value: string, adminId: string) {
  const [iv, tag, encrypted] = value.split('.').map(s => Buffer.from(s, 'base64url'));
  const cipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
  cipher.setAAD(Buffer.from(adminId));
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(encrypted), cipher.final()]).toString('utf8');
}
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function newTotpSecret() {
  const bytes = crypto.randomBytes(20);
  let bits = 0, value = 0, output = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) { output += alphabet[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  return output;
}
function fromBase32(secret: string) {
  if (!/^[A-Z2-7]{32}$/.test(secret)) throw new Error('Invalid TOTP secret');
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const letter of secret) {
    value = (value << 5) | alphabet.indexOf(letter);
    bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}
export function totp(secret: string, step: number, digits = 6) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = crypto.createHmac('sha1', fromBase32(secret)).update(counter).digest();
  const offset = digest[19] & 15;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits).padStart(digits, '0');
}
export function matchTotp(secret: string, code: unknown, lastStep = -1, now = Date.now()) {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return null;
  const current = Math.floor(now / 30_000);
  for (const step of [current, current - 1, current + 1]) {
    if (step > lastStep && crypto.timingSafeEqual(Buffer.from(totp(secret, step)), Buffer.from(code)))
      return step;
  }
  return null;
}
export function recoveryHash(code: string) {
  return crypto.createHash('sha256').update(code.replace(/-/g, '').toLowerCase()).digest('hex');
}
export function newRecoveryCodes() {
  const codes = Array.from({ length: 10 }, () => crypto.randomBytes(16).toString('hex').match(/.{8}/g)!.join('-'));
  return { codes, hashes: JSON.stringify(codes.map(recoveryHash)) };
}
