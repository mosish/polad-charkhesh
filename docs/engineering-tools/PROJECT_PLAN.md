# Engineering Toolbox Expansion

**Project:** Polad Charkhesh Engineering Toolbox · توسعه جعبه‌ابزار مهندسی پولاد چرخش  
**Project ID:** ENG-TOOLS-01  
**Defined:** 2026-10-18  
**Status:** Phase 0 in progress; audit, initial benchmarks, numeric validation, explicit eligibility controls and independent manual mode are implemented and published. C3-A input contracts and unit conversion are implemented; method approval and the remaining modules are pending.
**Owner preference:** A balanced toolbox covering selection, calculations, lubrication and maintenance.  
**Baseline:** Source reviewed through `d264db29ed29e798f80147ca3a0949a8d3303f3d`. This is a source assessment, not a fresh audit of every live engineering workflow.

**Execution update:** The owner has now authorized starting the phased completion program and will nominate an engineer later. See [COMPLETE-01](../COMPLETION_PLAN.md), [foundation audit](foundation/AUDIT.md), [catalog eligibility draft](foundation/CATALOG_ELIGIBILITY.md) and [method register](methods/REGISTER.md). The plan's original baseline remains historical; the new audit starts from `4109a7a423154d853ad74f3aca862904c638312c`. Engineering sign-off remains open.

**C0-B update:** [Eligibility and validation delivery](foundation/C0B_C1A_DELIVERY.md) separates methods from illustration metadata, requires current reviewed profiles and keeps manual mode independent. The approval registry remains empty. Historical observations below describe the planning baseline; this update supersedes the old runtime behavior.

## 1. Purpose and intended users

**Publication update — 2026-10-18:** Foundation controls, C1 quality, C0-C evidence controls and C3-A input/unit tools are live on both domains at `46272c6e8a9f0c95da739b1b21539dc2e9dde60d`. Manual calculation works; the approval registry remains empty and catalog calculations require review. [Release checks and preserved owner-data evidence](C3A_INPUTS_UNITS.md).

Expand `/engineering` into a practical workspace where a visitor can choose a component, describe operating conditions, perform supported calculations, compare alternatives, and prepare a useful technical inquiry. Serve design engineers, maintenance technicians and technical purchasing staff without adding commerce features.

The main journey is: select a task, choose an exact component or manual calculation, enter conditions, review results and assumptions, compare scenarios, then save a local case or contact the company. A maintenance visitor can start with a symptom without selecting a bearing first.

Success means a user can complete a supported task and understand the inputs, result, missing information and next action. Adding more calculators without establishing applicability is not a completion criterion.

## 2. What already exists

| Existing feature | Source evidence | Expansion approach |
| --- | --- | --- |
| Product-based life and equivalent-load calculation | `components/platform/Engineering.tsx`, `lib/engineering.ts` | Preserve supported cases; review family rules, factors and speed semantics before adding calculations. |
| Basic life from known C, P and speed | Same files | Retain standalone manual mode and add a target-life capacity calculator. |
| Reliability adjustment, static safety ratio and speed warning | `lib/engineering.ts` | Make applicability and lubricant-specific speed checks explicit. Reliability-only adjustment remains distinct from full modified life. |
| Fit limits from four entered diameters | `components/platform/FitGuide.tsx`, `lib/showroom.ts` | Improve unit handling and visual explanation; tolerance-class lookup is a later evidence-dependent extension. |
| Comparison of up to three products | `components/platform/Comparison.tsx` | Add consistent operating conditions and explain differences without asserting interchangeability. |
| Five conversion choices | `components/platform/Engineering.tsx` | Add reversible, grouped engineering conversions with robust number parsing. |
| Manufacturer reference library | `components/platform/ManufacturerLibrary.tsx` | Link references to the task and relevant method. |
| Regression and restriction tests | `tests/platform.test.ts`, `tests/showroom.test.ts` | Add independently calculated benchmarks and boundary tests for each new method. |

The current calculation code uses `schematicType` to select formulas. The product picker includes non-bearing components, and product factors do not themselves prove that the exact record is verified. These are planning inputs for the initial audit, not permission to silently rewrite formulas or catalog data.

## 3. First-release scope

Deliver a useful feature in each of three areas: **select and compare**, **calculate and check**, and **maintain and troubleshoot**.

