import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import type { BearingProduct } from '../domain/product';
import { fieldValue, planCatalogReviewPatch, type CatalogReviewPatch } from '../api/catalog-review-patch';

interface MediaRecord {
  productId: string; status: string; example: boolean; brand: string; target: string;
  supplier: string; sourceUrl?: string; assetUrl?: string; localUrl?: string;
  sha256?: string; width?: number; height?: number; listingAssociationVerified?: boolean;
  exactPhotographedUnitVerified: boolean; altEn?: string; altFa?: string; blockers: string[];
  mediaType?: string; imageKind?: string;
}
const root = 'docs/catalog-review';
const baseline: BearingProduct[] = JSON.parse(fs.readFileSync(`${root}/baseline.json`, 'utf8')).products;
const batch: MediaRecord[] = JSON.parse(fs.readFileSync(`${root}/media-batches/all-products.json`, 'utf8')).records;
const overrides: MediaRecord[] = fs.existsSync(`${root}/media-batches/additional.json`)
  ? JSON.parse(fs.readFileSync(`${root}/media-batches/additional.json`, 'utf8')).records : [];
const byId = new Map(batch.map(r => [r.productId, r]));
assert.equal(byId.size, baseline.length, 'Media inventory must cover every public product');
for (const r of overrides) { assert.ok(byId.has(r.productId)); byId.set(r.productId, r); }
const original = JSON.parse(fs.readFileSync(`${root}/media/skf-6305-2rz.json`, 'utf8'));
byId.set('skf-6305-2rz', { ...original, status: 'downloaded', example: false, brand: 'SKF', target: '6305-2RZ', blockers: [] });
const rows: CatalogReviewPatch['rows'] = [];
const metadata: Record<string, { name: string; sourceUrl: string; altEn: string; altFa: string; example: boolean; pictured: string; illustration: boolean; mediaKind: string }> = {};
for (const p of baseline) {
  const r = byId.get(p.id)!;
  if (r.status !== 'downloaded') continue;
  assert.ok(r.listingAssociationVerified && r.sourceUrl && r.assetUrl && r.localUrl && r.altEn && r.altFa, p.id);
  assert.match(r.localUrl, /^\/product-images\/[a-z0-9-]+\.(jpg|png|webp)$/);
  const data = fs.readFileSync(`public-site${r.localUrl}`);
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'), r.sha256, p.id);
  assert.ok((r.width || 0) >= 150 && (r.height || 0) >= 150, p.id);
  metadata[r.localUrl] = { name: r.supplier, sourceUrl: r.sourceUrl, altEn: r.altEn, altFa: r.altFa, example: r.example, pictured: `${r.brand} ${r.target}`, illustration: /illustration|render|cutaway/.test(`${r.mediaType || ''} ${r.imageKind || ''}`), mediaKind: r.imageKind || r.mediaType || 'supplier_listing_image' };
  rows.push({ id: p.id, identity: { code: p.code, slug: p.slug, brands: p.brands, category: p.category, schematicType: p.schematicType },
    guards: { images: fieldValue(p, 'images'), isArchived: fieldValue(p, 'isArchived') },
    changes: [{ field: 'imageUrl', before: fieldValue(p, 'imageUrl'), after: { present: true, value: r.localUrl }, evidence: [r.sourceUrl, `media/ledger.json#${p.id}`] }] });
}
const patch: CatalogReviewPatch = { schemaVersion: 1, baselineSha256: original.baselineSha256 || JSON.parse(fs.readFileSync(`${root}/review.patch.json`, 'utf8')).baselineSha256, rows };
const plan = planCatalogReviewPatch(patch, baseline);
assert.deepEqual(plan.errors, []);
for (const next of plan.products) {
  const old = baseline.find(p => p.id === next.id)!;
  assert.deepEqual({ ...next, imageUrl: old.imageUrl }, { ...old, imageUrl: old.imageUrl }, `Only imageUrl may change: ${next.id}`);
}
const records = baseline.map(p => ({ ...byId.get(p.id)!, originalImage: fieldValue(p, 'imageUrl') }));
const counts = { total: baseline.length, replacements: rows.length, supplierListingMatches: records.filter(r => r.status === 'downloaded' && !r.example).length,
  labeledExamples: records.filter(r => r.status === 'downloaded' && r.example).length, unresolved: records.filter(r => r.status !== 'downloaded').length,
  independentlyVerifiedPhotographedUnits: records.filter(r => r.exactPhotographedUnitVerified).length };
