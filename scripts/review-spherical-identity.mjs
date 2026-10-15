import fs from 'node:fs';
const baseline = JSON.parse(fs.readFileSync('docs/catalog-review/baseline.json','utf8')).products;
const source = {id:'skf-srb-18406',url:'https://www.skf.com/binaries/pub12/Images/0901d196808a4ad1-Spherical-roller-bearings_18406-EN_tcm_12-480491.pdf',title:'SKF Spherical roller bearings',revision:'PUB BU/P2 18406 EN, April 2019',accessDate:'2026-10-15',access:'Complete official PDF text opened; table screenshots not available in this review',reuseTerms:'PDF68: reproduction including extracts requires prior written permission; no image publishing grant established.'};
/** @type {Array<[string, number, Record<string, number>, string]>} */
const entries = [
 ['pc-22212-ek',23,{d:60,D:110,B:28,crKn:159,corKn:166,weightKg:1.15,speedReferenceRpm:5600,speedLimitingRpm:7500},'22212 EK is the bearing; H312 is a compatible adapter sleeve, not an alternative suffix. PDF53 lists assembled shaft diameter d1=55 mm and combined mass1.45 kg. Baseline d60 and mass1.15 describe bearing alone. Confirm supplied assembly and manufacturer; C3 is also a separate clearance specification.'],
 ['pc-22316-cc-w33',23,{},'Opened catalog lists 22316 E/EK, not the baseline CC/W33. Do not substitute the newer design or its 516/530kN ratings for a legacy CC/W33. Obtain the exact legacy manufacturer table after identity decision.'],
 ['pc-22220-ek',25,{d:100,D:180,B:46,crKn:433,corKn:490,weightKg:4.9,speedReferenceRpm:3400,speedLimitingRpm:4500},'SKF EK base-row values differ from stored C425/mass4.85. C3 must be separately confirmed. Other listed manufacturers are not evidence of identical ratings.'],
 ['pc-22324-ccja-w33va405',27,{d:120,D:260,B:86,crKn:1019,corKn:1120,weightKg:23,speedReferenceRpm:2000,speedLimitingRpm:2600},'Exact SKF CCJA/W33VA405 row exists, but generic record also lists FAG/Timken. Baseline1040/1200kN and22kg conflict with this edition. CC/VA405 cage construction and C4 require suffix-specific reconciliation; do not retain brass-cage assertion as verified.'],
 ['pc-23228-cc-w33',29,{d:140,D:250,B:88,crKn:962,corKn:1250,weightKg:19,speedReferenceRpm:1700,speedLimitingRpm:2400},'Exact SKF CC/W33 row differs from baseline1020/1370kN and18kg. A manufacturer choice is required before applying SKF-specific values.'],
];
const records = entries.map(([id,pdfPage,values,note])=>{
 const p=baseline.find(p=>p.id===id);
 return {id,slug:p.slug,status:'ambiguous_identity',identityAssessment:`One stored specification record lists ${p.brands.join(', ')}. ${note}`,sources:[source],
  fieldEvidence:Object.entries(values).map(([field,value])=>({field,oldValue:p[field]??null,proposedValue:value,sourceRefs:['skf-srb-18406'],locator:`PDF ${pdfPage}, printed ${pdfPage+1}, exact SKF row`,implementationEligible:false,evidenceScope:'conditional_manufacturer_only'})),
  supportedChanges:[],unresolved:[note,'Owner must identify manufacturer and supplied full designation/accessories. No brand selected by this review.','Remaining cage, seal, clearance, chamfers, contact angle and factors are unverified for the multibrand record.'],
  media:{status:'identity_blocked',candidateUrl:source.url,classification:'catalog family drawings',attribution:'SKF Group',reuseTerms:source.reuseTerms,action:'Retain existing labeled family reference; no exact asset approved.'}};
});
fs.writeFileSync('docs/catalog-review/research/ambiguous-spherical.json',JSON.stringify({records},null,2)+'\n');