| Module | First-release behavior | Required inputs and limits |
| --- | --- | --- |
| Guided bearing selection | Filter candidates by dimensions, load direction, speed and environmental requirements; explain matches, exclusions and unknowns. | Exact identity and verified technical fields for numerical screening. Unknown values cannot pass a requirement. No automatic “best bearing” or equivalence claim. |
| Life and load workspace | Existing L10/L10h calculations, user-selected reliability, explicit equivalent-load and static-safety outputs, plus required dynamic rating for a target life. | Verified family/arrangement and applicable factors, or clearly identified manual inputs. No invented default factors. |
| Scenario comparison | Compare up to three supported products or operating cases under the same conditions; show inputs alongside results. | Versioned case inputs and compatible methods; do not compare an unsupported result as zero. |
| Fit explorer | Existing diameter-limit calculation with clearance/interference visualization and consistent mm/µm inputs. | User-supplied, validated limits. It does not recommend a shaft/housing tolerance class or calculate running clearance. |
| Unit converter | Bidirectional length, force, pressure, torque, power, temperature and rotational-speed conversions. | Explicit units, Persian/Arabic/Latin digit parsing, blank and invalid states. Distinguish mass from force and absolute temperature from temperature difference. |
| Lubrication worksheet | Collect bearing, lubricant, speed, temperature and environment; produce a completeness checklist and relevant manufacturer resources. | First release provides preparation and reference guidance. No generic grease-compatibility verdict or relubrication interval without an approved method. |
| Maintenance and symptom guide | Structured paths for heat, noise, vibration, leakage and visible damage; show possible causes, observations to collect and next inspection steps. | Context-driven guidance, not a definitive diagnosis or permission to keep machinery running. No sensor thresholds invented by the app. |
| Local case notebook | Save, rename, duplicate, reopen and delete cases on the same browser; copy a concise inquiry summary and export/import validated JSON. | No account or server-side persistence in the first release. Explicitly explain local storage and provide “clear saved cases.” No automatic transmission of application details. |

**First-release boundary:** the lubrication and maintenance modules are useful guided workflows; advanced numerical methods are released only after their data and method gates pass. The existing catalog remains browseable even when a record is ineligible for calculations.

## 4. Later releases

1. Variable duty-cycle life using an approved load/speed weighting method, with explicit treatment of stationary periods and peak-load checks.
2. Shaft/housing tolerance-class lookup and residual operating-clearance assessment after authoritative tables, units, temperature assumptions and applicability are established.
3. Viscosity/operating-temperature calculations and relubrication estimates restricted to supported lubricant and bearing cases.
4. Bearing defect frequencies only when rolling-element count, pitch diameter, contact angle and relevant geometry are verified; not inferred from external dimensions.
5. Print-ready calculation reports after method approval; company product datasheets remain a separate catalog-verification project.
6. Private server-backed case sharing only if requested later, with a separate access, retention and backup design.

Full ISO modified-life modeling, proprietary manufacturer models, advanced shaft/FEA analysis, automatic cross-brand interchange, AI photo diagnosis, live monitoring and a complete maintenance-management system are outside this first release.

## 5. Engineering and data rules

- Separate calculation eligibility from visual geometry. Introduce explicit family, arrangement, supported-method and evidence metadata; do not derive calculation support from a 3D model category alone.
- Build an eligibility matrix across the current catalog. Each method is enabled only for the records and inputs it can support. A verified subset can launch without declaring the whole catalog verified.
- Record method ID/version, source publication and revision/page, units, domain of validity, assumptions, required factors and validation examples. Manufacturer sources take precedence over supplier listings for calculation data.
- Distinguish a source-backed catalog value, a user-entered value, a missing value and a conflicting value. An old `verifiedAt` field is not sufficient evidence.
- Keep manual-input mode usable without selecting an ineligible catalog product. Manual inputs do not make a product “verified.”
- Audit current family restrictions, reliability factors, interpolation boundaries, static-load handling and reference-versus-limiting speed semantics. Any correction requires a separately reviewable formula/data change and regression evidence.
- Round display values only. Preserve full calculation precision, explicit units and locale-independent stored numbers.
- Expose necessary assumptions beside calculation results and a detailed method/reference disclosure. This does not restore the product-image captions the owner asked to remove.
- Keep SQLite authoritative for products. No silent seed import, replacement of owner data, credential changes or technical-field normalization.

## 6. UX and implementation design

Keep the existing industrial design and `/engineering` entry point. Replace the expanding flat tab row with a compact task navigation grouped into selection, calculations and maintenance. Preserve direct links from catalog/product views and a clear selected-component summary.

Each numerical tool uses a consistent layout: inputs, result, assumptions/method, and next actions. Mobile stacks these in that order. Empty, unsupported, conflicting and complete states must be distinguishable. Preserve entered work when switching compatible tools; invalidate stale results visibly when the component or method changes.

Persian remains the default on `.ir` and English on `.com`; keep the language switcher, stable product URLs and canonical/hreflang behavior. Use RTL layout with LTR engineering symbols and designation strings. Support keyboard operation, clear input labels, reduced motion and text alternatives for charts. Charts supplement the numeric results.