const write = (path: string, value: unknown) => fs.writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
write(`${root}/media.patch.json`, patch);
write(`${root}/media-additions.patch.json`, { ...patch, rows: rows.filter(r => r.id !== 'skf-6305-2rz') });
write(`${root}/media/ledger.json`, { date: '2026-10-15', scope: 'Supplier listing images and owner-authorized examples from listed brands; no technical verification implied.', counts, records });
write('lib/supplier-media-data.json', metadata);
const htmlEscape = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const creditsPath = 'public-site/asset-credits.html';
const credits = fs.readFileSync(creditsPath, 'utf8');
const mediaCredits = '<!-- catalog-media:start --><h2>Product listing images</h2><p>Supplier and manufacturer listing images are attributed below. Examples identify one listed brand or variant. Listing association does not independently verify the pictured unit. No Creative Commons license is claimed for these assets. Downloaded files are retained without visual editing; supplier-served display sizes may be used.</p><ul>' + Object.values(metadata).map(m => `<li><a href="${htmlEscape(m.sourceUrl)}">${htmlEscape(m.pictured)}</a> — ${htmlEscape(m.name)}; ${m.example ? 'labeled example; ' : ''}${m.illustration ? 'illustration' : 'listing image'}.</li>`).join('') + '</ul><!-- catalog-media:end -->';
const updatedCredits = credits.includes('<!-- catalog-media:start -->')
  ? credits.replace(/<!-- catalog-media:start -->[\s\S]*?<!-- catalog-media:end -->/, mediaCredits)
  : credits.replace(/<h2>Supplier product photograph<\/h2>[\s\S]*?(?=<p>Dimensional diagrams)/, mediaCredits);
assert.ok(updatedCredits.includes('<!-- catalog-media:end -->'));
fs.writeFileSync(creditsPath, updatedCredits);
const reviewed: BearingProduct[] = JSON.parse(fs.readFileSync('work/catalog-review/reviewed-products.json', 'utf8')).products;
const merged = planCatalogReviewPatch(patch, reviewed);
assert.deepEqual(merged.errors, []);
const updates = new Map(merged.products.map(p => [p.id, p]));
fs.mkdirSync('work/image-review', { recursive: true });
write('work/image-review/preview-products.json', { products: reviewed.map(p => updates.get(p.id) || p), count: reviewed.length });
const escape = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
fs.writeFileSync(`${root}/media/README.md`, [
  '# Catalog product image replacement — 2026-10-15', '',
  `${counts.total} products assessed; **${counts.replacements} replacement images prepared and applied in the isolated preview**: ${counts.supplierListingMatches} matching supplier listings and ${counts.labeledExamples} clearly labeled brand/variant examples. ${counts.unresolved} remain unresolved.`, '',
  'The owner approved example photographs from listed brands for the 43 multi-brand/alternative-variant records. These examples name the pictured brand and designation and do not establish owner stock, technical equivalence or the appearance of every variant. Supplier listing association does not independently verify the photographed unit. Reused/generic supplier images remain labeled supplier images, never certified exact photographs.', '',
  'Use `media.patch.json` for the original catalog baseline, or `media-additions.patch.json` if the earlier SKF 6305-2RZ image-only patch is already applied. Both use the existing guarded Admin importer and may be applied before or after the technical review patch. They change imageUrl only and reject changed owner media/identity. Do not replace the owner database with the scratch preview.', '',
  'Original downloaded files are stored locally without visual edits. Evidence includes the source page, linked asset, identity observations, dimensions and SHA-256. Source attribution is shown in Quick View and Image credits. Reuse terms remain as recorded in the evidence. The older technical review ledger/report predate this media follow-up; engineering and identity blockers remain unchanged. No live import or deployment was performed.', '',
  'Rebuild with `pnpm exec tsx scripts/build-catalog-review.ts` then `pnpm exec tsx scripts/build-catalog-media.ts`. The latter reads committed media evidence and existing binaries; it does not access the network or live database.', '',
  '| Product | Result | Pictured item / reason | Source |', '|---|---|---|---|',
  ...records.map(r => `| ${r.productId} | ${r.status === 'downloaded' ? r.example ? 'Labeled example' : 'Supplier listing image' : 'Unresolved'} | ${escape(r.status === 'downloaded' ? `${r.brand} ${r.target}` : r.blockers.join('; '))} | ${r.sourceUrl ? `[Source](${r.sourceUrl})` : 'See ledger search evidence'} |`), '',
].join('\n'));
console.log(JSON.stringify(counts, null, 2));
