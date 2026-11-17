# Manual engineering workbench — 17 November 2026

Implements the owner's six improvements and two researched extra tools. Developer evidence is not engineering acceptance, ISO compliance or catalog approval. The existing empty product-approval registry, technical ratings, IDs, administrator data and domain languages are preserved. Production publication is a separate release decision.

## Delivered behavior

1. Explicit units, method references, assumptions and invalid/range states. Basic statistical fatigue life is distinguished from real service life, modified life, static acceptance and maintenance intervals. The existing basic-life display also preserves small nonzero values.
2. Inverse target-life capacity from known equivalent load, speed, hours and explicitly chosen ball/roller type.
3. Up to eight manual scenarios, duplicate/remove, numeric comparison and table-backed relative bar chart. First-row sensitivity scales equivalent load by 0.8/1/1.2 while holding C and speed fixed. It does not solve a new radial/axial arrangement or infer product interchangeability.
4. Entered-limit fit explorer with same-scale hole/shaft diagram and numerical min/max clearance in micrometres. No ISO tolerance-class database, thermal/deformation model or operating-clearance recommendation is invented.
5. Local cases: create/open/update/duplicate/delete and validated JSON exchange. Limits: 20 cases, eight rows each, 250000-character envelope, bounded strings, strict allowed keys and types. Import accepts inputs only. Changed methods, missing/archived products or altered technical revisions require explicit review/recalculation. Concurrent-tab changes cannot silently overwrite saved cases. Storage failure retains the current worksheet and JSON export. Each domain/browser has separate storage; nothing is automatically uploaded.
6. Five symptom paths (heat, noise, vibration, shaft movement, premature damage), with onset/contamination questions and machine-procedure escalation for urgent signs. These are observation checklists, not diagnoses. A lubrication worksheet collects lubricant identity, speed, measured temperature, access, contamination and documented service instructions. It flags missing/nonnumeric/impossible observations without prescribing a grease, quantity or interval.

Additional tools: rotating variable-duty basic fatigue life and mechanical shaft power/torque/speed. These are independent of unverified catalog entries.

## Primary-source research

Checked 17 November 2026. No restricted tables or complete publications are redistributed.

- [SKF Rolling bearings, PUB BU/P1 17000/1 EN](https://cdn.skfmediahub.skf.com/api/public/0901d196802809de/pdf_preview_medium/0901d196802809de_pdf_preview_medium.pdf): the existing [C0-C packet](methods/C0C_EVIDENCE.md) records edition and basic-life evidence. The large PDF remains beyond the web reader's limit. Target capacity is an algebraic inverse of the already benchmarked life equation, not a new manufacturer selection rule.
- [SKF Super-precision bearings, 2016](https://cdn.skfmediahub.skf.com/api/public/0901d19680495562/pdf_preview_medium/0901d19680495562_pdf_preview_medium.pdf), printed p.35 / PDF p.37: variable-condition life uses fractions of revolutions. The implemented time-fraction form is derived below, restricted to repeated rotating stages with known load, speed and unchanged C/exponent. Hybrid/modified-life factors are not borrowed from this catalog.
- [OpenStax, University Physics vol.1 §10.8, equation 10.31](https://openstax.org/books/university-physics-volume-1/pages/10-8-work-and-power-for-rotational-motion): shaft mechanical power equals torque times angular speed. Exact SI conversion is used, rather than a rounded 9550 constant. The official SEW drive-planning search result corroborated the rounded relation, but direct PDF retrieval redirected to its document portal; that file is not claimed as downloaded/inspected.
- [SKF Bearing Installation and Maintenance Guide](https://cdn.skfmediahub.skf.com/api/public/0901d1968024f02a/pdf_preview_medium/0901d1968024f02a_pdf_preview_medium.pdf), troubleshooting section, and [NSK Operation Inspection](https://www.nsk.com/am-en/tools-resources/bearings/maintenance/operation-inspection/): reference basis for original concise symptom/condition checklists. They do not establish a fault diagnosis or permission to keep operating.

A generic numerical grease-quantity shortcut was considered but excluded: exact bearing/seal, relubrication access, lubricant compatibility and machine instructions change applicability. Manufacturer-specific modified life and tolerance lookup likewise require separately reviewed methods/data.

## Method definitions and independent checks

Version `manual-workbench/1`; kN, rpm, hours; p=3 for ball and p=10/3 for roller. Positive finite inputs are mandatory for numerical worksheets; positive ordered fit bounds are required. Lubrication temperatures may be subzero but must exceed absolute zero. Blanks and invalid strings never become zero.

**Target:** C=P(60nh/10^6)^(1/p). With P=10,n=1000: target 10^6 rev -> C=10; 8×10^6 rev, ball -> C=20; 1024×10^6 rev, roller -> C=80. Load/speed/life monotonicity and inverse round trip are checked.

**Duty:** Lhi=10^6/(60ni)(C/Pi)^p; 1/Lh=Σ(fi/Lhi); nmean=Σ(fi ni); Peq^p=Σ(fi ni Pi^p)/nmean. Revolution fractions are Ui=fi ni/nmean. Positive time shares total 100% within 10^-6 percentage points and are then normalized. No dwell/static, reversal, shock transient or changing lubrication model is inferred.

Independent ball benchmarks with C=10: constant P=1,n=1000 -> 16666.6666667 h; equal-time P=1/2 at n=1000 -> 3703.7037037 h, Peq=1.65096362445 kN; equal-time n=1000/2000 at P=1 -> 11111.1111111 h; equal-time (P,n)=(1,1000)/(2,2000) -> 1960.78431373 h and second-stage fatigue fraction 16/17. Roller C/P=8 yields 1024 million rev independently.

**Power:** P[kW]=T[Nm]·2π·n[rpm]/60000. T=10,n=60 -> P=0.0628318530718 kW; P=1,n=60 -> T=159.154943092 Nm; P=2π kW,T=1000 Nm -> n=60 rpm. All solve directions are tested. Electrical input, efficiency, starting torque, shaft stress and motor sizing are outside scope.

**Fits:** min=holeMin−shaftMax; max=holeMax−shaftMin, mm→µm. All three classifications, tiny nonzero differences and reversed bounds are tested. Diagram ranges are schematic and have numerical alternatives.

Regression tolerance: max(10^-10 absolute,10^-12 relative), not a physical-accuracy promise. Overflow/underflow, invalid families and out-of-range scenario ratios are rejected. Sensitivity overflow cannot crash the base result. Cases test strict parsing, hostile keys, versions and technical-data changes.

## Speed and release boundaries

The workbench and CSS are lazy chunks; no new network request is made when typing. Calculations are memoized separately from notes/case naming and capped at eight rows. Existing animation, reduced-motion behavior, catalog and administrator workflows are preserved. There is no new charting dependency, server write endpoint or database migration.

Local verification and screenshots are recorded in the task's `outputs/engineering-workbench-report.fa.md`. Engineering reviewer acceptance and approval of catalog subsets remain open. Source synchronization does not deploy this package; production needs its own reviewable backup/rollback and owner approval.