Proposed code structure, to confirm during implementation:

- `lib/engineering/`: pure calculations, units, eligibility and result contracts, initially wrapping the existing implementation.
- `components/platform/engineering/`: workspace shell, shared input/result components and individual tools.
- `domain/engineering.ts`: method, input, result, provenance and saved-case types.
- `docs/engineering-tools/methods/`: reviewable method specifications and benchmark evidence.
- Existing APIs provide catalog data. First-release calculations and local case storage need no new public write endpoint or database migration.

Saved cases contain a schema version, method version, product ID and technical revision/fingerprint, operating inputs and units, provenance, result status and save time. Reopening a stale case prompts recalculation; importing JSON validates types, size and supported schema. Do not encode confidential machine details in a public URL.

## 7. Phases and gates

Effort below is an initial planning estimate for one developer with access to an engineering reviewer. It excludes waiting for source documents, stakeholder review or unresolved data. Re-estimate after Phase 0; no calendar deadline is committed.

| Phase | Work and deliverable | Exit criterion | Indicative effort |
| --- | --- | --- | --- |
| 0 — Audit and scope freeze | Current-tool audit, catalog eligibility matrix, method register, approved first-release cases and prioritized backlog. | Every proposed numerical tool has a documented method owner/source and clear supported/unsupported inputs. | 2–3 development days + engineering review |
| 1 — Workspace foundation | Bilingual navigation prototype, shared inputs/results, unit parsing, eligibility and case contracts. | Keyboard/mobile journeys reviewed; existing calculations reproduced without unintended changes. | 3–5 days |
| 2 — Selection and calculations | Guided filtering, existing life/static checks, target-life capacity, scenario comparison, improved fit explorer and converter. | All method benchmarks pass; missing/conflicting fields cannot produce a passing selection result. | 6–9 days |
| 3 — Lubrication and maintenance | Lubrication worksheet and symptom/inspection workflows, reviewed bilingual content and contextual references. | Every guidance path has documented rationale and a clear next action; no unsupported numerical recommendation. | 4–6 days + content review |
| 4 — Cases and integration | Local case notebook, validated JSON exchange, inquiry summary, catalog entry points and stale-result handling. | Save/reopen/duplicate/delete and import round trips preserve inputs and correctly flag changed methods/data. | 3–4 days |
| 5 — Acceptance and release | Independent numerical checks, end-to-end bilingual/mobile review, regression checks, release notes and rollback plan. | Engineering and product acceptance criteria below pass; release decision recorded. | 3–5 days + acceptance review |

Estimated development effort: **21–32 days**, plus review and evidence lead time. These are scope estimates, not a delivery promise. Phase 3 content research can overlap Phase 2; public release waits for all first-release gates. Build new work in an isolated branch and preview. The subsequent owner request authorizes implementation; production release remains a separate gated step in COMPLETE-01.

## 8. Actionable backlog

| ID | Priority | Task | Depends on | Done when |
| --- | --- | --- | --- | --- |
| ENG-01 | P0 | Inventory existing tools and known limitations | None | Current behavior and unsupported cases are documented with source pointers. |
| ENG-02 | P0 | Define calculation eligibility and source evidence | ENG-01 | Catalog matrix distinguishes supported, incomplete and conflicting cases. |
| ENG-03 | P0 | Approve method specifications and benchmark fixtures | ENG-01 | Independent expected values and boundary conditions are recorded. |
| ENG-04 | P0 | Prototype bilingual workspace and input/result states | ENG-01 | Desktop/mobile flows and language switching reviewed. |
| ENG-05 | P1 | Build shared unit parsing and converter | ENG-04 | Bidirectional and locale tests pass without treating blanks as zero. |
| ENG-06 | P1 | Integrate life/static/speed checks and target-life calculation | ENG-02, ENG-03, ENG-04 | Approved cases pass; unsupported cases stay blocked with a useful explanation. |
| ENG-07 | P1 | Add guided selection and scenario comparison | ENG-02, ENG-06 | Same conditions are used consistently; unknown data never passes a filter. |
| ENG-08 | P1 | Improve fit-limit explorer | ENG-03, ENG-04 | Clearance, interference and transition cases are accurate and understandable. |
| ENG-09 | P1 | Build lubrication worksheet | ENG-03, ENG-04 | Required conditions and relevant references are complete for supported workflows. |
| ENG-10 | P1 | Build maintenance symptom paths | ENG-03, ENG-04 | Reviewed causes/observations/next actions exist for the five initial symptom groups. |
| ENG-11 | P1 | Add local case notebook and inquiry summary | ENG-05 through ENG-10 | Persistence, invalidation and import/export checks pass. |
| ENG-12 | P0 release | Perform engineering and bilingual acceptance | ENG-06 through ENG-11 | Evidence packet satisfies all release criteria. |
| ENG-13 | P0 release | Prepare publication and rollback | ENG-12 | Pinned source, checks, preserved catalog and server-only backup are documented. |
| ENG-14 | P2 | Scope advanced calculations | First release accepted | Each advanced method has a separate evidence and validation plan. |

