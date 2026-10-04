/// <reference types="node" />
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { bearingProducts } from '../domain/catalog';
import type { BearingProduct } from '../domain/product';
import { catalogReview } from '../lib/catalog-quality';
import { mediaFor } from '../lib/media';
const args = process.argv.slice(2),
  option = (name: string, fallback: string) => {
    const index = args.indexOf(name);
    return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
  };
const date = option(
  '--date',
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()),
);
const base = option('--base', 'http://127.0.0.1:5173'),
  out = resolve(option('--out', 'docs/audit-evidence'));
const response = await fetch(base + '/api/products');
if (!response.ok) throw new Error(`Catalog read failed: ${response.status}`);
const payload = (await response.json()) as { products: BearingProduct[] };
const contentResponse = await fetch(base + '/api/content');
if (!contentResponse.ok) throw new Error('Content read failed');
const content = (await contentResponse.json()).data;
const mediaFile = args.includes('--media-results')
  ? option('--media-results', '')
  : '';
const mediaChecks = mediaFile
  ? JSON.parse(readFileSync(mediaFile, 'utf8'))
  : [];
const engineeringFields = [
  'code',
  'category',
  'schematicType',
  'd',
  'D',
  'B',
  'weightKg',
  'crKn',
  'corKn',
  'speedGreaseRpm',
  'speedOilRpm',
  'speedReferenceRpm',
  'speedLimitingRpm',
  'thermalSpeedRatingRpm',
  'rMin',
  'contactAngle',
  'calculationFactorE',
  'calculationFactorX',
  'calculationFactorY',
  'calculationFactorY0',
  'calculationFactorY1',
  'calculationFactorY2',
  'calculationFactorF0',
  'cageMaterialEn',
  'cageMaterialFa',
  'sealingEn',
  'sealingFa',
  'clearanceOptions',
] as const;
const records = payload.products.map((p) => {
  const seed = bearingProducts.find((seed) => seed.id === p.id),
    shown = mediaFor(p, content);
  const differences = seed
    ? engineeringFields
        .filter(
          (field) => JSON.stringify(p[field]) !== JSON.stringify(seed[field]),
        )
        .map((field) => ({
          field,
          current: p[field] ?? null,
          seed: seed[field] ?? null,
        }))
    : [];
  return {
    ...catalogReview(p),
    displayedImage: shown.url || null,
    displayedImageIsReference: shown.reference,
    differencesFromSeed: differences,
    notInSeed: !seed,
  };
});
const active = records.filter((p) => !p.archived);
const summary = {
  active: active.length,
  archived: records.length - active.length,
  photoMissingOrReferenceOnly: active.filter(
    (p) => !p.exactPhotoCandidates.length,
  ).length,
  attachedPdfMissing: active.filter((p) => !p.pdfUrl).length,
  sourceLinkMissing: active.filter((p) => p.gaps.includes('sources')).length,
  recordsWithMissingFields: active.filter((p) => p.missingFields.length).length,
  multiManufacturerOrSuffixReview: active.filter((p) => p.reviewReasons.length)
    .length,
  recordsDifferentFromSeed: active.filter((p) => p.differencesFromSeed.length)
    .length,
  fieldDifferences: active.reduce(
    (n, p) => n + p.differencesFromSeed.length,
    0,
  ),
  linkedSourcePdfReferences: active.filter((p) =>
    p.sources.some(
      (source) => source.url && /\.pdf(?:[?#]|$)/i.test(source.url),
    ),
  ).length,
  displayedImageFailures: mediaChecks.filter(
    (x: { displayed: boolean; decoded: boolean }) => x.displayed && !x.decoded,
  ).length,
  legacyImageFailures: mediaChecks.filter(
    (x: { displayed: boolean; decoded: boolean }) => !x.displayed && !x.decoded,
  ).length,
  imagesProbed: mediaChecks.length,
  failedImageProbes: mediaChecks.filter((x: { decoded: boolean }) => !x.decoded)
    .length,
};
const report = {
  generatedAt: new Date().toISOString(),
  scope: 'Published local catalog snapshot; owner data unchanged',
  limits: [
    'Presence and browser decoding checks do not establish exact manufacturer photo identity or image reuse rights.',
    'Source references and verifiedAt metadata are recorded claims; numeric specifications were not independently reverified against every manufacturer in this audit.',
    'Seed comparisons identify differences, not authority or errors. Archived records may not be included by the public endpoint.',
  ],
  summary,
  mediaChecks,
  products: records,
};
mkdirSync(out, { recursive: true });
writeFileSync(
  join(out, `catalog-content-audit-${date}.json`),
  JSON.stringify(report, null, 2) + '\n',
);
const escape = (value: unknown) =>
  String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const labels: Record<string, string> = {
  active: 'Published products',
  archived: 'Archived records in this published snapshot',
  photoMissingOrReferenceOnly: 'Exact product photo missing or reference only',
  attachedPdfMissing: 'Attached product PDF missing',
  sourceLinkMissing: 'Source link missing',
  recordsWithMissingFields:
    'Records with missing cage/clearance or other checked fields',
  multiManufacturerOrSuffixReview:
    'Manufacturer / suffix identity review needed',
  recordsDifferentFromSeed: 'Records with engineering differences from seed',
  fieldDifferences: 'Engineering field differences from seed',
  linkedSourcePdfReferences: 'Records with linked source-catalog PDFs',
  displayedImageFailures: 'Displayed images failing decode',
  legacyImageFailures: 'Legacy image paths failing decode',
  imagesProbed: 'Unique image URLs probed',
  failedImageProbes: 'Total failed image probes',
};
const lines = [
  '# Catalog content audit — 2026-10-04',
  '',
  `Snapshot: ${report.generatedAt}. Published local records only; no database changes.`,
  '',
  '## Findings',
  '',
  ...Object.entries(summary).map(
    ([key, value]) => `- ${labels[key] || key}: **${value}**`,
  ),
  '',
  '## Important distinctions',
  '',
  ...report.limits.map((limit) => '- ' + limit),
  '- Failed legacy image paths are not the images currently displayed. Reference replacements can render correctly while exact product photos remain missing.',
  '- A manufacturer catalog PDF referenced as a source is separate from an attached product document. Neither is a company-generated datasheet.',
  '',
  '## Completion order',
  '',
  '1. Resolve any broken displayed media and missing technical fields.',
  '2. Reconcile manufacturer/suffix identity and every seed difference against official evidence; preserve owner edits until reviewed.',
  '3. Attach exact, authorized product photos and original manufacturer PDFs. Company-generated datasheets remain separate.',
  '4. Verify ratings, speeds and calculation factors against the exact manufacturer/designation, documenting the table/page and revision.',
  '5. Complete application text and bilingual review before the full release audit.',
  '',
  '## Product checklist',
  '',
  '| Code | Photo | Attached PDF | Missing fields | Source link | Identity review | Seed differences |',
  '| --- | --- | --- | --- | --- | --- | --- |',
  ...active.map(
    (p) =>
      `| ${escape(p.code)} | ${p.exactPhotoCandidates.length ? 'Candidate; verify' : 'Missing / reference only'} | ${p.pdfUrl ? 'Attached; verify' : 'Missing'} | ${escape(p.missingFields.join(', ') || 'None detected')} | ${p.gaps.includes('sources') ? 'Missing' : 'Recorded; verify'} | ${escape(p.reviewReasons.join('; ') || 'None detected')} | ${p.differencesFromSeed.length} |`,
  ),
  '',
  'All products still require independent manufacturer verification. No product is certified launch-ready by this report.',
  '',
];
writeFileSync(resolve(out, '../CATALOG_CONTENT_AUDIT.md'), lines.join('\n'));
console.log(JSON.stringify(summary, null, 2));
