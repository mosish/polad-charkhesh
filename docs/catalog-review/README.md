# Manufacturer review package

Start with [REPORT.md](REPORT.md), then [BLOCKERS.md](BLOCKERS.md). The machine-readable [ledger](ledger.json) covers all 110 public products and includes old values, source observations, unresolved fields, media status and proposed changes. Source research is under `research/`.

**This is a partial review, not verification sign-off. No deployment or live data import was performed.** The 61-row patch contains only accepted corrections; 49 records are held. Independent exact product media verification remains unresolved for all 110 records. A subsequent user-selected supplier image replaces the SKF 6305-2RZ family illustration in the isolated preview; see the [image follow-up](media/README.md) and separate [image-only patch](media.patch.json). Other family-reference imagery remains unchanged.

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
pnpm typecheck
pnpm test
pnpm build
pnpm check:bundles
```

The compiler uses only `docs/catalog-review/baseline.json` and committed research. It validates 110 unique identities, accepted evidence mappings, identity holds and the patch planner. Its full merged preview is written only to ignored `work/catalog-review/`; do not import that full snapshot into an owner database. Tests create separate temporary databases and local API listeners. `scripts/verify-review-media.py` requires Pillow and decodes the 35 retained reference assets.

See [validation.json](validation.json) for executed checks and [lint-validation.json](lint-validation.json) for the unchanged 197 baseline lint errors. Source PDFs/HTML, credentials, databases, uploads, dependencies and generated builds are excluded from this review package. No company datasheets were produced.
