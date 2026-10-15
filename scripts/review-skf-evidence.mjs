// Independent transcription from manufacturer tables visually inspected 2026-10-15.
// No seed imports. Run from repository root; input is the PUBLIC endpoint snapshot.
import fs from 'node:fs';
import crypto from 'node:crypto';
const directory = 'docs/catalog-review';
const baseline = JSON.parse(fs.readFileSync(`${directory}/baseline.json`, 'utf8')).products;
const url = 'https://cdn.skfmediahub.skf.com/api/public/0901d1968063464b/pdf_preview_medium/0901d1968063464b_pdf_preview_medium.pdf';
const source = {
  id: 'skf-dgbb-ja', manufacturer: 'SKF', url, accessDate: '2026-10-15',
  title: 'SKF deep groove ball bearings, Japanese catalog excerpt, section 1.2',
  revision: 'Publication revision not stated in downloaded excerpt; PDF creation metadata 2021-06-26 is not a publication revision.',
  localOriginal: 'work/sources/skf-ball-bearings.pdf',
  sha256: fs.existsSync('work/sources/skf-ball-bearings.pdf') ? crypto.createHash('sha256').update(fs.readFileSync('work/sources/skf-ball-bearings.pdf')).digest('hex') : "9e8b40ee99b86da8051aaf61152eb25345c06f90555f4b44bbf17abab9469a4d",
  pagesInspected: [19,27,28,59,60,61,62,63,64,65,66],
  pagination: 'One-based PDF page; printed page = PDF page + 293.',
};
// base,d,D,B,C,C0,reference,limit-shield,limit-contact,weight-shield,weight-sealed,rMin,f0,page
const rows = [
 ['6002',15,32,9,5.85,2.85,50000,26000,14000,.032,.03,.3,14,59],
 ['6202',15,35,11,8.06,3.75,43000,22000,13000,.048,.046,.6,13,59],
 ['6302',15,42,13,11.9,5.4,38000,19000,12000,.086,.085,1,12,59],
 ['6003',17,35,10,6.37,3.25,45000,22000,13000,.041,.039,.3,14,61],
 ['6203',17,40,12,9.95,4.75,38000,19000,12000,.068,.067,.6,13,61],
 ['6303',17,47,14,14.3,6.55,34000,17000,11000,.12,.12,1,12,61],
 ['6004',20,42,12,9.95,5,38000,19000,11000,.071,.067,.6,14,61],
 ['6304',20,52,15,16.8,7.8,30000,15000,9500,.15,.15,1.1,12,63],
 ['6005',25,47,12,11.9,6.55,32000,16000,9500,.083,.08,.6,14,63],
 ['6205',25,52,15,14.8,7.8,28000,14000,8500,.13,.13,1,14,63],
 ['6305',25,62,17,23.4,11.6,24000,13000,7500,.23,.23,1.1,12,63],
 ['6006',30,55,13,13.8,8.3,28000,14000,8000,.12,.12,1,15,65],
 ['6206',30,62,16,20.3,11.2,24000,12000,7500,.2,.2,1,14,65],
 ['6306',30,72,19,29.6,16,20000,11000,6300,.36,.36,1.1,13,65],
];
const records = [];
for (const [base,d,D,B,crKn,corKn,reference,limit,contactLimit,shieldMass,sealedMass,rMin,f0,page] of rows) {
  const late = ['6305','6006','6206','6306'].includes(base);
  for (const suffix of ['2Z',late?'2RZ':'2RSL',late?'2RS1':'2RSH']) {
    const code = `${base}-${suffix}`;
    const p = baseline.find(x=>x.id===`skf-${code.toLowerCase()}`);
    if (!p || p.code !== code || p.brands.join() !== 'SKF') throw Error(`Identity mismatch ${code}`);
    const contact = ['2RSH','2RS1'].includes(suffix);
    const seal = suffix==='2Z' ? ['Two shields','دو حفاظ فلزی'] : suffix==='2RSL' ? ['Two low-friction NBR seals','دو آب‌بند کم‌اصطکاک NBR'] : suffix==='2RZ' ? ['Two non-contact NBR seals','دو آب‌بند غیرتماسی NBR'] : ['Two contact NBR seals','دو آب‌بند تماسی NBR'];
    const values = {d,D,B,crKn,corKn,weightKg:suffix==='2Z'?shieldMass:sealedMass,
      speedLimitingRpm:contact?contactLimit:limit,
      ...(contact?{}:{speedReferenceRpm:reference}),rMin,calculationFactorF0:f0,
      cageMaterialEn:'Pressed sheet steel, ball-guided',cageMaterialFa:'فولاد پرس‌کاری‌شده، با هدایت ساچمه',
      clearanceOptions:['CN'],sealingEn:seal[0],sealingFa:seal[1]};
    const fields = Object.entries(values).map(([field,value])=>({field,value,source:'skf-dgbb-ja',
      pdfPage:field==='rMin'||field==='calculationFactorF0'?page+1:field.startsWith('cage')||field.startsWith('sealing')?27:field==='clearanceOptions'?19:page,
      note:field==='clearanceOptions'?'Normal clearance for this unsuffixed standard bearing, not a list of interchangeable C3/C4 variants.':field.startsWith('speed')?'Manufacturer reference/limiting speed; not a grease/oil-specific rating.':undefined}));
    if(contact) fields.push({field:'speedReferenceRpm',absent:true,source:'skf-dgbb-ja',pdfPage:page,note:'Catalog dash: no reference rating published for contact-sealed variant. Not zero RPM.'});
    records.push({id:p.id,manufacturer:'SKF',designation:code,identityStatus:'exact',status:'partial',sources:[source],fields,
      unmapped:[{field:'contactAngle',status:'not_specified',note:'No fixed nominal contact angle stated for this deep-groove designation; do not invent 0 degrees.'},
        {field:'calculationFactorE/X/Y/Y0',status:'application_dependent',note:'Load-dependent factors are not fixed SKU constants; preserve engineering formulas.'},
        {field:'speedGreaseRpm/speedOilRpm',status:'legacy_not_published',note:'Baseline zero placeholders preserved for required legacy fields; not evidence of a zero speed limit.'}],
      unresolved:['Current product-page confirmation unavailable (SKF website Access Denied).','Publication revision absent from official excerpt.','Exact product media and reproduction permission unresolved.'],
      media:{status:'blocked',classification:'no_verified_exact_asset',productPage:`https://www.skf.com/group/products/rolling-bearings/ball-bearings/deep-groove-ball-bearings/productid-${code}`,
        accessEvidence:'Representative 6002-2RSH page returned Access Denied in browser 2026-10-15; 42 individual pages were not probed after that restriction.',
        candidateSource:url,candidateClassification:'family sectional drawing in catalog, not exact photograph',reuseTerms:'Not established; no license inferred from public availability.',
        decision:'Retain existing labeled family reference. No stock/generated substitute.',decode:'not_applicable_no_replacement',
        altEn:`SKF ${code}: bearing family reference illustration`,altFa:`SKF ${code}: تصویر مرجع خانواده بیرینگ`}});
  }
}
fs.mkdirSync(`${directory}/research`,{recursive:true});
fs.writeFileSync(`${directory}/research/skf-sealed.json`,JSON.stringify({scope:'42 SKF sealed single-row bearings',records},null,2)+'\n');
console.log(`Independently transcribed ${records.length} SKF rows.`);
