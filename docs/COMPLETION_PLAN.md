# Pending-work completion plan

**Project:** COMPLETE-01 · **Started:** 2026-10-18 · **Status:** C0-A/B and C1-A/B/C are deployed; C1-D quality, C0-C method evidence and C3-A input/unit packages are deployed. Engineering sign-off and remaining phases are open.

The owner requested a plan covering every pending area and authorized starting work step by step. The owner will nominate an engineering reviewer later. Developer work, tests and source synchronization can proceed; engineer acceptance remains unassigned. Do not mistake a prepared evidence packet for that acceptance.

**Security workstream, October 20:** The supplied audit now has a tested application
remediation package (134 tests) and operational rollout in progress. Track exact
activation and remaining owner actions in the [security record](SECURITY_REMEDIATION_2026-10-20.md).
This does not close engineering acceptance or the complete C4/C5 journey matrix.

## Sequence and completion gates

| Phase | Work | Required evidence to close | Current state |
| --- | --- | --- | --- |
| C0 — Establish engineering foundation | Inventory current tools; review method sources; map all 110 products; record identity/family gaps; establish numerical benchmarks; fix demonstrated input-validation defects. Maps to ENG-01–ENG-03. | Reviewed method register and per-method product eligibility, independently derived tests, engineering reviewer sign-off. | **In progress.** C0-C developer evidence and arithmetic benchmarks complete; reviewer acceptance, interpolation policy and enforceable operating envelopes remain open. |
| C1 — Restore code-quality gate | Resolve the original 197 lint findings in reviewable batches: API validation/types; admin/client types; hooks/React behavior; semantics/accessibility; remaining tooling. Keep rule strength. | Zero lint errors, typecheck/tests/build/bundle checks passing; then remove advisory CI behavior. Record any justified exception with rationale. | **Complete and deployed.** C1-A/B/C/D resolve all 197 original findings: zero diagnostics, no rule weakening, 95 passing tests and required CI lint. C1-D is deployed with C3-A; the expanded suite has 120 passing tests. |
| C2 — Resolve catalog and asset evidence | Work through 47 ambiguous identities and two blocked records; finish 61 partial records. Resolve nine exact-image gaps; review 43 examples without treating them as exact identity evidence. Source documents and prepare company PDFs only for technically accepted products. | Every product has an explicit disposition, exact evidence for changed fields and owner decisions where required; guarded patch preview; stable IDs preserved. Every published PDF has exact identity, provenance and version. | Queued. Evidence unavailable is a recorded blocker, not “verified.” Requires owner stock/package evidence for ambiguous identities. |
| C3 — Implement balanced toolbox | Follow ENG-04–ENG-11: shared bilingual workspace/input contracts; unit converter; life/target-life/static checks; selection/comparison; fit explorer; lubrication/maintenance guidance; local case notebook. | Each module's benchmarks and valid/invalid/unsupported journeys pass; reviewed bilingual guidance; local cases validate imports and stale data; no unsupported method silently runs. | In progress. C3-A shared localized inputs and bidirectional unit conversion are deployed (120 tests). Product numerical eligibility still requires C0 evidence. |
| C4 — Full application acceptance | Review admin roles, media, inquiries, restore and audit flows; public catalog/dialog navigation; security; Persian/English content; desktop/tablet/mobile; keyboard and reduced motion. | Dated journey matrix with results, screenshots where useful, resolved blockers, typecheck/tests/lint/build/bundles/production smoke passing. Repeat affected checks after fixes. | Queued. Earlier targeted checks remain evidence, not full sign-off. |
| C5 — Operations and release | Inspect current Cloudflare DNS/proxy/TLS settings; review VPS networking, SSH hardening, backup retention and recovery; prepare host reboot only with recovery access; stage a pinned release and rollback. | Current configuration evidence; verified server-only backup; recovery/reboot result or explicitly unresolved blocker; approved release with both domains' post-release checks and authoritative catalog comparison. | Partial. Owner-authorized C1-C and C1-D/C0-C/C3-A releases passed pinned staging, server-only backup, unchanged owner-data hashes and both-domain checks. Cloudflare dashboard, hardening and host reboot remain open. |
| C6 — Indexing and closeout | After content and release acceptance, record the indexing decision, verify Search Console ownership and sitemap submission, change noindex when approved, recheck crawled metadata/routes. | Explicit indexing approval; verified robots/header/canonical/hreflang and sitemap behavior on both domains; Search Console evidence; final open-item register. | Queued. Search indexing itself cannot be guaranteed or treated as immediate. |

