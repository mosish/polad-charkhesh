# Engineering entry-state correction — 2026-10-20

The owner reported the homepage showing “Product calculation unavailable” with no product selected. The default already opened manual mode; selecting the product tab exposed only a restriction and a button to change tools. This made an intentionally gated calculation look like a broken toolbox.

## Change

- Both the homepage and standalone workspace now show the manual basic-life form directly when the product tab has no eligible product. A bilingual notice explains the missing selection/review; manual results are explicitly separate from product approval.
- Manual C/P/type inputs remain independent, survive selection and language changes, and are never populated from catalog ratings. Approved profiles still use the product method; the production registry remains empty and `calculate` still rejects all unapproved products.
- Tabs now say “Product life & load” and “Manual rating life”. The selector uses a short placeholder, with its optional-use explanation below and an accessible description. Width constraints keep the picker within its container. Keyboard focus stays inside the horizontally scrollable tool strip.
- No formulas, catalog data, images, approval records, server configuration or indexing settings change.

## Verification

All 120 existing tests pass, including rejection of every unapproved product and independent manual calculation. TypeScript, zero-diagnostic lint, build, bundle checks and isolated production smoke pass. Targeted Chrome homepage checks cover default manual mode, the originally reported product-tab/no-selection state, Persian/Arabic inputs (C=30 kN, P=3 kN, ball, 1500 rpm → L10=1000 million revolutions, displayed L10h=11,111 h), unreviewed NTN selection, retained manual values, language switching and reset. The reported horizontal page overflow was not reproducible in the original live Chrome view; no global overflow masking is added.

## Deployment

Activated on both domains at **2026-10-20 08:17:41 UTC**, pinned to `bb0ef61b0bfc89077bacfe0dd113d52363c8af9f`. The previous release `46272c6e8a9f0c95da739b1b21539dc2e9dde60d` is retained for rollback. [GitHub CI passed](https://github.com/mosish/polad-charkhesh/actions/runs/39391599746); the Ubuntu candidate also passed all 120 tests, TypeScript, lint, build, bundle budgets and isolated production smoke.

The candidate was first tested against a private backup copy: 110 products loaded and all table/upload hashes remained unchanged. The verified activation backup is `/var/backups/polad-charkhesh/backup-2026-10-20T08-17-40.826Z-819e4e`, retained **only on the VPS**. All nine live database tables and uploads matched their pre-activation hashes. Both application and nginx services are active; health is `ok`.

Trusted HTTPS checks returned 200 for the homepage, both language variants of `/engineering`, and `/api/health` on each domain. Live Chrome checks on `.com` and `.ir` confirmed that the product tab with no selection shows the manual form and the pending-approval explanation. The C=30/P=3/ball/1500-rpm example produced 11,111 displayed hours and 1000 million revolutions in both languages, including Persian/Arabic input. Desktop page width and scroll width both measured 1649 px. Local mobile checks at a 390 px viewport also showed no page overflow.

Local same-page language changes preserve the manual draft. The production language switch navigates between domains and starts a new page; cross-domain draft persistence is not provided.

Engineering approval remains pending. C3-B remains the next planned feature package.
