# C1-B — API, database and import contracts

**Date:** 2026-10-18 · **Status:** implementation and local verification complete; not deployed.

This package continues COMPLETE-01 after C0-B/C1-A. It removes the API's explicit `any` types and closes malformed-input gaps exposed by the typed boundaries. The owner will nominate an engineering reviewer later; no method or product approval is implied.

## Result

- API request bodies are unknown until narrowed. Authentication uses explicit session/admin records, and protected handlers require the authenticated session. Existing roles, cookie settings, password hashing, limits and transaction boundaries remain.
- Database product reads/writes use `BearingProduct`; missing product lookups remain nullable. Known published settings and media/inquiry records have explicit types. The JSON decoder checks the stored column type and defaults to `unknown`. Its generic contract describes trusted persisted data; it is not a runtime schema validator or proof of engineering correctness.
- Product creation, edits, ordinary imports, reviewed patches and restore share `readProductRecord`. It checks required text/arrays/booleans, optional metadata, source types and source verification-date strings alongside the existing numeric/URL validation. Incorrect types are rejected; nothing is silently filled with engineering values. Source dates are checked as text, not certified as independently verified dates.
- Import and patch input stays unknown until validation. An invalid batch returns no persistable products. Existing ID preservation, protected identities, before-value guards, stale-preview rejection, optional-field deletion and atomic writes remain covered by the 110-product review integration test.
- Backup validation is a pure planning step before the restore transaction. Null/malformed collection rows, missing timestamps, invalid JSON/media metadata and duplicate collection IDs fail with a client error. Valid version-1 content and SEO upgrades remain supported without mutating the input backup. Only a valid plan reaches snapshot creation and transactional replacement.

This introduces stricter rejection for malformed records that could previously pass a partial validator or fail later in SQL. Older hand-edited backups missing required product fields or source `verifiedAt` strings must be corrected before restore; fields are not invented. All 110 bundled product fixtures and the public catalog-review integration fixtures pass. Private production data was not downloaded, inspected or migrated in this package.

## Verification

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| Regression suite | **89/89 passed**, using disposable databases and local HTTP |
| New contract tests | Product field rejection; invalid import atomicity; nested review shapes; legacy restore purity; malformed/duplicate restore rows; stored JSON decoding |
| Existing API integration | CRUD, authentication/roles, password/session lifecycle, imports, inquiries, media, restore, snapshots and rollback passed; additional invalid-edit and pre-write restore assertions passed |
| Full lint | **176 → 131 errors**; explicit `any` **126 → 81** |
| API directory and new contract tests | Zero lint findings |
| Production build | Passed |
| Bundle budgets | Passed; initial JavaScript 84.2 KB gzip, 23 JavaScript chunks |
| Isolated production smoke | Passed: pages, assets, metadata, setup, product/content edits, inquiry, media, backup and logout |
| Diff/format integrity | `git diff --check` passed |

No browser UI was changed. Existing platform tests still have lint findings, included in the full total; a passing API lint check does not close C1 or full security/application acceptance. Lint rules and advisory CI behavior are unchanged. Local command logs remain in ignored `work/readme-review/c1b-*` files.

## Next work and limits

C1-C addresses admin/client responses, shared-content contracts and form state. React/hooks, accessibility and tooling follow in bounded batches. The remaining 131 errors must reach zero before enforcing lint in CI.

C0 engineering approval, C2 exact identity/media/documents, C3 toolbox expansion, C4 full acceptance, C5 operations/release and C6 indexing remain open under the [completion plan](COMPLETION_PLAN.md). The live site was not deployed, private backups remain on the VPS, and the engineering approval registry remains empty.
