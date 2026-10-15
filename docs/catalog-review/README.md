# Manufacturer review package

Start with [REPORT.md](REPORT.md), then [BLOCKERS.md](BLOCKERS.md). The machine-readable [ledger](ledger.json) covers all 110 public products and includes old values, source observations, unresolved fields, media status and proposed changes. Source research is under `research/`.

**This is a partial engineering review, not verification sign-off. No deployment or live data import was performed.** The 61-row technical patch contains only accepted corrections; 49 records are held. The subsequent [catalog-wide image follow-up](media/README.md) provides 100 local replacement images: 57 matching product listings and all 43 owner-approved, explicitly labeled brand/variant examples. Ten products retain their current imagery because identity or usable-image evidence remains unresolved. Listing association does not independently verify the pictured unit. The [image-only patch](media.patch.json) and [media ledger](media/ledger.json) supersede the historical media counts in the original engineering report.

## Apply only through the reviewed import workflow

1. Integrate the application changes from this review branch in your intended environment. Keep the existing SQLite database and uploads authoritative. Do not replace either with a seed, public export or scratch test database.
2. In Admin → Products → Import JSON, select `review.patch.json`. It requires the new guarded-patch importer; older application versions do not support this format.
3. Review every previewed change and its field evidence. The existing checkbox and save button perform the confirmed import. Identity, original specification values and preview revision must still match. Any conflict rejects the entire batch; re-review instead of removing guards.

The baseline is the public catalog fetched on 2026-10-15, structurally equal to the owner's checkpoint export. It is review evidence, not a database backup. Unrelated current owner fields are preserved. The patch cannot create products, select manufacturers, rename codes or change IDs/slugs/categories/schematic types. Optional field omission is distinct from zero. A successful import does not make unresolved fields or media verified.

## Reproduce in the separate source checkout

Use the committed dependency lockfile and a supported Node runtime, then run:

```text
pnpm install --frozen-lockfile
pnpm exec tsx scripts/build-catalog-review.ts
pnpm exec tsx scripts/build-catalog-media.ts
pnpm typecheck
pnpm test
pnpm build
pnpm check:bundles
```

The compiler uses only `docs/catalog-review/baseline.json` and committed research. It validates 110 unique identities, accepted evidence mappings, identity holds and the patch planner. Its full merged preview is written only to ignored `work/catalog-review/`; do not import that full snapshot into an owner database. Tests create separate temporary databases and local API listeners. `scripts/verify-review-media.py` requires Pillow and decodes the 35 retained reference assets.

The media compiler verifies local asset hashes and builds the 100-row guarded image patch, bilingual display metadata and source credits from `media-batches/all-products.json` plus the accepted overrides in `media-batches/additional.json`. Other batch files preserve intermediate source research; use the compiled media ledger for final decisions. `media-additions.patch.json` excludes the earlier SKF 6305-2RZ change for catalogs where that single-image patch is already applied. Media and technical patches can be applied in either order. Concurrent owner image or gallery changes reject the whole media batch.

See [validation.json](validation.json) for executed checks and [lint-validation.json](lint-validation.json) for the unchanged 197 baseline lint errors. Source PDFs/HTML, credentials, databases, uploads, dependencies and generated builds are excluded from this review package. No company datasheets were produced.
