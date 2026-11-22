import { test } from 'node:test';
import assert from 'node:assert/strict';
import { companyProfile, companyProfileDefaults } from '../domain/company-profile';
import { upgradeContent } from '../domain/site-content';
void test('company profile defaults preserve CMS edits and intentional empty fields', () => {
  const original={why:{titleFa:'عنوان شرکت',profileHistoryFa:'سابقه اختصاصی',profileNetworkEn:''}};
  const upgraded=upgradeContent(original);
  const why=upgraded.why as Record<string,string>;
  assert.equal(why.titleFa,original.why.titleFa);
  assert.equal(why.profileHistoryFa,original.why.profileHistoryFa);
  assert.equal(why.profileScopeEn,companyProfileDefaults.profileScopeEn);
  assert.ok(!companyProfile(why,false).some(field=>field.id==='profileNetwork'));
  assert.equal(companyProfile(why,true).find(field=>field.id==='profileHistory')?.text,'سابقه اختصاصی');
  assert.deepEqual(original,{why:{titleFa:'عنوان شرکت',profileHistoryFa:'سابقه اختصاصی',profileNetworkEn:''}});
  assert.deepEqual(upgradeContent(upgraded),upgraded);
});
