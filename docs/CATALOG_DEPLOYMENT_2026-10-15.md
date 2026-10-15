# Catalog deployment — 2026-10-15

The owner explicitly requested publication of the completed catalog changes. Both [English](https://poladcharkhesh.com/catalog) and [Persian](https://poladcharkhesh.ir/catalog) sites now serve application release `ef783bc4d4583e3bfbe61e57bcfba18986c81f3e` and the reviewed catalog patches. Later documentation commits do not change that runtime release.

## Published changes

- Applied `catalog-review/review.patch.json`: 61 technical-record updates.
- Applied `catalog-review/media.patch.json`: 100 image replacements, comprising 57 matching supplier listings and 43 owner-approved, clearly labeled examples from listed brands.
- Together the patches changed 573 field values on 106 distinct products. All 110 product identities remain present.
- Ten unresolved image references remain unchanged. The [media ledger](catalog-review/media/ledger.json) records provenance and limitations; listing matches do not establish independent verification of the exact photographed unit.
- Source attribution and bilingual example labels are visible in product Quick View and image credits.

Preparation reports describe the earlier review-only phase. This record supersedes their deployment status, without changing their evidence limitations. Remaining manufacturer-data gaps and engineering acceptance still require resolution before company datasheet PDFs.

## Data preservation and activation

The guarded patch planner previewed both patches against the live catalog without conflicts. The same update was rehearsed against a private backup before activation. During activation, the service was stopped, a fresh verified backup was made, and both patches were applied in one SQLite transaction with a catalog-revision check. Integrity verification passed. Owner accounts, settings, uploaded-media records, inquiries and sessions were checked for unchanged contents; uploads were preserved.

The previous application release was `640b590a37aab56f4241d73565895f5ff6c9d74a`. A release-symlink switch activated the new build, retaining previous hashed client assets for open browser sessions. The service restarted successfully and `/api/health` returned `{"status":"ok"}`. No rollback was required.

The verified pre-update backup remains on the VPS only, as explicitly requested by the owner. No database, credentials, sessions or private uploads are included in GitHub or the public deliverables. The existing server-side backup process and previous release remain available for recovery.

## Verification

- Type checking, all 71 tests, production builds, bundle checks and production smoke tests passed locally and on the VPS.
- The external live-site checker passed 226 page/language checks per domain, 452 in total, including HTTPS, canonical/hreflang links, SEO routes, security headers and private API access denial.
- Both public catalog APIs returned all 110 products. Every one of the 573 patched field values matched the reviewed patch output.
- All 100 deployed image files matched the media-ledger SHA-256 hashes on each domain. The ten unresolved image references remained unchanged.
- `.com` defaults to English; `.ir` defaults to Persian. Browser inspection confirmed both language views, the replacement product photo, example label and source link.
- [Machine-readable public catalog verification](audit-evidence/catalog-deployment-2026-10-15.json) completed at 2026-10-15T13:26:09.204Z.

The deployed source was fast-forwarded to GitHub `main`; pull request #1 is merged. These checks establish successful publication of the reviewed changes, not complete manufacturer certification or a new exhaustive live-admin workflow audit.