P0 marks foundation or release gates; P1 is required first-release scope; P2 is deferred. Dependencies, not priority labels alone, determine execution order.

## 9. Acceptance criteria

**Engineering:** each numerical method has at least three independently derived benchmark cases plus applicable edge/invalid cases. Define tolerances per method and source precision before implementation. Test dimension/unit consistency, threshold boundaries, invalid numbers, unsupported families, missing factors and numerical overflow. Verify expected monotonic relationships where the method supports them. A static-safety number alone does not establish application suitability.

**Product behavior:** demonstrate at least these end-to-end journeys: supported bearing selection and comparison; unsupported product with clear recovery; known-load manual life calculation; target-life capacity calculation; all three fit classifications; lubrication worksheet; each initial maintenance symptom path; local case reopening after catalog/method changes. No silent product substitution or lost inputs.

**Bilingual accessibility:** test both language domains at 360px, 768px and desktop widths; no horizontal page overflow. Inputs, errors, units, assumptions and next actions are translated. Persian/Arabic digits, decimals and negatives behave consistently. Keyboard/focus behavior and charts' numeric alternatives are checked.

**Preservation:** product identities, technical values, admin behavior, inquiry handling and image presentation remain unchanged unless a separate correction is explicitly included and reviewed. Keep `.com` English and `.ir` Persian. Do not add prices, baskets, checkout or online ordering.

**Release:** type checks, relevant tests, production build, bundle budgets and smoke checks pass. Compare authoritative catalog state before/after. Verify representative flows on both published domains after release and retain a working rollback release. Keep private backups on the VPS only, honoring the owner's preference.

## 10. Ownership, dependencies and next action

The owner decides priorities and accepts the product workflow. The developer implements and verifies software behavior. A designated engineering reviewer approves methods, applicability and benchmark results; that reviewer has not yet been assigned. The content reviewer confirms Persian/English technical terminology.

Dependencies are access to exact manufacturer data, current applicable standards/method references, permission to reproduce any protected tables, and engineering review availability. Do not claim standards compliance from an unverified formula or copy restricted tables merely because they appear online.

**Phase 0 / ENG-01 through ENG-03 is in progress.** ENG-01 inventory is complete; ENG-02 has a 110-record draft matrix and implemented eligibility contracts. ENG-03 now has the [C0-C manufacturer evidence and independent benchmark packet](methods/C0C_EVIDENCE.md), including corrected spherical-thrust method selection and explicit interpolation limits. Engineering acceptance, the e-interpolation convention and enforceable operating envelopes remain open; no production profile is approved. The owner will nominate the reviewer later; budget and schedule remain open project decisions. **C3-A / ENG-05 and the numerical-input portion of ENG-04 are implemented:** shared localized parsing, eight bidirectional unit groups, preserved transient drafts and explicit blank/invalid states. 120 tests and targeted bilingual browser checks pass. [Contract and evidence](C3A_INPUTS_UNITS.md). Next: C3-B independent manual target-life worksheet and result assumptions; remaining workspace/cases and approved-product methods stay open.

## 11. Reference basis

Checked 2026-10-18. These sources inform the proposed breadth and workflow; they do not certify the site's current formulas. Exact calculation publications, revisions and pages must be established per method in Phase 0.

- [SKF — Bearing Selection Process](https://evolution.skf.com/en/bearing-selection-process/): selection includes lubrication, interfaces, clearance, mounting and maintenance as well as rating life. This supports a balanced first release.
- [NSK Engineering Tool User Manual](https://www.info.nsk.com/hubfs/OSS/manual/nsk_oss_manual_en.html): connects product selection, operating conditions, calculation details, saved conditions and technical support. The proposed notebook is local-only and does not reproduce NSK's account system or commerce workflow.
- [NSK — Fits and Internal Clearance](https://www.nskamericas.com/am-en/tools-resources/knowledge-center/bearing-abcs/fits-and-internal-clearance/): technical reference for the future fit/clearance work; first release retains entered-limit arithmetic.
- Local project references: `docs/CATALOG_VERIFICATION_BRIEF.md`, `docs/IMAGE_LABEL_REMOVAL_2026-10-18.md`, and the existing engineering source/tests listed above.
