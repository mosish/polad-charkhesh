import fs from 'node:fs';
import crypto from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import type { BearingProduct } from '../domain/product';
import { fieldValue, planCatalogReviewPatch, type ReviewRow, type CatalogReviewPatch } from '../api/catalog-review-patch';
import { validateProduct } from '../api/validation';
import { mediaFor } from '../lib/media';

interface ResearchSource {
  id?:string; ref?:string; url:string; title?:string; type?:string;
  accessDate?:string; accessedAt?:string; revision?:string|null;
  page?:unknown; sections?:unknown; pdfPagesOneBased?:unknown;
}
interface ResearchField {
  field:string; value:unknown; proposed:unknown; proposedValue:unknown;
  source:string; sourceId:string; sourceRef:string; sourceRefs?:string[];
  apply?:boolean; implementationEligible?:boolean; absent?:boolean;
  pdfPage:number; locator?:unknown; note?:string; reason?:string; evidenceScope?:string;
}
interface ResearchRecord {
  id:string; status?:string; reviewStatus?:string; manufacturer?:string;
  sources?:ResearchSource[]; fields?:ResearchField[]; fieldEvidence?:ResearchField[];
  verifiedFields?:Record<string,{value:unknown;sourceRef:string}>;
  proposedCorrections?:ResearchField[]; safeChanges?:Record<string,unknown>;
  identityAssessment?:unknown; identityNote?:unknown; identityStatus?:unknown; notes?:unknown;
  unresolved?:unknown[]; blockers?:unknown[]; fieldModelRisks?:unknown[]; conditionalCandidateFacts?:unknown[];
  sourceRefs?:string[]; identityIssues?:string[]; resolutionAction?:string; conditionalFacts?:unknown[]; candidateDesignation?:string;
  media?:{altEn?:string;altFa?:string;altTextEn?:string;altTextFa?:string;[key:string]:unknown};
}
interface Evidence {
  field:string; old:ReturnType<typeof fieldValue>; proposed:ReturnType<typeof fieldValue>|null;
  verdict:string; implementationEligible?:boolean; sourceRefs?:string[];
  sources:{url:string;accessDate:string;revision:string|null;locator:unknown}[]; reason?:string;
}
const root = 'docs/catalog-review';
const bytes = fs.readFileSync(`${root}/baseline.json`);
const baseline: BearingProduct[] = JSON.parse(bytes.toString()).products;
const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
if (baseline.length !== 110 || new Set(baseline.map(p=>p.id)).size !== 110 || new Set(baseline.map(p=>p.slug)).size !== 110) throw Error('Baseline identity/count mismatch.');
const files = fs.readdirSync(`${root}/research`).filter(f=>f.endsWith('.json')).sort();
const research = new Map<string, { record:ResearchRecord; file:string; globalSources:Record<string,ResearchSource> }>();
for(const file of files) {
  const data = JSON.parse(fs.readFileSync(`${root}/research/${file}`,'utf8')) as {records?:ResearchRecord[];products?:ResearchRecord[];sources?:Record<string,ResearchSource>};
  for(const record of data.records || data.products || []) {
    if(research.has(record.id)) throw Error(`Duplicate evidence ${record.id}`);
    research.set(record.id,{record,file,globalSources:data.sources || {}});
  }
}
const engineering = 'd D B weightKg crKn corKn speedGreaseRpm speedOilRpm speedReferenceRpm speedLimitingRpm thermalSpeedRatingRpm speedReferenceType cageMaterialEn cageMaterialFa sealingEn sealingFa clearanceOptions contactAngle rMin calculationFactorE calculationFactorX calculationFactorY calculationFactorY0 calculationFactorY1 calculationFactorY2 calculationFactorF0'.split(' ');
const translations: Record<string,string> = {
  'Pressed sheet steel':'ورق فولادی پرس‌کاری‌شده',
  'Two contact rubber seals (DDU)':'دو آب‌بند لاستیکی تماسی (DDU)',
  'Polyamide resin (nylon 66)':'رزین پلی‌آمید (نایلون ۶۶)',
  'Pressed cage':'قفسه پرس‌کاری‌شده',
  'Two contact seals (LLU)':'دو آب‌بند تماسی (LLU)',
  'Two contact seals (2RS)':'دو آب‌بند تماسی (2RS)',
  'Pressed steel cage':'قفسه فولادی پرس‌کاری‌شده',
  'Two contact seals (2NSE9)':'دو آب‌بند تماسی (2NSE9)',
  'Pressed steel cage with floating guide ring':'قفسه فولادی پرس‌کاری‌شده با حلقه راهنمای شناور',
  'Glass-reinforced nylon cage':'قفسه نایلونی تقویت‌شده با الیاف شیشه',
};
const patch: CatalogReviewPatch = {schemaVersion:1,baselineSha256:sha256,rows:[]};
const records = baseline.map(p => {
  const found = research.get(p.id);
  if(!found) throw Error(`Research not completed for ${p.id}`);
  const {record:r,file,globalSources} = found;
  const status = r.status || r.reviewStatus || '';
  if(!['partial','ambiguous_identity','blocked_evidence','verified'].includes(status)) throw Error(`Unknown status for ${p.id}: ${status}`);
  const sources = Array.isArray(r.sources) ? r.sources : Object.entries(globalSources).filter(([id])=>!r.sourceRefs||r.sourceRefs.includes(id)).map(([id,s])=>({id,...s}));
  const resolve = (refs:string[]) => refs.map(ref=>sources.find(s=>(s.id||s.ref)===ref)).filter((s):s is ResearchSource=>!!s);
  const evidence:Evidence[] = [];
  const proposed = new Map<string,{value:unknown;absent?:boolean;refs:string[];note:string}>();
  const add = (field:string,value:unknown,refs:string[],eligible:boolean,note='',locator:unknown=null,absent=false) => {
    if(!field) throw Error(`Evidence field missing ${p.id}`);
    const matched = resolve(refs);
    const item:Evidence = {field,old:fieldValue(p,field),proposed:absent?{present:false}:{present:true,value},
      verdict:eligible?'source_supported':'conditional_or_unmapped',implementationEligible:eligible,sourceRefs:refs,
      sources:matched.map(s=>({url:s.url,accessDate:s.accessDate||s.accessedAt||'2026-10-15',revision:s.revision??null,
        locator:locator??s.page??s.sections??s.pdfPagesOneBased??null})),reason:note};
    evidence.push(item);
    if(eligible) {
      if(!matched.length || matched.length!==refs.length || matched.some(s=>!s.url)) throw Error(`Eligible evidence missing URL ${p.id}/${field}`);
      proposed.set(field,{value,absent,refs,note});
    }
  };
  if(file==='skf-sealed.json') {
    for(const f of r.fields||[]) add(f.field,f.value,[f.source],true,f.note,`PDF${f.pdfPage}; printed${f.pdfPage+293}`,!!f.absent);
    if(p.code.endsWith('2Z')) add('descriptionEn',p.descriptionEn.replace('SKF sealed single-row','SKF shielded single-row'),['skf-dgbb-ja'],true,'Use shielded terminology consistently with the exact 2Z suffix.','PDF27; printed320');
    if(p.code.endsWith('2RZ')) {
      add('descriptionEn',`SKF ${p.code} single-row deep groove ball bearing with two non-contact NBR seals. Reference and limiting speeds are separate catalog ratings.`,['skf-dgbb-ja'],true,'Correct the seal type consistently in the description.','PDF27; printed320');
      add('descriptionFa',`بلبرینگ شیار عمیق تک‌ردیفه SKF ${p.code} با دو آب‌بند غیرتماسی NBR. سرعت مرجع و سرعت حدی، مشخصه‌های جداگانه کاتالوگ هستند.`,['skf-dgbb-ja'],true,'Persian translation of verified seal type.','PDF27; printed320');
    }
  } else if(r.verifiedFields) {
    for(const [field,f] of Object.entries(r.verifiedFields)) {
      add(field,f.value,[f.sourceRef],false,'Source observation; eligibility follows proposedCorrections.',null);
      evidence.at(-1)!.verdict = status==='partial' ? 'source_observation' : 'conditional_candidate';
    }
    if(status==='partial') for(const f of r.proposedCorrections||[]) {
      if(p.id==='pc-ntn-5206-s' && f.field.startsWith('calculationFactor')) continue;
      add(f.field,f.proposed,[f.sourceRef],true,f.reason);
      if(/(?:cageMaterial|sealing)En/.test(f.field)) {
        if(typeof f.proposed!=='string'||!translations[f.proposed]) throw Error(`Missing Persian translation ${JSON.stringify(f.proposed)}`);
        add(f.field.replace(/En$/,'Fa'),translations[f.proposed],[f.sourceRef],true,'Persian translation of the same source-backed correction.');
      }
    }
  } else if(r.safeChanges) {
    for(const f of r.fields||[]) add(f.field,f.proposed,[f.sourceId],f.apply===true && Object.hasOwn(r.safeChanges,f.field),f.reason,f.locator);
  } else {
    for(const f of r.fieldEvidence||[]) add(f.field,f.proposedValue,f.sourceRefs||[],f.implementationEligible===true,f.reason||f.evidenceScope,f.locator);
  }
  // All researched fields, including unresolved ones, retain explicit old values.
  for(const field of engineering) if(!evidence.some(f=>f.field===field)) evidence.push({field,old:fieldValue(p,field),proposed:null,verdict:'unverified',sources:[],reason:'No exact field evidence accepted in this review; preserve baseline, do not infer.'});
  const changes:ReviewRow['changes'] = [];
  for(const [field,proposal] of proposed) {
    const before=fieldValue(p,field), after=proposal.absent?{present:false as const}:{present:true as const,value:proposal.value};
    if(!isDeepStrictEqual(before,after)) changes.push({field,before,after,evidence:[`${p.id}#${field}`]});
  }
  if(changes.length && !['partial','verified'].includes(status)) throw Error(`Unresolved identity must not be patched: ${p.id}`);
  if(changes.length) {
    const used = new Set([...proposed.values()].flatMap(v=>v.refs));
    const appliedFields = changes.map(c=>c.field);
    const citations = resolve([...used]).map(s=>({manufacturer:r.manufacturer||p.brands[0],sourceType:(s.type==='official_product_table'||!s.url.toLowerCase().includes('.pdf')?'official_product_table':'official_catalog') as 'official_catalog'|'official_product_table',
      catalogCode:s.revision||s.id||s.ref,
      reference:`Partial review 2026-10-15: ${appliedFields.join(', ')}. ${s.title||'Official manufacturer source'}. See per-field pages and unresolved items in catalog review ledger; this date does not verify the whole product.`,
      url:s.url,verifiedAt:'2026-10-15'}));
    const afterSources=[...(p.technicalSources||[]),...citations];
    changes.push({field:'technicalSources',before:fieldValue(p,'technicalSources'),after:{present:true,value:afterSources},evidence:appliedFields.map(f=>`${p.id}#${f}`)});
    patch.rows.push({id:p.id,identity:{code:p.code,slug:p.slug,brands:p.brands,category:p.category,schematicType:p.schematicType},
      guards:Object.fromEntries([...engineering,'isArchived'].map(field=>[field,fieldValue(p,field)])),changes});
  }
  return {id:p.id,slug:p.slug,code:p.code,brands:p.brands,status,implementedInReviewPatch:changes.length>0,
    identityAssessment:r.identityAssessment||r.identityNote||r.identityStatus||r.notes||'See source-specific research',
    identityIssues:r.identityIssues||[],resolutionAction:r.resolutionAction||null,candidateDesignation:r.candidateDesignation||null,
    researchFile:`research/${file}`,fieldEvidence:evidence,sources,
    unresolved:[...(r.unresolved||r.blockers||[]),...(p.id==='pc-ntn-5206-s'?['NTN5206S is a double-row angular contact bearing, but the current schematicType is deep-groove. Calculation-factor corrections are withheld pending family/geometry reconciliation; this review does not validate its calculator.']:[])],
    fieldModelRisks:r.fieldModelRisks||[],conditionalCandidateFacts:r.conditionalCandidateFacts||r.conditionalFacts||[],
    media:{...r.media,
      replacementImplemented:false,exactMediaVerified:false,currentImageUrl:p.imageUrl??null,
      currentImages:p.images||[],displayFallback:mediaFor(p),
      altEn:r.media?.altEn||r.media?.altTextEn||`${p.code}: family reference illustration; exact appearance not verified`,
      altFa:r.media?.altFa||r.media?.altTextFa||`${p.code}: تصویر مرجع خانواده؛ ظاهر دقیق تأیید نشده است`},
    changedFields:changes.map(c=>c.field)};
});
if(research.size!==baseline.length) throw Error('Research contains IDs outside baseline.');
const plan=planCatalogReviewPatch(patch,baseline);
if(plan.errors.length) throw Error(plan.errors.join('\n'));
const byId=new Map(plan.products.map(p=>[p.id,p]));
const reviewed=baseline.map(p=>byId.get(p.id)||p);
for(const p of reviewed) if(validateProduct(p).length) throw Error(`${p.id}: ${validateProduct(p).join()}`);
const counts={total:records.length,fullyVerified:records.filter(r=>r.status==='verified').length,
  partial:records.filter(r=>r.status==='partial').length,ambiguousIdentity:records.filter(r=>r.status==='ambiguous_identity').length,
  blockedEvidence:records.filter(r=>r.status==='blocked_evidence').length,implementedInReviewPatch:patch.rows.length,
  sourceBackedFieldChanges:patch.rows.reduce((n,r)=>n+r.changes.filter(c=>c.field!=='technicalSources').length,0),
  exactMediaMissing:records.filter(r=>!r.media.exactMediaVerified).length,mediaReplacements:0};