C1 and evidence research for C2 can proceed while reviewer assignment is pending. C3's independent tools do not need every product verified. Product calculations must remain restricted to an approved subset; catalog-wide completion still requires resolving or explicitly accepting every outstanding disposition. C4 follows implemented work. C5 and C6 are separate release decisions, not consequences of a Git push.

## Work-package protocol

1. Refresh GitHub and inspect the current source/data baseline. Use an isolated implementation branch. Keep public audit snapshots separate from private data.
2. Choose a bounded task with an ID, trigger/defect, deliverable and exit check. Reproduce defects before changing behavior where practical.
3. Implement and run the checks relevant to the change. Preserve catalog IDs, SQLite authority, owner content, image presentation and both languages.
4. Review the diff and publish completed source work to GitHub as authorized. Record test evidence and what is not yet deployed.
5. Update this tracker and the README from actual evidence. Prepare live changes and rollback before any required final approval.

Do not download private server backups: retain them on the VPS per the owner's instruction. Do not guess manufacturers/suffixes, substitute nearby image variants, restore removed image captions, weaken lint rules to hide errors, or call blocked evidence complete. Do not commit private databases, credentials or uploads.

## First package: C0-A — audit and numeric validation

| Item | State | Deliverable |
| --- | --- | --- |
| ENG-01 current behavior inventory | Complete as developer audit | [Foundation audit](engineering-tools/foundation/AUDIT.md) |
| ENG-02 catalog eligibility draft | Prepared; review open | [110-product matrix and owner queue](engineering-tools/foundation/CATALOG_ELIGIBILITY.md), [machine-readable evidence](engineering-tools/foundation/CATALOG_ELIGIBILITY.json) |
| ENG-03 method register | C0-C developer packet complete; engineering acceptance open | [Method register](engineering-tools/methods/REGISTER.md), [source evidence and family benchmarks](engineering-tools/methods/C0C_EVIDENCE.md) |
| C0-NUM finite inputs/results | Implemented and regression tested in source | `lib/engineering.ts`, `lib/showroom.ts`, `tests/engineering-foundation.test.ts` |
| Release of this package | Deployed with C1-C | Included in the October 18 pinned release; see the release record below. |

Validation: 75 tests passed with loopback-enabled execution, typecheck passed, production build and bundle budgets passed, isolated production smoke passed, and targeted lint on changed TypeScript files passed. Three new test groups failed before the numeric fixes and passed afterward. Full lint remains 197 errors; it is not cleared by targeted lint. There are no visual changes in this package.

## Completed continuation packages

**C0-B:** calculation family/arrangement/evidence contracts now govern catalog calculations independently of illustrations. Changed technical data invalidates reviews; absent approvals cannot produce results. Manual mode works independently and preserves inputs. All eleven flagged mappings are tested.

**C1-A:** product and website-content validators use checked unknown inputs; malformed SEO containers fail explicitly. Lint reduced from 197 to 176 without rule changes.

C0-B/C1-A validation: **83 tests**, typecheck, build, bundle budgets and isolated production smoke pass. Targeted English/Persian browser checks include missing products, blank/reset behavior, input preservation and an empty catalog. [Delivery evidence and remaining limits](engineering-tools/foundation/C0B_C1A_DELIVERY.md). Subsequently deployed with C1-C.

**C1-B:** explicit request/session/database record types, shared product persistence validation and pure backup planning are complete. Invalid import batches expose no persistable products; malformed restore collections are rejected before snapshots/writes. Full lint **176 → 131**, with no rule changes and zero API findings. Package validation: **89/89 tests**, TypeScript, build, bundle budgets and isolated production smoke passed. [Delivery evidence](C1B_API_CONTRACTS.md). Subsequently deployed with C1-C.

