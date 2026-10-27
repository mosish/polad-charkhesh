#!/usr/bin/env node
// VPS-local observations only. No mail, webhooks, credentials or backup exports.
import https from 'node:https';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, statfsSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function assessOperations(facts) {
  const issues = [];
  if (!facts.serviceActive) issues.push('Application service is not active.');
  if (!facts.mfaRequired || !facts.mfaAvailable) issues.push('Mandatory MFA configuration is not active.');
  if (!Number.isFinite(facts.freeBytes) || !Number.isFinite(facts.freeRatio) ||
      facts.freeBytes < 1073741824 || facts.freeRatio < 0.05)
    issues.push('Disk headroom is below 1 GiB or 5%.');
  if (!Number.isFinite(facts.backupAgeHours) || facts.backupAgeHours < 0 || facts.backupAgeHours > 30)
    issues.push('Verified encrypted backup is missing, future-dated or older than 30 hours.');
  for (const site of facts.sites) {
    if (!site.healthy) issues.push(site.domain + ': trusted HTTPS health check failed.');
    if (!Number.isFinite(site.certificateDays) || site.certificateDays < 7)
      issues.push(site.domain + ': TLS certificate has fewer than seven days remaining.');
  }
  return issues;
}

function request(domain, route) {
  return new Promise((resolve, reject) => {
    const req = https.get({ hostname: domain, port: 443, path: route, timeout: 12000 }, res => {
      const expiry = Date.parse(res.socket.getPeerCertificate()?.valid_to || '');
      let body = '';
      res.on('data', chunk => {
        body += chunk;
        if (body.length > 8192) req.destroy(new Error('Unexpected response size.'));
      });
      res.on('error', reject);
      res.on('end', () => resolve({ status: res.statusCode, body, expiry }));
    });
    req.on('timeout', () => req.destroy(new Error('Request timed out.')));
    req.on('error', reject);
  });
}

async function probeSite(domain) {
  try {
    const health = await request(domain, '/api/health');
    return { domain, healthy: health.status === 200 && JSON.parse(health.body).status === 'ok',
      certificateDays: (health.expiry - Date.now()) / 86400000 };
  } catch {
    return { domain, healthy: false, certificateDays: null };
  }
}

export async function monitor() {
  const directory = '/var/lib/polad-monitor';
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  if (lstatSync(directory).isSymbolicLink()) throw new Error('Monitor directory must not be a symlink.');
  const target = path.join(directory, 'latest.json');
  let previous = {};
  if (existsSync(target)) previous = JSON.parse(readFileSync(target, 'utf8'));
  const checkedAt = new Date().toISOString();
  let serviceActive = false;
  try { serviceActive = execFileSync('systemctl', ['is-active', 'polad-charkhesh'], { encoding: 'utf8', timeout: 5000 }).trim() === 'active'; }
  catch { /* Report an inactive or unavailable service below. */ }
  const disk = statfsSync('/var/lib/polad-charkhesh');
  const backupRoot = '/var/backups/polad-charkhesh/encrypted';
  let latestBackup = null;
  if (existsSync(backupRoot)) {
    for (const name of readdirSync(backupRoot)) {
      if (!/^backup-[a-zA-Z0-9T.-]+\.tar\.age$/.test(name)) continue;
      const file = path.join(backupRoot, name);
      if (lstatSync(file).isSymbolicLink() || !existsSync(file + '.sha256')) continue;
      const item = statSync(file);
      if (item.isFile() && item.size > 0 && (!latestBackup || item.mtimeMs > latestBackup.mtimeMs))
        latestBackup = { name, size: item.size, mtimeMs: item.mtimeMs };
    }
  }
  // Read flags locally: Cloudflare Access may correctly deny anonymous auth-status requests.
  // No secret value is included in the facts, logs, reports or process arguments.
  const configuration = readFileSync('/etc/polad-charkhesh/env', 'utf8');
  const configured = key => configuration.match(new RegExp('^' + key + '=(.*)$', 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '') || '';
  const facts = { serviceActive, mfaRequired: configured('NODE_ENV') === 'production' && configured('MFA_REQUIRED') !== 'false',
    mfaAvailable: /^[a-f0-9]{64}$/i.test(configured('MFA_ENCRYPTION_KEY')),
    freeBytes: disk.bavail * disk.bsize, freeRatio: disk.bavail / disk.blocks,
    backupAgeHours: latestBackup ? (Date.now() - latestBackup.mtimeMs) / 3600000 : null,
    sites: await Promise.all(['poladcharkhesh.ir', 'poladcharkhesh.com'].map(probeSite)) };
  const issues = assessOperations(facts);
  let securityEvents = [];
  let lastSecurityCheckAt = previous.lastSecurityCheckAt || new Date(Date.now() - 86400000).toISOString();
  try {
    const db = new DatabaseSync('/var/lib/polad-charkhesh/platform.sqlite', { readOnly: true });
    try {
      // Never copy actors, inquiries, tokens, audit entities or other owner data.
      securityEvents = db.prepare("SELECT timestamp,action FROM audit_logs WHERE action LIKE 'SECURITY_ALERT_%' AND timestamp>? ORDER BY timestamp LIMIT 100")
        .all(lastSecurityCheckAt);
      lastSecurityCheckAt = checkedAt;
    } finally { db.close(); }
  } catch { issues.push('Security event log could not be inspected.'); }
  const report = { checkedAt, status: issues.length ? 'attention' : 'healthy', issues, facts, latestBackup,
    lastSecurityCheckAt, securityEvents };
  writeFileSync(target + '.next', JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
  renameSync(target + '.next', target);
  if (JSON.stringify(previous.issues || []) !== JSON.stringify(issues) || securityEvents.length)
    console.warn(JSON.stringify({ event: issues.length || securityEvents.length ? 'OPERATIONS_ALERT' : 'OPERATIONS_RECOVERED',
      checkedAt, issues, securityEvents }));
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { const result = await monitor(); if (result.status !== 'healthy') process.exitCode = 1; }
  catch { console.error('OPERATIONS_ALERT: monitoring could not complete.'); process.exitCode = 1; }
}
