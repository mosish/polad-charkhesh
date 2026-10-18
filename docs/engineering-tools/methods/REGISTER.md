# Engineering method register — review draft v0.2

Prepared 2026-10-18 for ENG-03. Developer: implementation/evidence preparation. Engineering approver: **unassigned; owner will nominate later**. None of these rows constitutes engineering release approval. Synthetic tests validate arithmetic and software boundaries, not a real bearing application.

**C0-C developer evidence complete:** [retrieved publications, exact pages, hashes, method scope, independent derivations and remaining decisions](C0C_EVIDENCE.md). Software contract: `catalog-life/2`. This supersedes the initial source leads below; engineering acceptance and enforceable application envelopes remain open.

| ID | Method / units | Current evidence and domain | Remaining gate |
| --- | --- | --- | --- |
| LIFE-BASIC-01 | L10 in million revolutions; L10h in hours; C/P in matching force units; n in rpm | Constant equivalent load/speed, ball exponent 3 or roller exponent 10/3. [NSK, Dynamic Load Ratings and Fatigue Life](https://www.nsk.com/tools-resources/abc-bearings/dynamic-load-ratings-and-fatigue-life/) checked October 18; web publication has no edition number. Six benchmarks below. | Reviewer confirms applicability and disclosure. C/P and bearing type must be established independently. |
| CAPACITY-TARGET-01 | Required C from target L10h, known P, n and exponent | Algebraic inversion of LIFE-BASIC-01; not yet implemented. | Three benchmarks plus invalid/range tests; same applicability limits. |
| LOAD-RADIAL-01 | P/P0 in kN for applicable pure radial cases | SKF pp.509/606/849 and NSK C021; radial axis/exponents tested. | Exact family/arrangement eligibility, minimum loads and rating semantics; illustration is insufficient. |
| LOAD-DGBB-01 | Deep-groove combined P/P0, e/Y via f0 Fa/C0 | NSK E1103d C021 and A055 retrieved; all knots/midpoints, static branches, bounds and invalid inputs tested. Unsupported lower clamp removed. | Manufacturer/clearance applicability and e-interpolation convention need acceptance. No extrapolation. |
| LOAD-SPHERICAL-01 | Equivalent dynamic/static loads using e/Y1/Y2/Y0 | SKF p.784 retrieved; both branches, equality, pure axial and static-ratio benchmarks pass. | Exact product factors, mounting and operating envelope approval. |
| LOAD-TAPERED-01 | P/P0 with e/Y/Y0 and induced axial loads | SKF p.680 single-row method retrieved; both dynamic/static branches and equality tested. | Reviewed operating-load solution; matched-pair totals/double-row methods excluded. |
| LOAD-THRUST-01 | Pure axial thrust ball and spherical roller thrust | SKF pp.469/917 retrieved. Ball method tested; spherical-thrust series and run-out model now mandatory in profile, with six branch benchmarks. | Exact identity and arrangement approval; 29420 conflict remains unresolved. Minimum-load/application checks not implemented. |
| RELIABILITY-01 | a1 × basic life for 90/95/98/99% | SKF October 2018 p.90 table 3 retrieved and visually checked; NSK ISO table corroborates. Four multiplier benchmarks pass. | Reviewer acceptance; reliability-only adjustment, not full modified life. |
| STATIC-SAFETY-01 | s0 = C0/P0, dimensionless | SKF p.105 and family load pages retrieved. Arithmetic ratio tested; no automatic required minimum. | Approved maximum-load case and application-specific acceptance criteria. |
| SPEED-CHECK-01 | rpm comparison | C0-B implemented unknown/within/exceeded and identified comparison basis. SKF pp.135–136 retrieved; equality, invalid/reference-only and fallback tests pass. | Application thermal/lubrication limits and software precedence need review; a catalog comparison is not suitability approval. |
| FIT-LIMITS-01 | Worst-case diameter differences in µm from mm inputs | Dimensional subtraction; three synthetic cases below. Equality is currently classified as clearance if min=0, interference if max=0 and min<0. | Review boundary wording and input precision; not tolerance selection or operating clearance. |
| UNITS-01 | Unit conversions | C3-A: eight bidirectional groups, NIST-based definitions, localized parser and fixed benchmarks; absolute temperature and differences are separate. [Contract and evidence](../C3A_INPUTS_UNITS.md). | Developer acceptance complete. Does not approve an operating condition or product profile; engineering/content acceptance remains open. |
| GUIDANCE-01 | Lubrication/maintenance preparation | Non-numerical first-release workflows only. | Reviewed sources and bilingual paths; no unsupported intervals, grease compatibility or definitive diagnosis. |

The [C0-C packet](C0C_EVIDENCE.md) records the successful manufacturer-host retrieval after the earlier web-reader failures. Full proprietary catalogs are not redistributed.

## Independent basic-life fixtures

Derived by hand from the published exponent relationship and revolutions-to-hours conversion. Values below are synthetic, not catalog ratings or application recommendations. Force inputs both use kN. The roller choices use perfect cubes, so their expected integer powers do not depend on evaluating the production fractional-power code.

| C | P | n rpm | Type | Independent L10 derivation | Expected L10h |
| --- | --- | --- | --- | --- | --- |
| 10 | 1 | 1000 | Ball | 10³ = 1000 | 16,666.666666666668 h |
| 8 | 2 | 2000 | Ball | 4³ = 64 | 533.3333333333334 h |
| 3 | 3 | 60 | Ball | 1³ = 1 | 277.77777777777777 h |
| 8 | 1 | 1000 | Roller | (2³)^(10/3) = 2¹⁰ = 1024 | 17,066.666666666668 h |
| 27 | 1 | 900 | Roller | (3³)^(10/3) = 3¹⁰ = 59049 | 1,093,500 h |
| 5 | 5 | 120 | Roller | 1^(10/3) = 1 | 138.88888888888889 h |

Hours = the stated million revolutions × 1,000,000 / (60 × rpm). Arithmetic-test tolerance: max(1e-9 absolute, 1e-12 × absolute expected value); this is floating-point regression tolerance, not physical accuracy. Underflow to zero, overflow and nonpositive/nonfinite required inputs are rejected. A valid numeric result still does not establish suitability, lubricant life or a service interval.

## Independent fit fixtures

| Hole limits mm | Shaft limits mm | Expected min/max µm | Classification |
| --- | --- | --- | --- |
| 20 … 20.010 | 19.980 … 19.990 | 10 … 30 | Clearance |
| 20 … 20.010 | 20.020 … 20.030 | -30 … -10 | Interference |
| 20 … 20.010 | 20.005 … 20.015 | -15 … 5 | Transition |

Minimum is smallest hole minus largest shaft; maximum is largest hole minus smallest shaft; multiply each mm difference by 1000. Same numeric tolerance as above. Input limits must be ordered, finite and positive; converted differences must remain finite.

## Approval record template

For each method record: approver/date, method version, exact publication/revision/page or stable web section, supported family/arrangement, mandatory input evidence, units, assumptions/exclusions, benchmark IDs/tolerances, boundary tests and approved product subset. Record rejection/revision reasons as well. An empty approval field never defaults to approval.

Before releasing any profile, also specify an enforceable operating envelope and how minimum-load, maximum-load, lubrication, temperature, misalignment and speed requirements will be checked. C0-C's arithmetic tests do not provide those application checks.
