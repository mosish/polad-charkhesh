import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { BearingProduct } from '../domain/product';
import { calculationFamilyFlags as familyFlags } from '../domain/engineering';

// Offline review only: no database connection, network access or catalog mutation.
// Input must be a saved PUBLIC /api/products response, never a private admin backup.
const [input, outputDirectory] = process.argv.slice(2);
if (!input || !outputDirectory) throw new Error('Usage: tsx scripts/audit-engineering-foundation.ts PUBLIC_PRODUCTS_JSON OUTPUT_DIRECTORY');
const raw = readFileSync(input, 'utf8').replace(/^\uFEFF/, '');
let parsed: unknown = JSON.parse(raw);
if (typeof parsed === 'string') parsed = JSON.parse(parsed);
const products = (Array.isArray(parsed) ? parsed : (parsed as { products?: unknown })?.products) as BearingProduct[];
if (!Array.isArray(products) || !products.length || products.some((p) => !p || typeof p.id !== 'string' || typeof p.code !== 'string' || typeof p.schematicType !== 'string')) {
  throw new Error('Expected a nonempty public product array with IDs, codes and schematic families.');
}
if (new Set(products.map((p) => p.id)).size !== products.length) throw new Error('Duplicate product IDs.');
type ReviewRecord = {
  id: string; status: string; identityIssues?: string[]; resolutionAction?: string;
  fieldEvidence: { field: string; verdict: string; implementationEligible?: boolean; proposed?: { present: boolean; value?: unknown } | null }[];
};
const ledger = JSON.parse(readFileSync('docs/catalog-review/ledger.json', 'utf8')) as { reviewDate: string; records: ReviewRecord[] };
const records = new Map(ledger.records.map((record) => [record.id, record]));
const positive = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value > 0;
const factorKeys: Partial<Record<BearingProduct['schematicType'], (keyof BearingProduct)[]>> = {
  'deep-groove': ['calculationFactorF0'],
  spherical: ['calculationFactorE', 'calculationFactorY1', 'calculationFactorY2', 'calculationFactorY0'],
  tapered: ['calculationFactorE', 'calculationFactorY', 'calculationFactorY0'],
  'spherical-thrust': ['calculationFactorY', 'calculationFactorY0'],
};
const rows = products.map((product) => {
  const record = records.get(product.id);
  const nonBearing = ['housing', 'seal', 'lubricant'].includes(product.category);
  const required = factorKeys[product.schematicType] ?? [];
  const missingFactors = required.filter((field) => !positive(product[field]));
  const reviewedFieldsMatchingSnapshot = (record?.fieldEvidence ?? [])
    .filter((entry) => entry.verdict === 'source_supported' && entry.implementationEligible && entry.proposed?.present &&
      JSON.stringify(product[entry.field as keyof BearingProduct]) === JSON.stringify(entry.proposed.value))
    .map((entry) => entry.field);
  const evidenceGaps = ['crKn', 'corKn', ...required].filter((field) => !reviewedFieldsMatchingSnapshot.includes(field));
  const reasons = nonBearing ? ['Component is outside the bearing-life method.'] : [
    'No engineer-approved method/product eligibility record; technical review is not final acceptance.',
    ...(!record ? ['No matching technical review record.'] : []),
    ...(record?.status === 'ambiguous_identity' ? ['Resolve manufacturer, suffix and supplied arrangement.'] : []),
    ...(record?.status === 'blocked_evidence' ? ['Manufacturer evidence blocked in technical review.'] : []),
    ...(familyFlags[product.id] ? [familyFlags[product.id]] : []),
    ...(!positive(product.crKn) || !positive(product.corKn) ? ['Positive finite load ratings missing.'] : []),
    ...(missingFactors.length ? [`Combined-load factors missing/invalid: ${missingFactors.join(', ')}.`] : []),
    ...(evidenceGaps.length ? [`Current required values not matched to accepted field evidence: ${evidenceGaps.join(', ')}.`] : []),
  ];
  return {
    id: product.id, code: product.code, schematicFamily: product.schematicType,
    technicalReviewStatus: record?.status ?? 'not_reviewed',
    productLifeReleaseStatus: nonBearing ? 'not_applicable' : 'awaiting_engineering_review',
    familyAuditFlag: familyFlags[product.id] ?? null,
    ratingsPresent: positive(product.crKn) && positive(product.corKn),
    missingCombinedLoadFactors: missingFactors,
    reviewedFieldsMatchingSnapshot: [...new Set(reviewedFieldsMatchingSnapshot)],
    methodEvidenceGaps: evidenceGaps, reasons,
    ownerResolution: record?.status === 'ambiguous_identity'
      ? record.resolutionAction || record.identityIssues?.join(' ') || 'Confirm exact manufacturer, complete designation/variant and supplied arrangement from inventory or package evidence; preserve the stable ID.'
      : null,
  };
});
const tally = (key: 'technicalReviewStatus' | 'productLifeReleaseStatus') => rows.reduce<Record<string, number>>((counts, row) => {
  counts[row[key]] = (counts[row[key]] ?? 0) + 1;
  return counts;
}, {});
const report = {
  schemaVersion: 1,
  snapshotSha256: createHash('sha256').update(raw).digest('hex'),
  technicalLedgerDate: ledger.reviewDate,
  scope: 'Offline readiness audit of saved public products. Not product verification, a runtime gate or approval. Field matches do not verify family, operating conditions or method applicability.',
  counts: { total: rows.length, technicalReview: tally('technicalReviewStatus'), productLifeRelease: tally('productLifeReleaseStatus'), familyAuditFlags: rows.filter((r) => r.familyAuditFlag).length },
  records: rows,
};
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(path.join(outputDirectory, 'CATALOG_ELIGIBILITY.json'), JSON.stringify(report, null, 2) + '\n');
const cell = (value: string) => value.replaceAll('|', '\\|').replaceAll('\n', ' ');
writeFileSync(path.join(outputDirectory, 'CATALOG_ELIGIBILITY.md'), [
  '# Catalog calculation eligibility — foundation audit', '',
  report.scope, '', `Public snapshot SHA-256: \`${report.snapshotSha256}\`. Technical ledger date: ${ledger.reviewDate}.`, '',
  `Coverage: ${rows.length} products; ${report.counts.familyAuditFlags} family/arrangement flags. Engineer-approved product calculations: **0**. This does not mean every numerical catalog value is wrong.`, '',
  'Missing factors below concern the current combined-load branch; pure radial arithmetic can still run today. That behavior is not evidence of release eligibility.', '',
  '| ID / designation | Technical review | Current family | Combined factors missing | Family/arrangement flag |',
  '| --- | --- | --- | --- | --- |',
  ...rows.map((r) => `| ${cell(r.id)} / ${cell(r.code)} | ${r.technicalReviewStatus} | ${r.schematicFamily} | ${r.productLifeReleaseStatus === 'not_applicable' ? 'Not applicable' : r.missingCombinedLoadFactors.join(', ') || 'None by presence check'} | ${cell(r.familyAuditFlag ?? 'No specific flag; applicability still unapproved')} |`), '',
  '## Owner identity-resolution queue', '',
  'Confirm the manufacturer, complete designation/clearance, supplied arrangement and package/stock evidence. Keep stable IDs. No alternative brand has been selected by this audit.', '',
  '| ID | Designation | Required decision |', '| --- | --- | --- |',
  ...rows.filter((r) => r.ownerResolution).map((r) => `| ${r.id} | ${cell(r.code)} | ${cell(r.ownerResolution!)} |`), '',
].join('\n'));
console.log(JSON.stringify(report.counts, null, 2));
