# Engineering entry-state correction — 2026-10-20

The owner reported the homepage showing “Product calculation unavailable” with no product selected. The default already opened manual mode; selecting the product tab exposed only a restriction and a button to change tools. This made an intentionally gated calculation look like a broken toolbox.

## Change

- Both the homepage and standalone workspace now show the manual basic-life form directly when the product tab has no eligible product. A bilingual notice explains the missing selection/review; manual results are explicitly separate from product approval.
- Manual C/P/type inputs remain independent, survive selection and language changes, and are never populated from catalog ratings. Approved profiles still use the product method; the production registry remains empty and `calculate` still rejects all unapproved products.
- Tabs now say “Product life & load” and “Manual rating life”. The selector uses a short placeholder, with its optional-use explanation below and an accessible description. Width constraints keep the picker within its container. Keyboard focus stays inside the horizontally scrollable tool strip.
- No formulas, catalog data, images, approval records, server configuration or indexing settings change.

## Verification

All 120 existing tests pass, including rejection of every unapproved product and independent manual calculation. TypeScript, zero-diagnostic lint, build, bundle checks and isolated production smoke pass. Targeted Chrome homepage checks cover default manual mode, the originally reported product-tab/no-selection state, Persian/Arabic inputs (C=30 kN, P=3 kN, ball, 1500 rpm → L10=1000 million revolutions, displayed L10h=11,111 h), unreviewed NTN selection, retained manual values, language switching and reset. The reported horizontal page overflow was not reproducible in the original live Chrome view; no global overflow masking is added.

Deployment evidence will be added after the pinned release is activated. Engineering approval remains pending. C3-B remains the next planned feature package.
