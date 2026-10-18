# Engineering method register — review draft v0.1

Prepared 2026-10-18 for ENG-03. Developer: implementation/evidence preparation. Engineering approver: **unassigned; owner will nominate later**. None of these rows constitutes engineering release approval. Synthetic tests validate arithmetic and software boundaries, not a real bearing application.

| ID | Method / units | Current evidence and domain | Remaining gate |
| --- | --- | --- | --- |
| LIFE-BASIC-01 | L10 in million revolutions; L10h in hours; C/P in matching force units; n in rpm | Constant equivalent load/speed, ball exponent 3 or roller exponent 10/3. [NSK, Dynamic Load Ratings and Fatigue Life](https://www.nsk.com/tools-resources/abc-bearings/dynamic-load-ratings-and-fatigue-life/) checked October 18; web publication has no edition number. Six benchmarks below. | Reviewer confirms applicability and disclosure. C/P and bearing type must be established independently. |
| CAPACITY-TARGET-01 | Required C from target L10h, known P, n and exponent | Algebraic inversion of LIFE-BASIC-01; not yet implemented. | Three benchmarks plus invalid/range tests; same applicability limits. |
| LOAD-RADIAL-01 | P/P0 in kN for applicable pure radial cases | Existing deep-groove/cylindrical/needle/CARB branches. | Exact family/arrangement eligibility and static rating semantics; “cylindrical” illustration is insufficient. |
| LOAD-DGBB-01 | Deep-groove combined P/P0, e/Y via f0 Fa/C0 | Existing hardcoded interpolation table and coefficients. | Exact manufacturer table/page, clearance/load assumptions, lower-clamp rule, every boundary and invalid factor tests. No method sign-off yet. |
| LOAD-SPHERICAL-01 | Equivalent dynamic/static loads using e/Y1/Y2/Y0 | Existing spherical branch. [SKF spherical roller application discussion](https://evolution.skf.com/en/spherical-roller-bearings-in-fans/) provides a method lead, not universal application approval. | Exact product factors, static-load source, restrictions and branch benchmarks. |
| LOAD-TAPERED-01 | P/P0 with e/Y/Y0 and induced axial loads | Existing acknowledgment and factors. | Reviewed arrangement/load solution; independent cases on both sides of e; exact static/dynamic sources. |
| LOAD-THRUST-01 | Pure axial thrust ball and spherical roller thrust | Separate formulas/exponents required; current catalog 29420 routing conflicts with description. | Exact family, load cases, combined-load conditions and approved factors. Generic Y/Y0 fields are not a method definition. |
| RELIABILITY-01 | a1 × basic life for 90/95/98/99% | Existing factors 1/.64/.37/.25. SKF Rolling bearings, publication 17000/1 EN, printed p.90 table 3 is an indexed source lead. Direct PDF retrieval failed in this session. | Retrieve/confirm edition/page and benchmark multipliers; do not call this full modified life. |
| STATIC-SAFETY-01 | s0 = C0/P0, dimensionless | Arithmetic ratio only; no automatic required minimum. | Approved P0 method and application-specific acceptance criteria. |
| SPEED-CHECK-01 | rpm comparison | Current code conflates unknown limits and a passing boolean. | Separate reference/limiting/lubricant-specific values and unknown state. Thermal reference speed is not automatically a limit. |
| FIT-LIMITS-01 | Worst-case diameter differences in µm from mm inputs | Dimensional subtraction; three synthetic cases below. Equality is currently classified as clearance if min=0, interference if max=0 and min<0. | Review boundary wording and input precision; not tolerance selection or operating clearance. |
| UNITS-01 | Unit conversions | Existing mm/in, kN/N, °C/°F and rpm/rad/s arithmetic. | Exact definitions, locale/blank/invalid handling, reverse conversions and temperature-difference distinction. |
| GUIDANCE-01 | Lubrication/maintenance preparation | Non-numerical first-release workflows only. | Reviewed sources and bilingual paths; no unsupported intervals, grease compatibility or definitive diagnosis. |

SKF reference lead: [Rolling bearings 17000/1 EN](https://www.skf.com/binaries/pub12/Images/0901d196802809de-Rolling-bearings---17000_1-EN_tcm_12-121486.pdf). Search-index visibility does not replace retrieving and reviewing the relevant pages. Full proprietary/standards tables are not reproduced here.

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
