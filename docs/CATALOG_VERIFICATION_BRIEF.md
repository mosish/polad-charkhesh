# Manufacturer catalog review and company datasheet preparation

Requested by the owner on 2026-10-15 as a separate project phase.

## Starting checkpoint

Website source checkpoint: `c0840d4da5a0d232b828cedc6a7f289613158058`, verified equal to GitHub `origin/main` before this handoff. A source ZIP, complete local Git history bundle and verified local SQLite/uploads backup were saved privately under the ignored `work/checkpoints/2026-10-15-catalog-review/` directory. These archives and runtime data are not GitHub content. The published catalog endpoint currently contains 110 products; its public JSON snapshot is also retained in that checkpoint.

The installed VPS application revision remains `640b590a37aab56f4241d73565895f5ff6c9d74a`. Later commits documented domain activation. This phase must start from the latest saved source and current public records rather than treating the seed as the owner database.

## Owner's requested outcome

Review **every product**, find its primary image on the original manufacturer's website, replace current reference imagery where an exact match is supported, and verify technical information before preparing company technical specification PDFs. Keep the company showroom and engineering purpose; no commerce features.

## Product-by-product evidence

Maintain an inventory covering every current ID and slug, including records that cannot yet be resolved. For each record capture:

- Exact manufacturer, full designation, suffixes, bearing arrangement and included accessories. Distinguish valid matched cone/cup pairs from alternative suffixes. Do not silently choose one brand for a multi-brand generic record.
- Official product-page or manufacturer-catalog URL, document revision/table/page, access date and field-level evidence. Recorded `verifiedAt` values and search snippets are not independent proof.
- Dimensions and chamfers, mass, dynamic/static ratings, correctly named speed ratings, cage, seals, clearance, contact angle and applicable calculation factors. Preserve units and distinguish blanks, unavailable values and actual zero. Different manufacturers' equivalent codes do not establish identical ratings.
- Existing and proposed values, reason for each correction, unresolved conflicts and a machine-readable patch keyed by stable ID. Preserve owner text and existing URLs unless evidence supports a correction.
- Primary image URL and local asset, corresponding product page/designation, media type (photo, manufacturer rendering or family reference), attribution and published reuse terms. An image appearing on an official page does not itself prove an exact-SKU photograph or unrestricted reuse.
- Image decoding, identity/variant match, supported format, dimensions, alt text in both languages and optimized display derivatives. Do not substitute unrelated stock/generated images or treat family-reference assets as exact photos.

Use official SKF, Timken, Schaeffler/FAG/INA, NSK, NTN, JTEKT/KOYO, NACHI, Corteco and lubricant-brand sources as applicable. Verify the manufacturer's official domain. If a source blocks access, record the specific blocker, retain the current labeled reference and continue other records. Never bypass access restrictions or infer missing ratings.

## Implementation and delivery

Use a separate local catalog-review workspace and source branch while keeping the existing live website and private data intact. Prepare reviewed replacement assets and catalog corrections in the actual application/import format, alongside the evidence ledger and before/after report. Synchronize completed review work to GitHub, preserving remote changes and excluding credentials, databases, uploads, dependencies, builds and private backups.

Validate product coverage, stable identities, data types/units and field mappings, media integrity and reference labels. Run appropriate application checks for code/data changes and review product panels in Persian and English. Test imports against an isolated copy; avoid overwriting concurrent admin edits. Do not publish bulk catalog edits merely to demonstrate progress.

Report exact counts: verified and implemented, partially verified, ambiguous identity, unavailable evidence and unresolved media. Completion is not the presence of nonempty fields. Do not declare the catalog or company datasheet phase ready while exact product identity or critical engineering values remain unverified.

The next deliverable is a **Polad Charkhesh Arian Tech company datasheet**, clearly distinct from an original manufacturer publication. Preserve manufacturer source references and illustrative-model limitations. Complete the catalog evidence and corrections first; PDF design/generation follows that verified content.
