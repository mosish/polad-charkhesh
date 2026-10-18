# C0-C / ENG-03 — method evidence and regression packet

Prepared 2026-10-18. **Developer package complete; engineering acceptance pending.** The owner will nominate the engineer later. No production calculation profiles have been approved or added. Subsequently deployed with C1-D/C3-A at `46272c6e8a9f0c95da739b1b21539dc2e9dde60d`; [release evidence](../C3A_INPUTS_UNITS.md). Engineering acceptance remains pending.

## Source retrieval record

The PDFs below were retrieved from manufacturer hosts, text-inspected and the key formula tables visually checked. The web reader could not open the large PDFs; direct HTTPS retrieval succeeded. Full PDFs, extracted text and rendered pages stay in ignored `work/c0c-sources/`; they are not redistributed in Git. Hashes identify the exact bytes reviewed, not a claim that their product ratings are current.

| Ref | Primary publication | Verified location / use |
| --- | --- | --- |
| S1 | [SKF Rolling bearings, PUB BU/P1 17000/1 EN, October 2018](https://cdn.skfmediahub.skf.com/api/public/0901d196802809de/pdf_preview_medium/0901d196802809de_pdf_preview_medium.pdf) | Copyright/edition: PDF p.2. Printed pages are PDF page minus 2. Reliability p.90 table 3; static load p.105; speed pp.135–136; thrust ball p.469; cylindrical p.509; needle p.606; tapered p.680; spherical p.784; CARB p.849; spherical thrust p.917. |
| N1 | [NSK Rolling Bearings for Industrial Machinery, technical information](https://www.nsk.com/content/dam/nsk/common/catalogs/ctrgPdf/bearings/e1103c_parta.pdf) | File metadata identifies **E1103d 2025 B-10**, despite the older URL name. Printed A054–A055, PDF p.28: worked deep-groove example, including linear interpolation of Y. |
| N2 | [NSK Rolling Bearings for Industrial Machinery, bearing tables](https://www.nsk.com/content/dam/nsk/common/catalogs/ctrgPdf/bearings/e1103c_partc.pdf) | Same metadata edition. Printed C020–C021, PDF p.11: single-row deep-groove factors and static branches. |
| N3 | [NSK bearing life calculator help](https://www.nsk.com/engineering/knowledge-base/bearing-life-calculation-tool--contents-of-help-in-new-life-calculation-equation-/) | Web section on reliability: separate ABLE and ISO 281 tables. Retrieved October 18; no numbered web edition. |

SHA-256:

```text
S1 65e0919bee24975b9563ca0d9adf721a9e7efcf6d0fa32c18b8d119d37b190b2
N1 6ea513c7d0c12dfbc7dc4b5e5ec6827f7b99b3c57fab0edd35a365f4f0b1140c
N2 3c1acfda536bb6a77487d1fcf6812618e31c62582fb20089659d20b7af07a6e2
```

## Method specification and release limits

`catalog-life/2` is the software contract version. Version 1 profiles fail eligibility. All forces below use kN consistently; speed is rpm. Factors and load ratios are dimensionless. Ratings must use the relevant radial or axial definition. A source citation establishes a candidate method, not approval of the company's product record or operating case.

| Method | Evidence-backed relationship | Deliberate implementation scope |
| --- | --- | --- |
| LOAD-RADIAL-01 | S1 pp.509/606/849: P=P0=Fr | Pure radial cylindrical non-locating, radial needle and CARB cases only. Axial loads rejected. No track-roller, combined-needle or axial-flange-capacity calculation. |
| LOAD-DGBB-01 | N2 C021: P=Fr at Fa/Fr≤e; otherwise P=0.56Fr+YFa. P0=max(Fr,0.6Fr+0.5Fa). | NSK single-row factor-table candidate. f0 must be product-specific. Other manufacturers, double rows, filling slots, bearing pairs and clearance variants require separate applicability evidence. |
| LOAD-SPHERICAL-01 | S1 p.784: P=Fr+Y1Fa at Fa/Fr≤e; otherwise P=0.67Fr+Y2Fa. P0=Fr+Y0Fa. | Product-specific positive e/Y1/Y2/Y0; external review of mounting and permissible axial loading. |
| LOAD-TAPERED-01 | S1 p.680: P=Fr at Fa/Fr≤e; otherwise P=0.4Fr+YFa. P0=max(Fr,0.5Fr+Y0Fa). | Single-row bearing with solved operating loads, including induced axial effects. The acknowledgment does not solve reactions. Matched-pair totals and double-row methods are excluded. |
| LOAD-THRUST-BALL-01 | S1 p.469: P=P0=Fa | Pure axial thrust ball only; ball exponent 3. |
| LOAD-SPHERICAL-THRUST-01 | S1 p.917: P=m(Fa+XFr), P0=Fa+X0Fr; Fr≤0.55Fa | SKF series 292/293/294 and run-out choice must be explicit in the reviewed profile. Series determines X/X0; m is 1 or 0.88. Roller exponent 10/3. Generic catalog Y/Y0 fields cannot choose this method. |
| RELIABILITY-01 | S1 p.90 and N3 ISO table: a1=1/.64/.37/.25 for 90/95/98/99% | Multiplies basic-life hours only. No aISO, aSKF or aNSK correction; do not label it full modified rating life or ABLE. Other reliability inputs rejected. |
| STATIC-SAFETY-01 | s0=C0/P0 | Arithmetic output only. No universal acceptable minimum or automatic suitability verdict. Current inputs represent one constant load case, not a maximum-load search. |
| SPEED-CHECK-01 | S1 pp.135–136 distinguishes thermal reference and mechanical limiting speed | Existing `unknown/within/exceeded` comparison retained. `within` describes the selected catalog value only, not thermal/application acceptance. |

Approval must identify the exact manufacturer, suffix, family, mounting, clearance, rating basis and source factors. The reviewer must evaluate the operating envelope, minimum load, maximum/static load, temperature, lubrication, misalignment and speed limits. Those application checks are **not implemented** by this arithmetic package. A profile must not be released for arbitrary operating inputs before an enforceable approved envelope is designed. This is an explicit remaining ENG-03/product-release gate.

### Deep-groove interpolation policy

The nine existing knots match N2. This implementation linearly interpolates **both e and Y** within the closed interval 0.172≤f0Fa/C0≤6.89. N1 explicitly demonstrates interpolation of Y; its rounded e does not independently prove the e-interpolation convention. **The e convention still requires reviewer acceptance** or a more specific manufacturer instruction before approval. No physical accuracy is implied by floating-point precision.

The former silent lower-end clamp has been removed. Values below the first knot, above the last, nonfinite intermediate values and underflow to zero are rejected. No lower-range rule was verified; rejection is a software scope restriction, not a claim that the bearing cannot operate there. Pure radial loading bypasses this table. Equality at e selects the low-ratio branch. Do not smooth rounded-table discontinuities to manufacture continuity.

### Spherical-thrust correction

Previously arbitrary Y/Y0 product fields determined the radial contributions, and the run-out branch was absent. The reviewed profile now requires `sphericalThrust.series` and `sphericalThrust.runout`. Missing or invalid choices fail eligibility. No designation is parsed to guess these choices, and no catalog record is edited. The 29420 identity/family conflict remains in the owner/engineer queue.

### Speed and fit conventions

The speed helper first compares a valid limiting speed; otherwise it compares the lower available positive grease/oil rating. This precedence is a **software screening convention**, not a manufacturer recommendation for lubrication selection. Reference speed alone returns unknown. The approved operating envelope must eventually enforce all applicable limits; no thermal model or lubricant selection exists here.

Fit classification retains its exact arithmetic boundaries: minimum zero is clearance, maximum zero with a negative minimum is interference, and both zero is clearance. These are software labels for supplied diameter limits, not ISO fit selection or operating bearing clearance. Measurement precision and bilingual explanation remain part of ENG-08 review.

## Independent benchmark derivations

All new fixtures are synthetic unless explicitly marked as the published example. `tests/engineering-methods.test.ts` supplies fixed expected values independently of production functions. Normal tolerance is max(1e-9 absolute, 1e-12×|expected|), solely for floating-point regression.

| Fixture group | Hand-derived reference and boundary coverage |
| --- | --- |
| DGBB knots | With Fr=0, Fa=C0=1, P is Y. All nine knots are tested. On either side of each e, radial and combined branches are distinguished. |
| DGBB interpolation | Eight independent midpoints: 0.2585→Y2.145; 0.517→1.85; 0.8595→1.63; 1.205→1.5; 1.725→1.38; 2.76→1.23; 4.31→1.095; 6.03→1.02. Each is the arithmetic mean of adjacent endpoint values. Both sides of the interpolated e are tested. |
| DGBB static / equality | Fr=10, Fa=3 at e=.3 yields P=10. For Fa=4/8/10, P0=10/10/11. Pure axial Fa=2 gives P0=1. Lower/upper table violations and intermediate underflow reject. |
| NSK worked example | N1 A055 example 3 uses Fr=2.5, Fa=1, C=32, C0=17.9, f0=14. Published rounded P=3.070 kN agrees within **0.005 kN**, allowing the printed two-decimal Y rounding. It is not an exact-life oracle. |
| Spherical | Synthetic e=.25, Y1=2, Y2=3.32, Y0=2. Fr=10 and Fa=2/2.5/3 yield P=14/15/16.66 and P0=14/15/16. At Fr=0, Fa=3: P=9.96, P0=6. C0=48 gives s0=48/P0. |
| Single-row tapered | Synthetic e=.25, Y=2.4, Y0=2. Fr=10 and Fa=2/2.5/3 yield P=10/10/11.2 and P0=10/10/11. At Fr=0, Fa=3: P=7.2, P0=6. Unconfirmed arrangement rejects. |
| Radial and thrust ball | Radial Fr=4 produces P=P0=4 for each supported radial roller family, exponent 10/3; any axial component rejects. Thrust ball Fa=4 produces P=P0=4, exponent 3; any radial component rejects. |
| Spherical thrust | Fr=2, Fa=10: series 292/293/294 give P=12.2/12.4/12.6 and P0=15/15.4/15.8. The other run-out branch gives P=10.736/10.912/11.088. For series 294, Fr=5.5, Fa=10 gives P=17.15 and P0=25.95; slightly larger Fr rejects. Pure axial and missing/invalid profile choices are covered. |
| Reliability | C/P=10, n=100000/60 gives 1000 million revolutions and 10000 hours. Expected adjusted hours: 10000/6400/3700/2500. Unsupported percentages and nonfinite values reject. |
| Numerical and state boundaries | Missing/nonpositive/nonfinite factors, invalid loads/speeds, overflowing results, outdated method version, unknown speed, exact speed equality and fit zero-boundaries are covered. Existing tests ensure every production catalog calculation remains unapproved. |

## Verification and remaining decision

Before fixes, three new test groups failed: lower-table rejection, spherical-thrust profile validation, and spherical-thrust arithmetic. They pass after the changes. Full suite: **107/107 passed** with loopback enabled. An earlier sandbox run could not connect to its temporary localhost APIs (`EACCES`); the authorized complete rerun passed. No production database was involved.

TypeScript, full repository lint (zero diagnostics), production build, bundle budgets, isolated production smoke and `git diff --check` passed. Bundle check: initial JavaScript 84.3 KB gzip; largest chunk 403.5 KB; 23 JavaScript chunks. Smoke covered pages/assets/metadata, admin setup, product/content edits, inquiry, media, backup and logout using disposable local data. The intervening Persian README/diagram commit `d453c4d` was fast-forwarded and preserved before publishing this package. Both README languages and the completion tracker were updated.

There are no public UI changes, so no new visual acceptance claim is made. Existing manual-life and fit regression fixtures remain in [REGISTER.md](REGISTER.md). GitHub CI results must be checked on the published commit separately; local checks are not a CI completion claim.

To close engineering acceptance: nominate the engineer; accept/revise the scoped methods and e-interpolation convention; establish enforceable operating envelopes; resolve exact product identities and factors; review bilingual disclosures; then approve an explicit subset through source review. Target-life, unit-tool expansion, guidance and case storage remain later C3 work. Do not interpret this packet as permission to enable catalog results or deploy.
