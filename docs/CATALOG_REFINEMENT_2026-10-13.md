# Catalog and product panel refinement — 2026-10-13

The Alpine Bearing case study informed a clearer product discovery flow: search first, optional dependent filters, consistent product cards and a compact specification workspace. The implementation preserves Polad Charkhesh's company showroom purpose and existing single-page layout.

## Implemented

- Search by designation, application or dimension triplet, with optional bore, outside diameter and width selectors. Each selector offers sizes compatible with the other filters. Family counts follow the current search and dimensions.
- Removable active filters, Clear all and an explicit no-results recovery action. Search, family, dimensions and selected product remain shareable URL parameters. Assisted catalog search clears stale family/dimension constraints.
- Uniform image plates and cards with prominent complete designations, family labels, dimensional information and one details action. Lubricant cards show weight rather than zero bearing dimensions. Manufacturer reference links now follow the product results.
- Preserve two complete rows, a faded third row and Show more. Faded cards are inert until revealed, so keyboard focus cannot enter clipped content.
- Product panels keep image/drawing/exploded controls, key dimensions and contact actions available while visitors switch between specifications, documents and related components. Reference illustrations and estimated 3D geometry retain their labels; company PDFs remain distinct from manufacturer publications.
- Related navigation updates the selected product URL while keeping the same dialog instance. Escape returns focus to the original catalog card and restores page scrolling.
- Compact RTL/LTR layouts, single-scroll mobile dialog, reduced-motion-aware family scrolling and scoped styling. Existing selected-bearing background and Follow scroll behavior are unchanged.
- Correct the default Persian family-reference label. Existing saved CMS copy remains authoritative; this source update does not overwrite owner-edited labels or local data.

## Verification

- TypeScript and all 49 regression tests passed, including dependent dimension choices, Persian numeric filters, archive exclusion, impossible-filter recovery and preservation of catalog values.
- Production build and bundle budgets passed: 81.8 KB gzip initial JavaScript, 403.2 KB largest lazy chunk; no new dependencies.
- Isolated production smoke test passed; owner SQLite data and uploads were not used for test mutations.
- Browser interaction checks: combined size filters and reload persistence, exact-suffix/Persian-digit search, zero-results reset, grid/table switching, assisted search reset, faded-row reveal, documents, exploded canvas, related selection and Escape/focus recovery.
- Checked desktop and 390/320 px mobile behavior, including RTL, long product codes, viewport overflow and single-scroll dialogs. All 110 cards fit at the narrow three-column desktop breakpoint after correcting long-label clipping. A representative desktop product panel fits without internal scrolling at 1101 × 800.
- Browser console checks reported no errors during tested flows. Screenshot capture was unavailable in this browser session, so visual screenshot approval remains outstanding; DOM interaction and geometry checks are not a substitute for final visual review.
- Repository lint still fails with 203 findings, down from the prior 210. The remaining lint backlog, complete accessibility/security/device review, product/media reconciliation and live hosting/domain verification remain launch gates.

No catalog technical values, calculation formulas, uploaded files, database records or deployment settings were changed. This is a source/UI update, not a deployment approval.
