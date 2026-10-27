import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessOperations } from '../deploy/monitor.mjs';

const healthy = () => ({ serviceActive: true, mfaRequired: true, mfaAvailable: true, freeBytes: 5 * 1073741824, freeRatio: 0.4,
  backupAgeHours: 5, sites: ['poladcharkhesh.ir', 'poladcharkhesh.com'].map(domain =>
    ({ domain, healthy: true, certificateDays: 45 })) });
void test('operations checks accept a current verified backup and trusted healthy domains', () => {
  assert.deepEqual(assessOperations(healthy()), []);
});
void test('missing, stale, future-dated backups and low disk space require attention', () => {
  for (const backupAgeHours of [null, NaN, 31, -1])
    assert.ok(assessOperations({ ...healthy(), backupAgeHours }).some(x => x.includes('backup')));
  for (const disk of [{ freeBytes: 10, freeRatio: 0.5 }, { freeBytes: 5 * 1073741824, freeRatio: 0.01 }])
    assert.ok(assessOperations({ ...healthy(), ...disk }).some(x => x.includes('Disk')));
});
void test('outages, expiring certificates and inactive MFA are separately reported', () => {
  const facts = healthy();
  facts.serviceActive = false;
  facts.mfaRequired = false;
  facts.sites[0] = { ...facts.sites[0], healthy: false, certificateDays: 6 };
  const issues = assessOperations(facts);
  assert.equal(issues.length, 4);
  assert.ok(issues.every(x => !/password|cookie|token/i.test(x)));
});