**C1-C:** shared API/site-content types, discriminated admin responses, explicit editor drafts and safe nested form updates are complete. Lint **131 → 63**, explicit `any` **81 → 14**; all 93 tests and release checks pass. Targeted local browser saves pass in English/Persian. [Delivery and deployment record](C1C_ADMIN_CLIENT_RELEASE.md).

**C1-D:** remaining React/hooks, semantics/accessibility and type/tooling findings are resolved. Full lint has zero diagnostics; 95 tests and release checks pass. Required CI lint replaces the advisory step. [Evidence and verification limits](C1D_QUALITY_GATE.md). Deployed with C3-A; engineering approval remains pending.

**C0-C:** manufacturer publications retrieved with exact pages/editions and hashes; independent equivalent/static-load, interpolation and reliability benchmarks added. Unsupported deep-groove lower clamping is removed. Spherical-thrust calculations now require reviewed SKF series/run-out choices, and old method-version profiles fail eligibility. **107 tests pass**, including all unapproved-product guards. The production registry remains empty. [Evidence, method limits and reviewer decisions](engineering-tools/methods/C0C_EVIDENCE.md). Deployed with C3-A; no catalog edits.

C0-C verification: TypeScript, zero-diagnostic full lint, production build, bundle budgets, isolated production smoke and diff checks passed. The concurrent Persian documentation/diagram commit `d453c4d` was preserved; both README languages are updated.

## Next executable packages

**Current deployment:** `bb0ef61b0bfc89077bacfe0dd113d52363c8af9f` on both domains, October 20 at 08:17 UTC. Includes C1-D/C0-C/C3-A and the engineering entry fix: the product tab directly offers independent manual inputs while product approval is pending. All 120 tests, required lint, build and production smoke passed on Windows and Ubuntu, with successful GitHub CI. All nine database tables and uploads were unchanged across activation. Backups stay on the VPS only. Live English/Persian calculation checks pass. [Current release evidence](engineering-tools/ENGINEERING_ENTRY_FIX_2026-10-20.md); [C3-A evidence](engineering-tools/C3A_INPUTS_UNITS.md). This publication does not close engineering acceptance or the remaining C5 operations work.

1. **C3-B / manual portion of ENG-06:** implement an independent manual target-life worksheet and explicit result assumptions. C3-A shared bilingual inputs and the eight-group converter are complete, with 120 tests and targeted browser acceptance; [evidence](engineering-tools/C3A_INPUTS_UNITS.md). C1-D/C0-C/C3-A are deployed. Product-specific methods remain gated on review.
2. **C2-A:** collect exact owner identity decisions using the generated queue, then research and prepare conflict-checked field patches and remaining asset candidates. Do not guess missing identities.
3. **C0 approval follow-through:** submit the prepared C0-C packet when the engineer is nominated; resolve interpolation/applicability decisions and implement approved operating-envelope enforcement before enabling any catalog profile. Do not contact others without authorization.

The existing toolbox estimate of 21–32 developer days covers its original scope only. It does not include all catalog evidence resolution, 197 lint findings, server operations or reviewer waiting time. Re-estimate after C0 and the first C1 batch; no unsupported calendar deadline is promised.

## Closure ledger

| Decision/dependency | Owner | Status |
| --- | --- | --- |
| Engineering method and product eligibility acceptance | Engineer to be nominated by owner | Open; owner explicitly deferred nomination |
| Exact brand/suffix/arrangement for ambiguous inventory | Owner, with engineer review | 47 records in identity queue |
| Code implementation, audit evidence and checks | Developer | In progress |
| Persian/English engineering content acceptance | Owner/designated reviewer | Open |
| Production publication/reboot and indexing decisions | Owner | Prepare concrete release/operation evidence first |

References: [October 18 baseline review](STATUS_REVIEW_2026-10-18.md), [toolbox scope and module gates](engineering-tools/PROJECT_PLAN.md), [deployment procedures](DEPLOYMENT.md).
