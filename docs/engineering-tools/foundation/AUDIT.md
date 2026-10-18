# Engineering foundation audit — C0-A

Date: 2026-10-18. Source baseline: `4109a7a423154d853ad74f3aca862904c638312c`. Public catalog snapshot: the saved October 18 `/api/products` response used for the README review. Its SHA-256 and per-record evidence are in [CATALOG_ELIGIBILITY.json](CATALOG_ELIGIBILITY.json). This is an offline audit, not a new production acceptance test.

## Inventory and findings

| Area / source | Observed behavior | Required follow-up |
| --- | --- | --- |
| `lib/engineering.ts:calculate` | Chooses equivalent-load formulas and life exponent using `schematicType`. Category check excludes housing, seal and lubricant. | C0-B: use explicit reviewed calculation family/arrangement, independent of geometry. Presence of factors is not evidence of their applicability. |
| Current catalog mappings | 11 explicit family/arrangement review flags: angular-contact, self-aligning, spherical roller thrust, needle, CARB and cam-follower records. | Review each flag in the matrix. Seven are possible formula/exponent-routing conflicts; four need explicit specialized metadata/applicability review. Do not infer approved corrections from the flags alone. |
| Product life numeric validation | Infinite static rating can produce infinite safety; invalid required factors can survive undefined-only checks; life underflow can become zero. | Fixed in C0-A: positive finite ratings/factors and positive finite computed P/P0/life/safety. Normal formula coefficients unchanged. |
| `basicLife` | Manual C/P/n method is independent in the library; overflow was checked, underflow was not. | Underflow now rejected. Keep explicit same-unit inputs and confirmed equivalent load. |
| Product selection in `Engineering.tsx` | Lists all components; a missing requested product silently falls back to the first product; manual inputs can default to unverified selected-product C and family. Entire tool area requires a product. | C0-B/ENG-04: explicit missing-selection state, independent manual mode and clear input provenance. |
| Deep-groove combined load | Uses f0, fixed interpolation nodes, lower-end clamp and upper-end rejection. | ENG-03: exact source/table, clearance/arrangement conditions and boundary benchmarks required. Do not extend to angular contact because the visual type matches. |
| Tapered branch | Checkbox confirms arrangement/induced loads; factors required. | Acknowledgment is not verification of the arrangement; exact manufacturer applicability remains open. |
| Spherical thrust branch | Generic Y/Y0 fields, fixed radial/axial threshold. No live record currently routes here; 29420 routes to generic thrust. | Review load-case semantics and exact method before use. No correction guessed in this package. |
| Speed result | Prefers limiting speed; otherwise compares against the minimum positive grease/oil speed. Missing all speeds yields infinity and `overspeed=false`. | Introduce unknown/not-checked/within/exceeded states with lubricant and source scope. Current warning wording can misdescribe a limiting-speed comparison. |
| Reliability | Four a1 values; adjusted hours explicitly described as not full modified life. | Preserve distinction; verify table edition and benchmarks before engineering approval. |
| `FitGuide` / `fitRange` | Four entered diameter limits, mm to µm; no tolerance-class lookup. Finite inputs could still overflow the output conversion. | Output overflow fixed. Blank/locale parsing and boundary classification disclosure belong to ENG-04/08. |
| Converter | Five one-way choices; blank input becomes zero via unary `+`; locale parsing absent. | ENG-05: shared parser, empty/invalid state, bidirectional unit groups. |
| Comparison | Up to three product specifications, not a consistent-condition calculation scenario engine. | ENG-07: compatible methods, common conditions, explicit unknown results. |
| Language/accessibility | Most labels bilingual, calculation exception messages English; numeric controls do not establish Persian/Arabic digit handling. | Shared error codes/translations and locale parser; keyboard/mobile acceptance before release. |
| Saved cases, maintenance and lubrication | First-release expansion modules not implemented. | Follow ENG-09–ENG-11 scope; do not invent intervals, diagnostic certainty or operating clearance. |

## Eligibility interpretation

The report covers 110 records: 94 bearing candidates await engineering review and 16 non-bearing components are outside this life method. The technical ledger remains 61 partial / 47 ambiguous / two blocked. No row has engineering release approval.

The report matches accepted field values to the snapshot; it does not upgrade a row merely because it has a URL, `verifiedAt`, positive rating, image or a successful calculation. Missing factors describe current combined-load branches, not all possible manual calculations. The owner-resolution queue includes all 47 ambiguous identities. Evidence for eleven mapping flags ranges from current product descriptions/designations to existing research; exact correction approval is still required.

For NTN 5206S, the manufacturer's [product search result](https://eshop.ntn-snr.com/en/product/5206S-NTN/5206S) identifies double-row angular contact. Direct page retrieval currently requires JavaScript. Existing local technical research also identifies this family. No new rating was copied from the search result. The current product remains unchanged in SQLite.

## Reproduction

Save only the public product response in an ignored working folder, then run:

```powershell
npx tsx scripts/audit-engineering-foundation.ts work/readme-review/products.json docs/engineering-tools/foundation
npx tsx --test tests/engineering-foundation.test.ts tests/showroom.test.ts
npm run typecheck
npm test
npm run build
npm run check:bundles
```

The audit script does not connect to SQLite, request credentials, change a product, or access the network. It writes selected public identity/evidence fields, not the complete response. Rerunning with the same input produces the same matrix. Changes to the public catalog require a fresh input and a reviewed diff; no silent regeneration against the bundled seed.

## Validation and limits

- Six independently derived basic-life cases and three fit cases are recorded in the [method register](../methods/REGISTER.md).
- The three numeric-defect test groups failed before the fix. Afterward all 75 project tests passed. Sandbox loopback requests initially failed with `EACCES`; rerunning with local network access resolved those environment failures.
- Typecheck, production build, bundle budgets, isolated production smoke and targeted lint passed. Repository lint remains a separate 197-error backlog.
- No live deployment, catalog change, new engineering-method approval, full browser acceptance or server operation occurred. Existing runtime family/speed/selection problems above remain open and must not be described as fixed by numeric guards.

ENG-01 inventory is complete. ENG-02's draft evidence matrix is prepared. ENG-03 has initial benchmark evidence, but additional family methods and engineering sign-off remain open. C0 is therefore **in progress**, not complete.
