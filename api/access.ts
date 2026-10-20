import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import type { RequestHandler } from 'express';

export async function verifyAccessToken(token: string, issuer: string, audience: string[], keys: JWTVerifyGetKey) {
  const { payload } = await jwtVerify(token, keys, {
    issuer, audience, algorithms: ['RS256'], clockTolerance: 5,
    requiredClaims: ['exp', 'iat', 'sub', 'email'],
  });
  if (typeof payload.email !== 'string' || !payload.email || payload.type !== 'app')
    throw new Error('Invalid Access identity');
  return payload;
}
const issuer = process.env.CLOUDFLARE_ACCESS_ISSUER || '';
const audience = (process.env.CLOUDFLARE_ACCESS_AUDIENCE || '').split(',').filter(Boolean);
if ((issuer || audience.length) &&
    (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(issuer) || !audience.length))
  throw new Error('Configure both Cloudflare Access issuer and application audience.');
const keys = issuer ? createRemoteJWKSet(new URL(issuer + '/cdn-cgi/access/certs'), {
  timeoutDuration: 5000, cooldownDuration: 30_000,
}) : null;
export function protectedAccessPath(path: string, method: string, query: Record<string, unknown>) {
  if (/^\/admin(?:\/|$)/i.test(path) || query.preview === '1') return true;
  if (!/^\/api(?:\/|$)/i.test(path)) return false;
  if (method === 'POST' && path === '/api/inquiries') return false;
  if (['GET', 'HEAD'].includes(method) &&
      /^\/api\/(?:health|products(?:\/[^/]+)?|company|content|seo)\/?$/.test(path) &&
      query.includeArchived !== 'true') return false;
  return true;
}
export const accessBoundary: RequestHandler = async (req, res, next) => {
  if (!keys || !protectedAccessPath(req.path, req.method, req.query)) return next();
  const token = req.get('Cf-Access-Jwt-Assertion') || req.cookies?.CF_Authorization;
  try {
    if (typeof token !== 'string' || token.length > 16000) throw new Error('Missing Access token');
    await verifyAccessToken(token, issuer, audience, keys);
    next();
  } catch {
    res.status(403).set('Cache-Control', 'no-store').json({
      error: 'Sign in through the protected administration page to continue.',
    });
  }
};
