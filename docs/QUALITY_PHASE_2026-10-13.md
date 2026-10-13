# Reliability and source quality — 2026-10-13

**Outcome: targeted reliability phase completed; launch remains blocked.**

This phase makes API failures and admin recovery more predictable, establishes automated source checks, and inventories lint debt. It does not approve manufacturer data, certify accessibility/security, or deploy the website.

## Changes

- A malformed HTTP 200 response now rejects the API request instead of returning an error-shaped object as successful data. HTTP failures preserve a safe string message and status code. GET/HEAD requests reject bodies before making a network call.
- Sign-out reports connection errors while preserving the visible dashboard for retry. If the session has expired, it refreshes authentication state and returns to sign-in. This expired-session issue was reproduced during browser QA before the fix.
- Media reading is shared by the admin media page and the image/PDF picker. Empty, oversized, unsupported, unreadable and cancelled files reject with an error. The media-page input is cleared after an attempt so the same file can be selected again.
- Delete/restore API errors also appear inside the active confirmation dialog.
- English/Persian catalog table headers include an explicit Details column and column scope; product detail buttons have bilingual names.
- Root TypeScript configuration extends the existing platform configuration. Vite client declarations, Express/cookie-parser types and explicit Node test registration address configuration/type gaps. Next.js-specific lint rules were removed because the application uses Vite/React and Express.

## Verification

Environment: Windows, Node 24.21.0, pnpm 11.25.0.

| Check | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed |
| `npm run typecheck` | Passed |
| `npm test` | 44 passed; 9 new API/media regression cases |
| `npm run build` | Passed; existing Three.js chunk-size warning remains |
| `npm run smoke:production` | Passed with disposable database/uploads: pages, assets, metadata, admin provisioning, content/product edits, inquiry, media, backup and logout |
| Scoped lint of `lib/media-upload.ts`, `tests/api-client.test.ts`, `tests/media-upload.test.ts` | Passed |
| `npm run lint` | **Failed: 210 findings remain** |

The Vite proxy integration test can log a dependency-scan shutdown warning when closing its temporary server. Its assertions passed; this is not evidence of a browser audit.

Browser checks used the built application at a temporary loopback port with a separate QA account/database. Verified:

1. Admin sign-in and Media navigation.
2. Stopping the QA server makes sign-out show a connection error; the control remains available.
3. Revoking only QA sessions then signing out returns the updated build to sign-in.
4. English and Persian table headings and opening the first product's specifications.
5. Persian layout at 390 × 844: no document horizontal overflow.
6. Escape closes the product panel and restores focus to the invoking product button.

The QA server was stopped afterward. The normal local preview and owner data were not used for test writes. Native file-picker uploads, every admin role/restore flow, screen-reader behavior and a complete security review are not claimed as verified by this phase.

## Lint inventory

The initial command produced 351 findings. The current count is 210. This reduction combines valid configuration corrections, missing type declarations and source fixes; it does **not** mean 141 runtime bugs were fixed.

| Group | Remaining findings |
| --- | ---: |
| Explicit `any` types | 153 |
| Accessibility rules, including semantic-element preferences | 28 |
| React compiler and effect dependencies | 15 |
| Deprecated unload compatibility properties | 3 |
| Other type, unused-code and correctness rules | 11 |

Counts are a snapshot, not a suppression baseline. No correctness/accessibility rule was downgraded to hide remaining findings. Some findings need semantic review rather than mechanical replacement (for example native dialog events and SVG image roles).

## GitHub checks

`.github/workflows/quality.yml` runs on `main` pushes, pull requests and manual dispatch. Type checks, tests, build and production smoke are blocking job steps. The repository lint step is **advisory** until the backlog is cleared; its outcome is printed in the job summary with an explicit launch-blocker warning. Remove that exception when lint passes. This workflow does not configure branch protection or deployment.

Actions are pinned to verified commits with read-only repository permissions and no persisted checkout credentials. Setup follows the official [setup-node documentation](https://github.com/actions/setup-node/blob/v4/README.md) and [checkout documentation](https://github.com/actions/checkout/blob/v4/README.md). The GitHub runner result must be checked separately after pushing; local success is not a remote-run result.

## Next release gates

1. Replace untyped boundaries with validated types and clear the remaining lint findings; make lint blocking in CI.
2. Complete browser/mobile/RTL, keyboard/screen-reader, admin workflow and security reviews with recorded evidence.
3. Independently verify manufacturer designations, specifications, exact photos and original PDFs. Catalog records and engineering formulas were not changed in this phase.
4. Purchase and validate hosting, persistent storage/WAL, restart behavior, both domains/HTTPS, restore drills and resource limits.

No production deployment or deployment-candidate approval has occurred.