const ledger={schemaVersion:1,reviewDate:'2026-10-15',baseline:{url:'https://poladcharkhesh.ir/api/products',sha256,count:110,refreshed:'2026-10-15',refreshResult:'Live endpoint JSON structurally identical to checkpoint.'},
  scope:'Manufacturer-source review. Partial technical corrections only; not deployment or company-datasheet clearance.',counts,records};
fs.writeFileSync(`${root}/ledger.json`,JSON.stringify(ledger,null,2)+'\n');
fs.writeFileSync(`${root}/review.patch.json`,JSON.stringify(patch,null,2)+'\n');
fs.mkdirSync('work/catalog-review',{recursive:true});
// Full merged preview is scratch-only; use review.patch.json to avoid overwriting concurrent edits.
fs.writeFileSync('work/catalog-review/reviewed-products.json',JSON.stringify({products:reviewed,count:110},null,2)+'\n');
const printable=(x:unknown)=>JSON.stringify(x).replace(/\|/g,'\\|');
const report=[`# Manufacturer catalog review — 2026-10-15`,'',
  '**NOT READY for catalog verification sign-off, deployment or company datasheet production.**','',
  `All ${counts.total} public IDs/slugs are covered. ${counts.implementedInReviewPatch} records have source-backed corrections in the review patch (${counts.sourceBackedFieldChanges} fields, excluding source metadata). No live catalog changes were made.`, '',
  '| Review result | Records |','|---|---:|',`| Fully verified | ${counts.fullyVerified} |`,`| Partial | ${counts.partial} |`,`| Ambiguous identity | ${counts.ambiguousIdentity} |`,`| Blocked exact technical evidence | ${counts.blockedEvidence} |`,`| Missing verified exact media (overlaps all statuses) | ${counts.exactMediaMissing} |`,`| Media replacements | 0 |`,'',
  'A partial record is not fully verified: unsupported baseline values remain visible in the ledger. Counted implementation means prepared and validated in the isolated import dataset, not saved to the public website. All existing identities, source text not targeted by a correction, and reference media are preserved.','',
  '## Blocking decisions','',
  'The 43 original multibrand records require the owner to specify each actual manufacturer, complete suffix and supplied assembly. Group aliases (FAG/Schaeffler, INA/Schaeffler, KOYO/JTEKT and Corteco/Freudenberg) are not automatically treated as competing manufacturers. Timken cone/cup pairs are valid component pairs. Specific Corteco part-number/dimension conflicts, INA NK25/20 versus XL, NSK matched-pair scope, inaccessible exact sources and media rights/identity remain open.','',
  '## Import and reproducibility','',
  '`pnpm exec tsx scripts/build-catalog-review.ts` rebuilds the ledger, patch and report from the committed public baseline and record research. It never reads a live database. `review.patch.json` can be selected in the application Admin catalog JSON import after integration of this branch. Preview shows changes, and saving requires the existing review checkbox/confirmation. Both baseline field guards and preview revision checks must pass.','',
  'Apply the patch only after reviewing each source-backed change. It cannot create products, rename codes, change manufacturers or alter IDs/slugs. Unrelated owner edits are merged from current records. Conflicts stop the entire batch. For changed specifications, re-review the affected record; never strip the guards or replace the live database with the scratch merged preview.','',
  'Evidence sources include older official catalog editions as well as current product pages. Access date is not publication date; unknown revisions stay unknown. Catalog d/D/B, overall tapered width T, housing height, minimum bearing chamfer and maximum installation fillet are different concepts. SKF reference/limiting speeds and Timken/NSK thermal speeds retain their source meanings. Existing zero placeholders are not newly certified zero ratings.','',
  'Clearance arrays are normalized only where the exact designation is established: the public product page labels this field as Clearance. This describes the reviewed SKU and does not certify owner stock or offered alternate suffixes. Alternative clearances require explicit designation records. NTN5206S calculation factors remain withheld because its current deep-groove schematic conflicts with its double-row angular-contact identity; calculator and geometry reconciliation is still required.','',
  'Full manufacturer PDFs/HTML and temporary renders remain local in ignored work directories; links, hashes where available, table/page locators and factual field observations are the review assets. No source archive, credentials, private database, backup or owner upload was copied from the original workspace.','',
  '## Product coverage','', '| ID / designation | Status | Changed fields | Primary research |','|---|---|---|---|',
  ...records.map(r=>`| ${r.id} / ${r.code.replace(/\|/g,'\\|')} | ${r.status} | ${r.changedFields.filter((f:string)=>f!=='technicalSources').join(', ')||'None; held'} | [Evidence](${r.researchFile}) |`),
  '', '## Before / after (implemented technical and bilingual copy changes)','', '| Product | Field | Before | Proposed | Evidence |','|---|---|---|---|---|',
  ...patch.rows.flatMap(r=>r.changes.filter(c=>c.field!=='technicalSources').map(c=>`| ${r.id} | ${c.field} | ${c.before.present?printable(c.before.value):'absent'} | ${c.after.present?printable(c.after.value):'absent'} | ${c.evidence.join(', ')} |`)),
  '', '## Validation','', 'See `validation.json` for executed checks. Generation alone validates coverage, types, stable identity, source-linked changes and conflict-aware planning; it does not claim that all manufacturer values or media are verified.',''];
fs.writeFileSync(`${root}/REPORT.md`,report.join('\n'));
const blockers=['# Unresolved catalog verification items','',
  'All 110 records still require exact media evidence and reuse clearance. The following notes separate identity decisions from partial technical verification. Do not treat a presence-check score in Admin as verification. See REPORT.md for the proposed corrections and ledger.json for every field.','',
  ...records.flatMap(r=>[`## ${r.code} (${r.id})`,'',`Status: **${r.status}**. [Source research](${r.researchFile}).`,
    ...(r.resolutionAction?['',r.resolutionAction]:[]),'',
    ...[...r.identityIssues,...r.unresolved].map(issue=>`- ${typeof issue==='string'?issue:JSON.stringify(issue)}`),''])];
fs.writeFileSync(`${root}/BLOCKERS.md`,blockers.join('\n'));
console.log(JSON.stringify(counts,null,2));
