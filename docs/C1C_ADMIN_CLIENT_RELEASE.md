# C1-C — Admin/client contracts and release

**Date:** 2026-10-18. The owner authorized completing this phase, GitHub synchronization and deployment. Deployment verification is recorded below after activation.

## Implementation

Admin loads now return a discriminated payload for the requested workspace. Editors use explicit product drafts, site-content models, company/SEO settings and typed confirmation actions. JSON backups remain unknown until server validation. The API client defaults to unknown for untyped calls and has endpoint contracts for known reads. Error handling accepts unknown exceptions.

Nested editor updates clone the draft, preserve sibling fields/array entries and reject missing or prototype-related paths. Shared content upgrades retain owner overrides and leave malformed copy containers visible to validation. Public context explicitly represents data that has not loaded; contact sections handle missing company data. Existing industrial visuals, bilingual copy, product IDs, catalog fields and media presentation are retained.

These are software contracts, not manufacturer verification. API response types describe the trusted application contract; they do not claim complete runtime decoding of every server field. The C0 approval registry remains empty: catalog calculations require an approved current profile, while manual calculations remain independent.

## Checks before publication

- TypeScript passed; **93/93 tests** passed using disposable databases and local HTTP.
- Production build, bundle budgets (initial JavaScript 84.3 KB gzip) and isolated production smoke passed.
- Full lint **131 → 63**; explicit `any` **81 → 14**. No rule weakening; CI remains advisory. The remaining React/hooks, accessibility, deprecated unload handling and tooling findings are tracked under C1-D.
- New regression coverage: nested bilingual edit preservation, unsafe/missing paths, workspace response identity and error recovery, owner content upgrades and malformed copy rejection.
- Local browser: admin login/overview; website English copy save with Persian text retained; product description save; Persian company settings save. Only disposable local fixtures were edited.
- Pre-deployment check: all **110 live public products** passed the stricter product persistence contract with zero invalid records.

## Deployment

Pending pinned-source staging, server-only backup, activation and live verification. No production data is included in GitHub. This page will be updated with the actual result; passing local checks alone does not establish a live release.

## Remaining gates

C1 still has 63 errors. Engineering acceptance, exact inventory identities, unresolved media/documents, expanded toolbox modules, complete application acceptance, host hardening/reboot and indexing remain open in [COMPLETE-01](COMPLETION_PLAN.md). This owner-authorized incremental deployment does not close those gates or authorize Search Console/indexing changes.
