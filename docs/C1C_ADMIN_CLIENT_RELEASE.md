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

Published on both language domains at **2026-10-18 09:07 UTC**. Runtime source: `d41f111bf48a570cd89930c1f16271140047d67b`. This release includes C0-A, C0-B, C1-A, C1-B and C1-C. Later documentation-only commits do not change the runtime revision.

- Downloaded the pinned GitHub source on the VPS; installed locked dependencies; Ubuntu TypeScript, **93/93 tests**, production build, bundle budgets and isolated production smoke all passed.
- A private copy of the verified owner backup started under the candidate. Every table and upload hash matched before/after startup; all 110 products loaded.
- Immediately before activation, created and independently verified `/var/backups/polad-charkhesh/backup-2026-10-18T09-07-31.915Z-f17c65`. The backup and private startup copy remain **on the VPS only**; neither was downloaded or committed.
- Switched the `current` symlink atomically. The previous release `326782d58fa8065c2219c6011a24a9eff1473ba3` and its hashed assets are retained for rollback and already-open clients. Application and Nginx are active; local health is `ok`.
- SHA-256 comparisons across all nine database tables and uploads matched immediately before/after activation: **110 products, one administrator, three sessions, six settings, 44 audit rows, eight rate-limit rows, zero inquiries/media/backup-snapshot rows and zero upload files**. No catalog fields or owner content were edited.
- Trusted-HTTPS external checks passed **226 page/language variants per domain (452 total)**, four initial assets and **115 resolved local image assets per domain**, health, admin entry, robots, sitemap, llms and favicon. Both domains expose identical product records; `.com` defaults to English and `.ir` to Persian. Private backup returns 401 and unknown pages return 404. `noindex` remains enabled.
- Seven stored legacy image placeholders still use the application's existing family-image fallback. An initial raw-URL probe returned 404 for a legacy path absent in both releases; checks of the actual resolved images passed. This release does not resolve the nine outstanding exact-image replacements or change their source records.
- Live browser checks in English and Persian: blank independent manual mode; C=30 kN, P=3 kN, ball exponent and 1500 rpm produce 1000 million revolutions / 11,111 displayed hours; selecting a product preserves manual inputs; NTN 5206 S product calculation displays the review-required restriction. Local editor saves are separate from live verification; no production admin save was performed.

Evidence logs and data fingerprints remain private under `/root/polad-preparation/c1c-*`. The database, secrets and uploaded bytes are excluded from GitHub. This targeted release does not claim a full browser or engineering acceptance audit.

## Remaining gates

C1 still has 63 errors. Engineering acceptance, exact inventory identities, unresolved media/documents, expanded toolbox modules, complete application acceptance, host hardening/reboot and indexing remain open in [COMPLETE-01](COMPLETION_PLAN.md). This owner-authorized incremental deployment does not close those gates or authorize Search Console/indexing changes.
