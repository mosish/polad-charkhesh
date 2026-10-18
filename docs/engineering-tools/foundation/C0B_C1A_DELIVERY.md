# C0-B eligibility and C1-A validation delivery

Date: 2026-10-18. Baseline: `ec0e82ca69ebc38c6a2b457b6cf04391e7a97ffc`.

**Developer work packages C0-B and C1-A are complete in source.** C0 engineering approval and the full C1 lint phase remain open. No deployment, catalog edit, manufacturer approval, indexing change or server operation is included.

## Calculation behavior

- `domain/engineering.ts` defines reviewed calculation family, arrangement, permitted load cases, method version, evidence and review metadata independently of `schematicType`.
- The production profile registry is intentionally empty because an engineer has not been nominated and no method/product approval has been recorded. All current catalog-driven calculations therefore stop with a useful explanation. Browsing, product comparisons and the independent manual tool remain available.
- `calculationRevision` binds a profile to exact identity, ratings, factors, dimensions, speed fields and relevant technical metadata. A mismatch invalidates it. Image, translated title and illustration changes do not choose formulas. This revision is an equality check, not a cryptographic signature.
- Profiles live in reviewed source, not public catalog JSON. Unknown profile fields are rejected by product validation. A future approval must document exact manufacturer method applicability, arrangement, allowed load cases, reviewer/date and sources, and capture the current technical revision. Tests use explicitly synthetic profiles outside the production registry; passing them is not engineer approval.
- Unsupported angular-contact, self-aligning and cam-follower methods remain unavailable even with a profile, until their methods are implemented and reviewed. Tapered arrangements still require the operating-load acknowledgment. A reviewed profile cannot override numerical validation or family load restrictions.
- Eleven legacy family/arrangement flags are centralized and covered by tests. They identify required review; no guessed family or rating is written to SQLite.
- Missing/archived product links no longer silently select the first product. The picker can remain empty. Manual mode requires explicit C, P and ball/roller selection and does not copy catalog values. These inputs survive product changes and language switches. Blank inputs clear the result.
- Manual life, fit and converter tools render without a catalog product. A catalog load/error state does not gate their rendering. Catalog fetch-failure behavior is code-reviewed but was not separately simulated in the browser.
- Speed assessment now distinguishes unknown, within and exceeded. Reference speed alone is not treated as a limit. The UI names limiting speed versus the conservative minimum of available lubricant ratings; a comparison is not application acceptance.

## API validation and lint

`api/validation.ts` and `api/content-validation.ts` now take unknown inputs and narrow objects, strings, arrays and numbers before use. This removes 20 explicit `any` findings; a URL-field suffix check removes one further lint finding. Rules and CI advisory policy are unchanged.

Malformed SEO page containers/entries are rejected explicitly instead of being coerced or risking an exception. Valid existing catalog records and bilingual content still pass. Tests cover nested malformed values, unsafe URLs, attempted profile injection and prototype-key rejection. No stored content is rewritten.

Full repository lint: **197 → 176 errors**. Remaining explicit `any`: **126**. Other accessibility, React/hooks and tooling findings remain open. This package is not a claim that lint or application security acceptance is complete.

## Verification

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| Regression suite | 83/83 passed; disposable databases and loopback access |
| Targeted lint on new/changed calculation and validation modules | Passed; pre-existing findings in the broader platform test file remain in the full inventory |
| Production build | Passed |
| Bundle budgets | Passed: initial JS 84.2 KB gzip; engineering chunk about 10.1 KB gzip |
| Isolated production smoke | Passed: pages/assets/metadata, admin setup, product/content edits, inquiry, media, backup and logout |
| Browser — flagged NTN 5206S | English review-required message; no product life result; manual recovery visible |
| Browser — manual benchmark | C=10, P=1, n=1000, ball: L10=1000 and rounded L10h=16,667; no catalog values copied |
| Browser — product/language changes | Inputs/result preserved when selecting another product and switching English → Persian |
| Browser — missing product | Persian no-selection message; no silent substitute |
| Browser — blank/reset | Clearing C removes the result; keyboard Tab reaches reset and Enter clears manual values/type |
| Browser — empty catalog | After verifying the disposable preview held only seed IDs, its products were removed. Manual roller C=8, P=1, n=1000 produced L10=1024 and rounded L10h=17,067 with picker disabled |

Browser checks used a narrow local in-app preview and synthetic/seed data, not live catalog acceptance. Persian recovery screenshot is saved in the task's local `outputs/engineering-eligibility-fa.png`. This is targeted verification; desktop/tablet, full accessibility and remaining locales/input parsing belong to later acceptance work.

## Remaining work

1. C0-C: exact method sources, branch/interpolation/static-load/reliability benchmarks and nominated engineer review. No product profile should be added merely to make results reappear.
2. C1-B: continue the 176-error backlog through API/database/import models, then admin/client types and behavior/a11y findings. Keep complete regression coverage around each batch.
3. C2: exact inventory identity decisions, remaining images and documents. No approval can be inferred from image coverage.
4. Future UI: shared locale parser, more specific bilingual input errors and approved method disclosure. No claim of complete toolbox expansion yet.

See the [completion tracker](../../COMPLETION_PLAN.md) and [method register](../methods/REGISTER.md). The historical [C0-A audit](AUDIT.md) describes pre-C0-B behavior; this delivery supersedes its family-routing, manual-mode and speed-state findings in source only.
