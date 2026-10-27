#!/usr/bin/env node
// VPS-local observations only. No mail, webhooks, credentials or backup exports.
import https from 'node:https';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, statfsSync, statSync, writeFileSync } from 'node:fs';
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

export function securityEventsFromJournal(text, checkedAt) {
  return text.split('\n').flatMap(line => {
    try {
      const value = JSON.parse(line);
      if (!/^SECURITY_ALERT_[A-Z_]+$/.test(value.event || '')) return [];
      return [{ timestamp: typeof value.at === 'string' && Number.isFinite(Date.parse(value.at)) ? value.at : checkedAt,
        action: value.event }];
    } catch { return []; }
  });
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
    // Account lockouts and recovery use already emit structured warnings. Read
    // the service journal without bypassing permissions on the private database.
    const journal = execFileSync('journalctl', ['--unit=polad-charkhesh.service', '--since=' + lastSecurityCheckAt,
      '--output=cat', '--no-pager', '--lines=1001'], { encoding: 'utf8', timeout: 5000, maxBuffer: 2 * 1024 * 1024 });
    securityEvents = securityEventsFromJournal(journal, checkedAt);
    if (journal.trim().split('\n').length > 1000) issues.push('Security journal scan reached its bound; inspect the service journal.');
    else lastSecurityCheckAt = checkedAt;
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

// The production `current` directory is a symlink. Node resolves import.meta.url
// to the release directory while argv retains the launch alias.
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  try {
    if (process.argv.includes('--check-launch')) console.log('MONITOR_ENTRYPOINT_OK');
    else { const result = await monitor(); if (result.status !== 'healthy') process.exitCode = 1; }
  }
  catch { console.error('OPERATIONS_ALERT: monitoring could not complete.'); process.exitCode = 1; }
}
