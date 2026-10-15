# Manufacturer catalog review — 2026-10-15

**NOT READY for catalog verification sign-off, deployment or company datasheet production.**

All 110 public IDs/slugs are covered. 61 records have source-backed corrections in the review patch (412 fields, excluding source metadata). No live catalog changes were made.

| Review result | Records |
|---|---:|
| Fully verified | 0 |
| Partial | 61 |
| Ambiguous identity | 47 |
| Blocked exact technical evidence | 2 |
| Missing verified exact media (overlaps all statuses) | 110 |
| Media replacements | 0 |

A partial record is not fully verified: unsupported baseline values remain visible in the ledger. Counted implementation means prepared and validated in the isolated import dataset, not saved to the public website. All existing identities, source text not targeted by a correction, and reference media are preserved.

## Blocking decisions

The 43 original multibrand records require the owner to specify each actual manufacturer, complete suffix and supplied assembly. Group aliases (FAG/Schaeffler, INA/Schaeffler, KOYO/JTEKT and Corteco/Freudenberg) are not automatically treated as competing manufacturers. Timken cone/cup pairs are valid component pairs. Specific Corteco part-number/dimension conflicts, INA NK25/20 versus XL, NSK matched-pair scope, inaccessible exact sources and media rights/identity remain open.

## Import and reproducibility

`pnpm exec tsx scripts/build-catalog-review.ts` rebuilds the ledger, patch and report from the committed public baseline and record research. It never reads a live database. `review.patch.json` can be selected in the application Admin catalog JSON import after integration of this branch. Preview shows changes, and saving requires the existing review checkbox/confirmation. Both baseline field guards and preview revision checks must pass.

Apply the patch only after reviewing each source-backed change. It cannot create products, rename codes, change manufacturers or alter IDs/slugs. Unrelated owner edits are merged from current records. Conflicts stop the entire batch. For changed specifications, re-review the affected record; never strip the guards or replace the live database with the scratch merged preview.

Evidence sources include older official catalog editions as well as current product pages. Access date is not publication date; unknown revisions stay unknown. Catalog d/D/B, overall tapered width T, housing height, minimum bearing chamfer and maximum installation fillet are different concepts. SKF reference/limiting speeds and Timken/NSK thermal speeds retain their source meanings. Existing zero placeholders are not newly certified zero ratings.

Clearance arrays are normalized only where the exact designation is established: the public product page labels this field as Clearance. This describes the reviewed SKU and does not certify owner stock or offered alternate suffixes. Alternative clearances require explicit designation records. NTN5206S calculation factors remain withheld because its current deep-groove schematic conflicts with its double-row angular-contact identity; calculator and geometry reconciliation is still required.

Full manufacturer PDFs/HTML and temporary renders remain local in ignored work directories; links, hashes where available, table/page locators and factual field observations are the review assets. No source archive, credentials, private database, backup or owner upload was copied from the original workspace.

## Product coverage

| ID / designation | Status | Changed fields | Primary research |
|---|---|---|---|
| pc-6204-2rs / 6204-2RSH / 2RS1 | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-6308-2z / 6308-2Z / ZZ C3 | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-6005-open / 6005 Open / C3 | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-6206-c3 / 6206-2RS1 C3 | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-6310-2z / 6310-2Z / C3 | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-30206 / 30206 J2/Q | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-30208 / 30208 J2/Q | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-32210 / 32210 J2/Q | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-32014-x / 32014 X / Q | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-22212-ek / 22212 EK / C3 + H312 | ambiguous_identity | None; held | [Evidence](research/ambiguous-spherical.json) |
| pc-22316-cc-w33 / 22316 CC/W33 / C3 | ambiguous_identity | None; held | [Evidence](research/ambiguous-spherical.json) |
| pc-22220-ek / 22220 EK / C3 | ambiguous_identity | None; held | [Evidence](research/ambiguous-spherical.json) |
| pc-nu-208-ecp / NU 208 ECP / C3 | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-nj-212-ecp / NJ 212 ECP | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-nup-310-ecp / NUP 310 ECP / C3 | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-51106 / 51106 Single Direction | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-51108 / 51108 Single Direction | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-51210 / 51210 High Capacity | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-ucp-205 / UCP 205 (Cast Iron Pillow Block) | ambiguous_identity | None; held | [Evidence](research/ambiguous-components.json) |
| pc-ucf-208 / UCF 208 (4-Bolt Flange Housing) | ambiguous_identity | None; held | [Evidence](research/ambiguous-components.json) |
| pc-snl-511-609 / SNL 511-609 (Split Plummer Block) | ambiguous_identity | None; held | [Evidence](research/ambiguous-components.json) |
| pc-tc-35-52-10 / TC 35-52-10 NBR (Dual Lip) | ambiguous_identity | None; held | [Evidence](research/ambiguous-components.json) |
| pc-tc-50-72-8-viton / TC 50-72-8 Viton / FKM High-Temp | ambiguous_identity | None; held | [Evidence](research/ambiguous-components.json) |
| pc-tc-75-100-12 / TC 75-100-12 NBR Heavy Duty | ambiguous_identity | None; held | [Evidence](research/ambiguous-components.json) |
| pc-skf-lgmt-2 / SKF LGMT 2 / 1kg | ambiguous_identity | None; held | [Evidence](research/ambiguous-components.json) |
| pc-22324-ccja-w33va405 / 22324 CCJA/W33VA405 (Vibrating Screen Special) | ambiguous_identity | None; held | [Evidence](research/ambiguous-spherical.json) |
| pc-32218-j2-q / 32218 J2/Q (Heavy Steel Mill & Axle) | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-29420-e / 29420 E (Spherical Roller Thrust Bearing) | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-nu-2224-ecp / NU 2224 ECP / C3 (Heavy Refinery Pump) | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-6210-2z-va208 / 6210-2Z/VA208 (High-Temp 350°C Kiln Bearing) | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-fkm-tc-80-100-12 / TC 80-100-12 Viton / FKM Petrochemical | ambiguous_identity | None; held | [Evidence](research/ambiguous-components.json) |
| pc-snl-518-615 / SNL 518-615 (Heavy Mining Split Housing) | ambiguous_identity | None; held | [Evidence](research/ambiguous-components.json) |
| pc-mobilith-shc-220 / Mobilith SHC 220 Synthetic | ambiguous_identity | None; held | [Evidence](research/ambiguous-components.json) |
| pc-7312-becbm / 7312 BECBM (40° Brass Cage) | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-7210-becbp / 7210 BECBP / P6 | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-3308-a-2z / 3308 A-2Z/C3 (Double Row) | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-1309-ektn9 / 1309 EKTN9 (Self-Aligning Tapered Bore) | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-na-4910 / NA 4910 (Machined Needle Roller) | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-23228-cc-w33 / 23228 CC/W33 (Heavy Mining SAG Mill) | ambiguous_identity | None; held | [Evidence](research/ambiguous-spherical.json) |
| pc-32314-j2-q / 32314 J2/Q (Heavy Crusher & Crane Wheel) | ambiguous_identity | None; held | [Evidence](research/ambiguous-bearings.json) |
| pc-ucp-210 / UCP 210 (50mm Heavy Duty Pillow Block) | ambiguous_identity | None; held | [Evidence](research/ambiguous-components.json) |
| pc-tc-100-125-13-viton / TC 100-125-13 Viton / FKM Heavy Refractory | ambiguous_identity | None; held | [Evidence](research/ambiguous-components.json) |
| pc-tc-60-85-10 / TC 60-85-10 NBR (Dual Lip) | ambiguous_identity | None; held | [Evidence](research/ambiguous-components.json) |
| pc-skf-6311-c3 / SKF 6311 / C3 Explorer | partial | weightKg, clearanceOptions, rMin, calculationFactorF0 | [Evidence](research/timken-skf.json) |
| pc-skf-c-2215-k / SKF C 2215 K CARB® Toroidal | partial | crKn, corKn, clearanceOptions, descriptionFa | [Evidence](research/timken-skf.json) |
| pc-skf-sy-50-tf / SKF SY 50 TF (Y-Bearing Unit) | partial | weightKg, sealingEn, sealingFa, descriptionEn, descriptionFa | [Evidence](research/timken-skf.json) |
| pc-fag-6312-tb-p6 / FAG 6312-TB-P6 Schaeffler | partial | cageMaterialEn, cageMaterialFa, clearanceOptions | [Evidence](research/schaeffler-corteco.json) |
| pc-fag-22216-e1-xl-k / FAG 22216-E1-XL-K X-Life | partial | cageMaterialEn, cageMaterialFa | [Evidence](research/schaeffler-corteco.json) |
| pc-fag-nj-2312-e-m1a / FAG NJ2312-E-XL-M1A Cylindrical | partial | cageMaterialEn, cageMaterialFa, descriptionEn, descriptionFa | [Evidence](research/schaeffler-corteco.json) |
| pc-ina-nk-25-20 / INA NK 25/20 Heavy Needle Roller | ambiguous_identity | None; held | [Evidence](research/schaeffler-corteco.json) |
| pc-ina-kr-35-pp / INA KR 35 PP Cam Follower | blocked_evidence | None; held | [Evidence](research/schaeffler-corteco.json) |
| pc-timken-lm11749-10 / TIMKEN LM11749 / LM11710 (SET1) | partial | d, weightKg, crKn, corKn, calculationFactorE, calculationFactorY | [Evidence](research/timken-skf.json) |
| pc-timken-lm67048-10 / TIMKEN LM67048 / LM67010 (SET6) | partial | weightKg, crKn, corKn, calculationFactorE, calculationFactorY | [Evidence](research/timken-skf.json) |
| pc-timken-22220-emw33c3 / TIMKEN 22220EMW33C3 Solid Brass | partial | weightKg, corKn, calculationFactorY0, clearanceOptions | [Evidence](research/timken-skf.json) |
| pc-nsk-6206-ddu-cm / NSK 6206 DDU CM Japan | partial | crKn, weightKg, speedGreaseRpm, cageMaterialEn, cageMaterialFa, sealingEn, sealingFa, clearanceOptions | [Evidence](research/japanese.json) |
| pc-nsk-7010-ctyndblp4 / NSK 7010 CTYNDBLP4 Super Precision | ambiguous_identity | None; held | [Evidence](research/japanese.json) |
| pc-nsk-nu-2214-et / NSK NU 2214 ET Cylindrical | partial | crKn, corKn, weightKg, speedGreaseRpm, speedOilRpm, thermalSpeedRatingRpm, cageMaterialEn, cageMaterialFa, clearanceOptions | [Evidence](research/japanese.json) |
| pc-ntn-6204-llu-c3 / NTN 6204 LLU / C3 Japan | partial | crKn, speedGreaseRpm, calculationFactorF0, cageMaterialEn, cageMaterialFa, sealingEn, sealingFa | [Evidence](research/japanese.json) |
| pc-ntn-22214-eakd1 / NTN 22214 EAKD1 ULTAGE® | partial | crKn, corKn, weightKg, speedGreaseRpm, speedOilRpm, calculationFactorE, calculationFactorY1, calculationFactorY2, calculationFactorY0 | [Evidence](research/japanese.json) |
| pc-ntn-5206-s / NTN 5206 S Double Row | partial | rMin, crKn, corKn, speedGreaseRpm, speedOilRpm | [Evidence](research/japanese.json) |
| pc-koyo-6207-2rs / KOYO 6207-2RS (JTEKT Japan) | partial | crKn, corKn, weightKg, speedGreaseRpm, calculationFactorF0, sealingEn, sealingFa | [Evidence](research/japanese.json) |
| pc-koyo-30212-jr / KOYO 30212 JR Tapered Roller | partial | rMin, crKn, corKn, weightKg, speedGreaseRpm, speedOilRpm, calculationFactorY, calculationFactorY0 | [Evidence](research/japanese.json) |
| pc-koyo-22218-rhr / KOYO 22218 RHR Spherical Roller | blocked_evidence | None; held | [Evidence](research/japanese.json) |
| pc-nachi-6008-2nse9 / NACHI 6008-2NSE9 Quest® Japan | partial | speedGreaseRpm, cageMaterialEn, cageMaterialFa, sealingEn, sealingFa, descriptionFa | [Evidence](research/japanese.json) |
| pc-nachi-22222-ex / NACHI 22222 EX Quest Spherical | partial | crKn, corKn, weightKg, speedOilRpm, calculationFactorE, calculationFactorY1, calculationFactorY2, calculationFactorY0, cageMaterialEn, cageMaterialFa | [Evidence](research/japanese.json) |
| pc-nachi-nup-310-eg / NACHI NUP 310 EG Cylindrical | partial | crKn, corKn, cageMaterialEn, cageMaterialFa | [Evidence](research/japanese.json) |
| pc-corteco-12011153b / CORTECO 12011153B Simmerring® TC 35x52x7 | ambiguous_identity | None; held | [Evidence](research/schaeffler-corteco.json) |
| pc-corteco-12012014b / CORTECO 12012014B Viton® TC 50x72x8 | ambiguous_identity | None; held | [Evidence](research/schaeffler-corteco.json) |
| skf-6002-2z / 6002-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6002-2rsl / 6002-2RSL | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6002-2rsh / 6002-2RSH | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6202-2z / 6202-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6202-2rsl / 6202-2RSL | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6202-2rsh / 6202-2RSH | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6302-2z / 6302-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6302-2rsl / 6302-2RSL | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6302-2rsh / 6302-2RSH | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6003-2z / 6003-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6003-2rsl / 6003-2RSL | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6003-2rsh / 6003-2RSH | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6203-2z / 6203-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6203-2rsl / 6203-2RSL | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6203-2rsh / 6203-2RSH | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6303-2z / 6303-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6303-2rsl / 6303-2RSL | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6303-2rsh / 6303-2RSH | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6004-2z / 6004-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6004-2rsl / 6004-2RSL | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6004-2rsh / 6004-2RSH | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6304-2z / 6304-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6304-2rsl / 6304-2RSL | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6304-2rsh / 6304-2RSH | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6005-2z / 6005-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6005-2rsl / 6005-2RSL | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6005-2rsh / 6005-2RSH | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6205-2z / 6205-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6205-2rsl / 6205-2RSL | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6205-2rsh / 6205-2RSH | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6305-2z / 6305-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6305-2rz / 6305-2RZ | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa, descriptionEn, descriptionFa | [Evidence](research/skf-sealed.json) |
| skf-6305-2rs1 / 6305-2RS1 | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6006-2z / 6006-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6006-2rz / 6006-2RZ | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa, descriptionEn, descriptionFa | [Evidence](research/skf-sealed.json) |
| skf-6006-2rs1 / 6006-2RS1 | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6206-2z / 6206-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6206-2rz / 6206-2RZ | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa, descriptionEn, descriptionFa | [Evidence](research/skf-sealed.json) |
| skf-6206-2rs1 / 6206-2RS1 | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |
| skf-6306-2z / 6306-2Z | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, descriptionEn | [Evidence](research/skf-sealed.json) |
| skf-6306-2rz / 6306-2RZ | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa, descriptionEn, descriptionFa | [Evidence](research/skf-sealed.json) |
| skf-6306-2rs1 / 6306-2RS1 | partial | rMin, calculationFactorF0, cageMaterialEn, cageMaterialFa, clearanceOptions, sealingEn, sealingFa | [Evidence](research/skf-sealed.json) |

## Before / after (implemented technical and bilingual copy changes)

| Product | Field | Before | Proposed | Evidence |
|---|---|---|---|---|
| pc-skf-6311-c3 | weightKg | 1.35 | 1.337 | pc-skf-6311-c3#weightKg |
| pc-skf-6311-c3 | clearanceOptions | ["C3","CN","C4"] | ["C3"] | pc-skf-6311-c3#clearanceOptions |
| pc-skf-6311-c3 | rMin | 2.1 | 2 | pc-skf-6311-c3#rMin |
| pc-skf-6311-c3 | calculationFactorF0 | 13.1 | 13 | pc-skf-6311-c3#calculationFactorF0 |
| pc-skf-c-2215-k | crKn | 198 | 196 | pc-skf-c-2215-k#crKn |
| pc-skf-c-2215-k | corKn | 240 | 208 | pc-skf-c-2215-k#corKn |
| pc-skf-c-2215-k | clearanceOptions | ["C3 (C08)","CN"] | ["CN"] | pc-skf-c-2215-k#clearanceOptions |
| pc-skf-c-2215-k | descriptionFa | "تکنولوژی انحصاری CARB سوئد ترکیب‌کننده ویژگی‌های خودتنظیمی رولبرینگ بشکه‌ای و جابجایی محوری نامحدود رولبرینگ استوانه‌ای در یک قطعه." | "رولبرینگ توریدال CARB شرکت SKF با قابلیت خودتنظیمی و جابجایی محوری داخلی؛ مقدار مجاز جابجایی به لقی داخلی و ناهمراستایی بستگی دارد." | pc-skf-c-2215-k#descriptionFa |
| pc-skf-sy-50-tf | weightKg | 2.85 | 2.7 | pc-skf-sy-50-tf#weightKg |
| pc-skf-sy-50-tf | sealingEn | "Multi-stage contact seal with galvanized slinger" | "Contact seals with additional plain sheet-steel flingers on both sides (2F)" | pc-skf-sy-50-tf#sealingEn |
| pc-skf-sy-50-tf | sealingFa | "آب‌بند تماسی دوگانه با حلقه فولادی محافظ فلینگر" | "آب‌بند تماسی به‌همراه فلینگر ساده ورق فولادی در دو طرف (2F)" | pc-skf-sy-50-tf#sealingFa |
| pc-skf-sy-50-tf | descriptionEn | "Complete SKF ball bearing unit with cast iron housing and insert bearing with grub screws and multi-stage labyrinth seals." | "SKF plummer block unit with a cast iron SY 510 M housing and YAR 210-2F insert bearing, grub-screw locking, contact seals and additional plain flingers." | pc-skf-sy-50-tf#descriptionEn |
| pc-skf-sy-50-tf | descriptionFa | "واحد یاتاقان کامل ساخت شرکت SKF شامل پوسته چدن خاکستری صلب و بلبرینگ YAR 210-2F با قفل‌شو پیچ آلن و آب‌بندی مطمئن ۵ لبه." | "واحد یاتاقان پایه‌دار SKF شامل پوسته چدنی SY 510 M و بلبرینگ YAR 210-2F با تثبیت پیچ مغزی، آب‌بند تماسی و فلینگر ساده اضافی." | pc-skf-sy-50-tf#descriptionFa |
| pc-fag-6312-tb-p6 | cageMaterialEn | "Laminated textile phenolic resin cage (TB)" | "Machined textile-laminated phenolic cage, inner-ring guided (TB)" | pc-fag-6312-tb-p6#cageMaterialEn |
| pc-fag-6312-tb-p6 | cageMaterialFa | "رزین فنولیک الیاف‌دار تکستولیت سبک (TB)" | "قفسه رزین فنولیک لایه‌ای تقویت‌شده با پارچه، ماشین‌کاری‌شده و هدایت‌شونده با رینگ داخلی (TB)" | pc-fag-6312-tb-p6#cageMaterialFa |
| pc-fag-6312-tb-p6 | clearanceOptions | ["P6","C3","CN"] | ["C3","CN"] | pc-fag-6312-tb-p6#clearanceOptions |
| pc-fag-22216-e1-xl-k | cageMaterialEn | "Window-type sheet steel cage" | "Two-piece sheet steel cage guided on the outer ring (E1)" | pc-fag-22216-e1-xl-k#cageMaterialEn |
| pc-fag-22216-e1-xl-k | cageMaterialFa | "ورق فولادی دو تکه بهبودیافته با پوشش فسفاته" | "قفسه ورق فولادی دو تکه، هدایت‌شونده با رینگ بیرونی (E1)" | pc-fag-22216-e1-xl-k#cageMaterialFa |
| pc-fag-nj-2312-e-m1a | cageMaterialEn | "Machined solid brass cage (M1A)" | "Two-piece machined brass cage, rib-guided on the outer ring (M1A)" | pc-fag-nj-2312-e-m1a#cageMaterialEn |
| pc-fag-nj-2312-e-m1a | cageMaterialFa | "برنج آلیاژی یکپارچه ماشین‌کاری شده (M1A)" | "قفسه برنجی ماشین‌کاری‌شده دو تکه، هدایت‌شونده توسط لبه رینگ بیرونی (M1A)" | pc-fag-nj-2312-e-m1a#cageMaterialFa |
| pc-fag-nj-2312-e-m1a | descriptionEn | "Single row cylindrical roller bearing with one-piece machined brass cage guided on inner ring, providing high radial load carrying capacity." | "Single row cylindrical roller bearing with a two-piece machined brass cage, rib-guided on the outer ring (M1A)." | pc-fag-nj-2312-e-m1a#descriptionEn |
| pc-fag-nj-2312-e-m1a | descriptionFa | "رولبرینگ استوانه‌ای یک‌طرف تثبیت‌کننده با قفسه برنجی ماشین‌کاری شده یکپارچه، مناسب برای مقاومت در برابر تکانه‌های ضربه‌ای شدید در گیبرکس‌های سنگین." | "رولبرینگ استوانه‌ای تک‌ردیفه با قفسه برنجی ماشین‌کاری‌شده دو تکه، هدایت‌شونده توسط لبه رینگ بیرونی (M1A)." | pc-fag-nj-2312-e-m1a#descriptionFa |
| pc-timken-lm11749-10 | d | 17.462 | 17.463 | pc-timken-lm11749-10#d |
| pc-timken-lm11749-10 | weightKg | 0.086 | 0.1 | pc-timken-lm11749-10#weightKg |
| pc-timken-lm11749-10 | crKn | 24.8 | 29.4 | pc-timken-lm11749-10#crKn |
| pc-timken-lm11749-10 | corKn | 23.3 | 23.4 | pc-timken-lm11749-10#corKn |
| pc-timken-lm11749-10 | calculationFactorE | 0.33 | 0.29 | pc-timken-lm11749-10#calculationFactorE |
| pc-timken-lm11749-10 | calculationFactorY | 1.82 | 2.1 | pc-timken-lm11749-10#calculationFactorY |
| pc-timken-lm67048-10 | weightKg | 0.18 | 0.2 | pc-timken-lm67048-10#weightKg |
| pc-timken-lm67048-10 | crKn | 41.5 | 46.7 | pc-timken-lm67048-10#crKn |
| pc-timken-lm67048-10 | corKn | 43.8 | 44.6 | pc-timken-lm67048-10#corKn |
| pc-timken-lm67048-10 | calculationFactorE | 0.44 | 0.41 | pc-timken-lm67048-10#calculationFactorE |
| pc-timken-lm67048-10 | calculationFactorY | 1.36 | 1.46 | pc-timken-lm67048-10#calculationFactorY |
| pc-timken-22220-emw33c3 | weightKg | 4.85 | 5 | pc-timken-22220-emw33c3#weightKg |
| pc-timken-22220-emw33c3 | corKn | 540 | 502 | pc-timken-22220-emw33c3#corKn |
| pc-timken-22220-emw33c3 | calculationFactorY0 | 2.8 | 2.78 | pc-timken-22220-emw33c3#calculationFactorY0 |
| pc-timken-22220-emw33c3 | clearanceOptions | ["C3","CN","C4"] | ["C3"] | pc-timken-22220-emw33c3#clearanceOptions |
| pc-nsk-6206-ddu-cm | crKn | 19.5 | 21.4 | pc-nsk-6206-ddu-cm#crKn |
| pc-nsk-6206-ddu-cm | weightKg | 0.2 | 0.199 | pc-nsk-6206-ddu-cm#weightKg |
| pc-nsk-6206-ddu-cm | speedGreaseRpm | 10000 | 7500 | pc-nsk-6206-ddu-cm#speedGreaseRpm |
| pc-nsk-6206-ddu-cm | cageMaterialEn | "Pressed steel cage" | "Pressed sheet steel" | pc-nsk-6206-ddu-cm#cageMaterialEn |
| pc-nsk-6206-ddu-cm | cageMaterialFa | "فولاد پرسکاری شده کم‌اصطکاک ژاپن" | "ورق فولادی پرس‌کاری‌شده" | pc-nsk-6206-ddu-cm#cageMaterialFa |
| pc-nsk-6206-ddu-cm | sealingEn | "Dual contact synthetic rubber seals (DDU)" | "Two contact rubber seals (DDU)" | pc-nsk-6206-ddu-cm#sealingEn |
| pc-nsk-6206-ddu-cm | sealingFa | "آب‌بند تماسی مقاوم DDU در دو طرف" | "دو آب‌بند لاستیکی تماسی (DDU)" | pc-nsk-6206-ddu-cm#sealingFa |
| pc-nsk-6206-ddu-cm | clearanceOptions | ["CM (Electric Motor)","C3","CN"] | ["CM (Electric Motor)"] | pc-nsk-6206-ddu-cm#clearanceOptions |
| pc-nsk-nu-2214-et | crKn | 164 | 191 | pc-nsk-nu-2214-et#crKn |
| pc-nsk-nu-2214-et | corKn | 188 | 194 | pc-nsk-nu-2214-et#corKn |
| pc-nsk-nu-2214-et | weightKg | 1.45 | 1.49 | pc-nsk-nu-2214-et#weightKg |
| pc-nsk-nu-2214-et | speedGreaseRpm | 5300 | 4500 | pc-nsk-nu-2214-et#speedGreaseRpm |
| pc-nsk-nu-2214-et | speedOilRpm | 6700 | 5600 | pc-nsk-nu-2214-et#speedOilRpm |
| pc-nsk-nu-2214-et | thermalSpeedRatingRpm | 6300 | 5600 | pc-nsk-nu-2214-et#thermalSpeedRatingRpm |
| pc-nsk-nu-2214-et | cageMaterialEn | "Polyamide 66 reinforced cage (ET)" | "Polyamide resin (nylon 66)" | pc-nsk-nu-2214-et#cageMaterialEn |
| pc-nsk-nu-2214-et | cageMaterialFa | "پلی‌آمید ۶۶ تقویت‌شده با الیاف شیشه (ET)" | "رزین پلی‌آمید (نایلون ۶۶)" | pc-nsk-nu-2214-et#cageMaterialFa |
| pc-nsk-nu-2214-et | clearanceOptions | ["C3","CN","C4"] | ["CN"] | pc-nsk-nu-2214-et#clearanceOptions |
| pc-ntn-6204-llu-c3 | crKn | 12.8 | 14.2 | pc-ntn-6204-llu-c3#crKn |
| pc-ntn-6204-llu-c3 | speedGreaseRpm | 12000 | 10000 | pc-ntn-6204-llu-c3#speedGreaseRpm |
| pc-ntn-6204-llu-c3 | calculationFactorF0 | 13.1 | 13.2 | pc-ntn-6204-llu-c3#calculationFactorF0 |
| pc-ntn-6204-llu-c3 | cageMaterialEn | "Pressed steel cage" | "Pressed cage" | pc-ntn-6204-llu-c3#cageMaterialEn |
| pc-ntn-6204-llu-c3 | cageMaterialFa | "فولاد آلیاژی ژاپنی" | "قفسه پرس‌کاری‌شده" | pc-ntn-6204-llu-c3#cageMaterialFa |
| pc-ntn-6204-llu-c3 | sealingEn | "Dual synthetic contact rubber seals (LLU)" | "Two contact seals (LLU)" | pc-ntn-6204-llu-c3#sealingEn |
| pc-ntn-6204-llu-c3 | sealingFa | "کاسه نمد تماسی سنتتیک LLU دو طرفه" | "دو آب‌بند تماسی (LLU)" | pc-ntn-6204-llu-c3#sealingFa |
| pc-ntn-22214-eakd1 | crKn | 212 | 235 | pc-ntn-22214-eakd1#crKn |
| pc-ntn-22214-eakd1 | corKn | 236 | 240 | pc-ntn-22214-eakd1#corKn |
| pc-ntn-22214-eakd1 | weightKg | 1.55 | 1.58 | pc-ntn-22214-eakd1#weightKg |
| pc-ntn-22214-eakd1 | speedGreaseRpm | 4500 | 4100 | pc-ntn-22214-eakd1#speedGreaseRpm |
| pc-ntn-22214-eakd1 | speedOilRpm | 5800 | 5200 | pc-ntn-22214-eakd1#speedOilRpm |
| pc-ntn-22214-eakd1 | calculationFactorE | 0.23 | 0.22 | pc-ntn-22214-eakd1#calculationFactorE |
| pc-ntn-22214-eakd1 | calculationFactorY1 | 2.9 | 3.01 | pc-ntn-22214-eakd1#calculationFactorY1 |
| pc-ntn-22214-eakd1 | calculationFactorY2 | 4.4 | 4.48 | pc-ntn-22214-eakd1#calculationFactorY2 |
| pc-ntn-22214-eakd1 | calculationFactorY0 | 2.9 | 2.94 | pc-ntn-22214-eakd1#calculationFactorY0 |
| pc-ntn-5206-s | rMin | 1.1 | 1 | pc-ntn-5206-s#rMin |
| pc-ntn-5206-s | crKn | 30.5 | 29.6 | pc-ntn-5206-s#crKn |
| pc-ntn-5206-s | corKn | 21 | 21.1 | pc-ntn-5206-s#corKn |
| pc-ntn-5206-s | speedGreaseRpm | 8500 | 7100 | pc-ntn-5206-s#speedGreaseRpm |
| pc-ntn-5206-s | speedOilRpm | 12000 | 9500 | pc-ntn-5206-s#speedOilRpm |
| pc-koyo-6207-2rs | crKn | 25.7 | 32.1 | pc-koyo-6207-2rs#crKn |
| pc-koyo-6207-2rs | corKn | 15.3 | 15.4 | pc-koyo-6207-2rs#corKn |
| pc-koyo-6207-2rs | weightKg | 0.29 | 0.288 | pc-koyo-6207-2rs#weightKg |
| pc-koyo-6207-2rs | speedGreaseRpm | 8500 | 6000 | pc-koyo-6207-2rs#speedGreaseRpm |
| pc-koyo-6207-2rs | calculationFactorF0 | 13.8 | 13.9 | pc-koyo-6207-2rs#calculationFactorF0 |
| pc-koyo-6207-2rs | sealingEn | "Dual rubber contact seals (2RS)" | "Two contact seals (2RS)" | pc-koyo-6207-2rs#sealingEn |
| pc-koyo-6207-2rs | sealingFa | "کاسه نمد لاستیکی تماسی NBR دو طرفه (2RS)" | "دو آب‌بند تماسی (2RS)" | pc-koyo-6207-2rs#sealingFa |
| pc-koyo-30212-jr | rMin | 1.5 | 2 | pc-koyo-30212-jr#rMin |
| pc-koyo-30212-jr | crKn | 104 | 133 | pc-koyo-30212-jr#crKn |
| pc-koyo-30212-jr | corKn | 122 | 127 | pc-koyo-30212-jr#corKn |
| pc-koyo-30212-jr | weightKg | 0.89 | 0.945 | pc-koyo-30212-jr#weightKg |
| pc-koyo-30212-jr | speedGreaseRpm | 3800 | 3500 | pc-koyo-30212-jr#speedGreaseRpm |
| pc-koyo-30212-jr | speedOilRpm | 5300 | 4700 | pc-koyo-30212-jr#speedOilRpm |
| pc-koyo-30212-jr | calculationFactorY | 1.5 | 1.48 | pc-koyo-30212-jr#calculationFactorY |
| pc-koyo-30212-jr | calculationFactorY0 | 0.8 | 0.81 | pc-koyo-30212-jr#calculationFactorY0 |
| pc-nachi-6008-2nse9 | speedGreaseRpm | 11000 | 6100 | pc-nachi-6008-2nse9#speedGreaseRpm |
| pc-nachi-6008-2nse9 | cageMaterialEn | "Precision pressed steel cage" | "Pressed steel cage" | pc-nachi-6008-2nse9#cageMaterialEn |
| pc-nachi-6008-2nse9 | cageMaterialFa | "فولاد پرسکاری شده دقیق ناچی" | "قفسه فولادی پرس‌کاری‌شده" | pc-nachi-6008-2nse9#cageMaterialFa |
| pc-nachi-6008-2nse9 | sealingEn | "Dual low-torque contact rubber seals (2NSE9)" | "Two contact seals (2NSE9)" | pc-nachi-6008-2nse9#sealingEn |
| pc-nachi-6008-2nse9 | sealingFa | "آب‌بند لاستیکی کم‌اصطکاک پیشرفته (2NSE9)" | "دو آب‌بند تماسی (2NSE9)" | pc-nachi-6008-2nse9#sealingFa |
| pc-nachi-6008-2nse9 | descriptionFa | "بلبرینگ ژاپنی ناچی سری Quest با فولاد فوق‌العاده تمیز خلاء و آب‌بند غیرتماسی/تماسی بهینه 2NSE9 جهت کاهش اتلاف توان و نویز در الکتروموتورها." | "بلبرینگ ژاپنی ناچی سری Quest با فولاد فوق‌العاده تمیز خلاء و آب‌بند تماسی 2NSE9 جهت کاهش اتلاف توان و نویز در الکتروموتورها." | pc-nachi-6008-2nse9#descriptionFa |
| pc-nachi-22222-ex | crKn | 560 | 680 | pc-nachi-22222-ex#crKn |
| pc-nachi-22222-ex | corKn | 690 | 640 | pc-nachi-22222-ex#corKn |
| pc-nachi-22222-ex | weightKg | 6.95 | 7.36 | pc-nachi-22222-ex#weightKg |
| pc-nachi-22222-ex | speedOilRpm | 3400 | 3200 | pc-nachi-22222-ex#speedOilRpm |
| pc-nachi-22222-ex | calculationFactorE | 0.23 | 0.26 | pc-nachi-22222-ex#calculationFactorE |
| pc-nachi-22222-ex | calculationFactorY1 | 2.9 | 2.64 | pc-nachi-22222-ex#calculationFactorY1 |
| pc-nachi-22222-ex | calculationFactorY2 | 4.4 | 3.93 | pc-nachi-22222-ex#calculationFactorY2 |
| pc-nachi-22222-ex | calculationFactorY0 | 2.9 | 2.58 | pc-nachi-22222-ex#calculationFactorY0 |
| pc-nachi-22222-ex | cageMaterialEn | "Heavy duty pressed steel cage with guide ring" | "Pressed steel cage with floating guide ring" | pc-nachi-22222-ex#cageMaterialEn |
| pc-nachi-22222-ex | cageMaterialFa | "قفسه فولادی ضخیم با راهنمای رولر مرکزی" | "قفسه فولادی پرس‌کاری‌شده با حلقه راهنمای شناور" | pc-nachi-22222-ex#cageMaterialFa |
| pc-nachi-nup-310-eg | crKn | 112 | 110 | pc-nachi-nup-310-eg#crKn |
| pc-nachi-nup-310-eg | corKn | 108 | 113 | pc-nachi-nup-310-eg#corKn |
| pc-nachi-nup-310-eg | cageMaterialEn | "Engineered high strength polyamide cage (EG)" | "Glass-reinforced nylon cage" | pc-nachi-nup-310-eg#cageMaterialEn |
| pc-nachi-nup-310-eg | cageMaterialFa | "پلی‌آمید مقاوم ۶۶ یا قفسه فولادی (EG)" | "قفسه نایلونی تقویت‌شده با الیاف شیشه" | pc-nachi-nup-310-eg#cageMaterialFa |
| skf-6002-2z | rMin | absent | 0.3 | skf-6002-2z#rMin |
| skf-6002-2z | calculationFactorF0 | absent | 14 | skf-6002-2z#calculationFactorF0 |
| skf-6002-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6002-2z#cageMaterialEn |
| skf-6002-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6002-2z#cageMaterialFa |
| skf-6002-2z | clearanceOptions | [] | ["CN"] | skf-6002-2z#clearanceOptions |
| skf-6002-2z | sealingEn | "two steel shields" | "Two shields" | skf-6002-2z#sealingEn |
| skf-6002-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6002-2z#descriptionEn |
| skf-6002-2rsl | rMin | absent | 0.3 | skf-6002-2rsl#rMin |
| skf-6002-2rsl | calculationFactorF0 | absent | 14 | skf-6002-2rsl#calculationFactorF0 |
| skf-6002-2rsl | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6002-2rsl#cageMaterialEn |
| skf-6002-2rsl | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6002-2rsl#cageMaterialFa |
| skf-6002-2rsl | clearanceOptions | [] | ["CN"] | skf-6002-2rsl#clearanceOptions |
| skf-6002-2rsl | sealingEn | "two low-friction seals" | "Two low-friction NBR seals" | skf-6002-2rsl#sealingEn |
| skf-6002-2rsl | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند کم‌اصطکاک NBR" | skf-6002-2rsl#sealingFa |
| skf-6002-2rsh | rMin | absent | 0.3 | skf-6002-2rsh#rMin |
| skf-6002-2rsh | calculationFactorF0 | absent | 14 | skf-6002-2rsh#calculationFactorF0 |
| skf-6002-2rsh | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6002-2rsh#cageMaterialEn |
| skf-6002-2rsh | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6002-2rsh#cageMaterialFa |
| skf-6002-2rsh | clearanceOptions | [] | ["CN"] | skf-6002-2rsh#clearanceOptions |
| skf-6002-2rsh | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6002-2rsh#sealingEn |
| skf-6002-2rsh | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6002-2rsh#sealingFa |
| skf-6202-2z | rMin | absent | 0.6 | skf-6202-2z#rMin |
| skf-6202-2z | calculationFactorF0 | absent | 13 | skf-6202-2z#calculationFactorF0 |
| skf-6202-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6202-2z#cageMaterialEn |
| skf-6202-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6202-2z#cageMaterialFa |
| skf-6202-2z | clearanceOptions | [] | ["CN"] | skf-6202-2z#clearanceOptions |
| skf-6202-2z | sealingEn | "two steel shields" | "Two shields" | skf-6202-2z#sealingEn |
| skf-6202-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6202-2z#descriptionEn |
| skf-6202-2rsl | rMin | absent | 0.6 | skf-6202-2rsl#rMin |
| skf-6202-2rsl | calculationFactorF0 | absent | 13 | skf-6202-2rsl#calculationFactorF0 |
| skf-6202-2rsl | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6202-2rsl#cageMaterialEn |
| skf-6202-2rsl | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6202-2rsl#cageMaterialFa |
| skf-6202-2rsl | clearanceOptions | [] | ["CN"] | skf-6202-2rsl#clearanceOptions |
| skf-6202-2rsl | sealingEn | "two low-friction seals" | "Two low-friction NBR seals" | skf-6202-2rsl#sealingEn |
| skf-6202-2rsl | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند کم‌اصطکاک NBR" | skf-6202-2rsl#sealingFa |
| skf-6202-2rsh | rMin | absent | 0.6 | skf-6202-2rsh#rMin |
| skf-6202-2rsh | calculationFactorF0 | absent | 13 | skf-6202-2rsh#calculationFactorF0 |
| skf-6202-2rsh | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6202-2rsh#cageMaterialEn |
| skf-6202-2rsh | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6202-2rsh#cageMaterialFa |
| skf-6202-2rsh | clearanceOptions | [] | ["CN"] | skf-6202-2rsh#clearanceOptions |
| skf-6202-2rsh | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6202-2rsh#sealingEn |
| skf-6202-2rsh | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6202-2rsh#sealingFa |
| skf-6302-2z | rMin | absent | 1 | skf-6302-2z#rMin |
| skf-6302-2z | calculationFactorF0 | absent | 12 | skf-6302-2z#calculationFactorF0 |
| skf-6302-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6302-2z#cageMaterialEn |
| skf-6302-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6302-2z#cageMaterialFa |
| skf-6302-2z | clearanceOptions | [] | ["CN"] | skf-6302-2z#clearanceOptions |
| skf-6302-2z | sealingEn | "two steel shields" | "Two shields" | skf-6302-2z#sealingEn |
| skf-6302-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6302-2z#descriptionEn |
| skf-6302-2rsl | rMin | absent | 1 | skf-6302-2rsl#rMin |
| skf-6302-2rsl | calculationFactorF0 | absent | 12 | skf-6302-2rsl#calculationFactorF0 |
| skf-6302-2rsl | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6302-2rsl#cageMaterialEn |
| skf-6302-2rsl | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6302-2rsl#cageMaterialFa |
| skf-6302-2rsl | clearanceOptions | [] | ["CN"] | skf-6302-2rsl#clearanceOptions |
| skf-6302-2rsl | sealingEn | "two low-friction seals" | "Two low-friction NBR seals" | skf-6302-2rsl#sealingEn |
| skf-6302-2rsl | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند کم‌اصطکاک NBR" | skf-6302-2rsl#sealingFa |
| skf-6302-2rsh | rMin | absent | 1 | skf-6302-2rsh#rMin |
| skf-6302-2rsh | calculationFactorF0 | absent | 12 | skf-6302-2rsh#calculationFactorF0 |
| skf-6302-2rsh | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6302-2rsh#cageMaterialEn |
| skf-6302-2rsh | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6302-2rsh#cageMaterialFa |
| skf-6302-2rsh | clearanceOptions | [] | ["CN"] | skf-6302-2rsh#clearanceOptions |
| skf-6302-2rsh | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6302-2rsh#sealingEn |
| skf-6302-2rsh | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6302-2rsh#sealingFa |
| skf-6003-2z | rMin | absent | 0.3 | skf-6003-2z#rMin |
| skf-6003-2z | calculationFactorF0 | absent | 14 | skf-6003-2z#calculationFactorF0 |
| skf-6003-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6003-2z#cageMaterialEn |
| skf-6003-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6003-2z#cageMaterialFa |
| skf-6003-2z | clearanceOptions | [] | ["CN"] | skf-6003-2z#clearanceOptions |
| skf-6003-2z | sealingEn | "two steel shields" | "Two shields" | skf-6003-2z#sealingEn |
| skf-6003-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6003-2z#descriptionEn |
| skf-6003-2rsl | rMin | absent | 0.3 | skf-6003-2rsl#rMin |
| skf-6003-2rsl | calculationFactorF0 | absent | 14 | skf-6003-2rsl#calculationFactorF0 |
| skf-6003-2rsl | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6003-2rsl#cageMaterialEn |
| skf-6003-2rsl | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6003-2rsl#cageMaterialFa |
| skf-6003-2rsl | clearanceOptions | [] | ["CN"] | skf-6003-2rsl#clearanceOptions |
| skf-6003-2rsl | sealingEn | "two low-friction seals" | "Two low-friction NBR seals" | skf-6003-2rsl#sealingEn |
| skf-6003-2rsl | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند کم‌اصطکاک NBR" | skf-6003-2rsl#sealingFa |
| skf-6003-2rsh | rMin | absent | 0.3 | skf-6003-2rsh#rMin |
| skf-6003-2rsh | calculationFactorF0 | absent | 14 | skf-6003-2rsh#calculationFactorF0 |
| skf-6003-2rsh | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6003-2rsh#cageMaterialEn |
| skf-6003-2rsh | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6003-2rsh#cageMaterialFa |
| skf-6003-2rsh | clearanceOptions | [] | ["CN"] | skf-6003-2rsh#clearanceOptions |
| skf-6003-2rsh | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6003-2rsh#sealingEn |
| skf-6003-2rsh | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6003-2rsh#sealingFa |
| skf-6203-2z | rMin | absent | 0.6 | skf-6203-2z#rMin |
| skf-6203-2z | calculationFactorF0 | absent | 13 | skf-6203-2z#calculationFactorF0 |
| skf-6203-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6203-2z#cageMaterialEn |
| skf-6203-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6203-2z#cageMaterialFa |
| skf-6203-2z | clearanceOptions | [] | ["CN"] | skf-6203-2z#clearanceOptions |
| skf-6203-2z | sealingEn | "two steel shields" | "Two shields" | skf-6203-2z#sealingEn |
| skf-6203-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6203-2z#descriptionEn |
| skf-6203-2rsl | rMin | absent | 0.6 | skf-6203-2rsl#rMin |
| skf-6203-2rsl | calculationFactorF0 | absent | 13 | skf-6203-2rsl#calculationFactorF0 |
| skf-6203-2rsl | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6203-2rsl#cageMaterialEn |
| skf-6203-2rsl | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6203-2rsl#cageMaterialFa |
| skf-6203-2rsl | clearanceOptions | [] | ["CN"] | skf-6203-2rsl#clearanceOptions |
| skf-6203-2rsl | sealingEn | "two low-friction seals" | "Two low-friction NBR seals" | skf-6203-2rsl#sealingEn |
| skf-6203-2rsl | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند کم‌اصطکاک NBR" | skf-6203-2rsl#sealingFa |
| skf-6203-2rsh | rMin | absent | 0.6 | skf-6203-2rsh#rMin |
| skf-6203-2rsh | calculationFactorF0 | absent | 13 | skf-6203-2rsh#calculationFactorF0 |
| skf-6203-2rsh | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6203-2rsh#cageMaterialEn |
| skf-6203-2rsh | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6203-2rsh#cageMaterialFa |
| skf-6203-2rsh | clearanceOptions | [] | ["CN"] | skf-6203-2rsh#clearanceOptions |
| skf-6203-2rsh | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6203-2rsh#sealingEn |
| skf-6203-2rsh | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6203-2rsh#sealingFa |
| skf-6303-2z | rMin | absent | 1 | skf-6303-2z#rMin |
| skf-6303-2z | calculationFactorF0 | absent | 12 | skf-6303-2z#calculationFactorF0 |
| skf-6303-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6303-2z#cageMaterialEn |
| skf-6303-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6303-2z#cageMaterialFa |
| skf-6303-2z | clearanceOptions | [] | ["CN"] | skf-6303-2z#clearanceOptions |
| skf-6303-2z | sealingEn | "two steel shields" | "Two shields" | skf-6303-2z#sealingEn |
| skf-6303-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6303-2z#descriptionEn |
| skf-6303-2rsl | rMin | absent | 1 | skf-6303-2rsl#rMin |
| skf-6303-2rsl | calculationFactorF0 | absent | 12 | skf-6303-2rsl#calculationFactorF0 |
| skf-6303-2rsl | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6303-2rsl#cageMaterialEn |
| skf-6303-2rsl | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6303-2rsl#cageMaterialFa |
| skf-6303-2rsl | clearanceOptions | [] | ["CN"] | skf-6303-2rsl#clearanceOptions |
| skf-6303-2rsl | sealingEn | "two low-friction seals" | "Two low-friction NBR seals" | skf-6303-2rsl#sealingEn |
| skf-6303-2rsl | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند کم‌اصطکاک NBR" | skf-6303-2rsl#sealingFa |
| skf-6303-2rsh | rMin | absent | 1 | skf-6303-2rsh#rMin |
| skf-6303-2rsh | calculationFactorF0 | absent | 12 | skf-6303-2rsh#calculationFactorF0 |
| skf-6303-2rsh | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6303-2rsh#cageMaterialEn |
| skf-6303-2rsh | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6303-2rsh#cageMaterialFa |
| skf-6303-2rsh | clearanceOptions | [] | ["CN"] | skf-6303-2rsh#clearanceOptions |
| skf-6303-2rsh | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6303-2rsh#sealingEn |
| skf-6303-2rsh | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6303-2rsh#sealingFa |
| skf-6004-2z | rMin | absent | 0.6 | skf-6004-2z#rMin |
| skf-6004-2z | calculationFactorF0 | absent | 14 | skf-6004-2z#calculationFactorF0 |
| skf-6004-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6004-2z#cageMaterialEn |
| skf-6004-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6004-2z#cageMaterialFa |
| skf-6004-2z | clearanceOptions | [] | ["CN"] | skf-6004-2z#clearanceOptions |
| skf-6004-2z | sealingEn | "two steel shields" | "Two shields" | skf-6004-2z#sealingEn |
| skf-6004-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6004-2z#descriptionEn |
| skf-6004-2rsl | rMin | absent | 0.6 | skf-6004-2rsl#rMin |
| skf-6004-2rsl | calculationFactorF0 | absent | 14 | skf-6004-2rsl#calculationFactorF0 |
| skf-6004-2rsl | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6004-2rsl#cageMaterialEn |
| skf-6004-2rsl | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6004-2rsl#cageMaterialFa |
| skf-6004-2rsl | clearanceOptions | [] | ["CN"] | skf-6004-2rsl#clearanceOptions |
| skf-6004-2rsl | sealingEn | "two low-friction seals" | "Two low-friction NBR seals" | skf-6004-2rsl#sealingEn |
| skf-6004-2rsl | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند کم‌اصطکاک NBR" | skf-6004-2rsl#sealingFa |
| skf-6004-2rsh | rMin | absent | 0.6 | skf-6004-2rsh#rMin |
| skf-6004-2rsh | calculationFactorF0 | absent | 14 | skf-6004-2rsh#calculationFactorF0 |
| skf-6004-2rsh | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6004-2rsh#cageMaterialEn |
| skf-6004-2rsh | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6004-2rsh#cageMaterialFa |
| skf-6004-2rsh | clearanceOptions | [] | ["CN"] | skf-6004-2rsh#clearanceOptions |
| skf-6004-2rsh | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6004-2rsh#sealingEn |
| skf-6004-2rsh | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6004-2rsh#sealingFa |
| skf-6304-2z | rMin | absent | 1.1 | skf-6304-2z#rMin |
| skf-6304-2z | calculationFactorF0 | absent | 12 | skf-6304-2z#calculationFactorF0 |
| skf-6304-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6304-2z#cageMaterialEn |
| skf-6304-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6304-2z#cageMaterialFa |
| skf-6304-2z | clearanceOptions | [] | ["CN"] | skf-6304-2z#clearanceOptions |
| skf-6304-2z | sealingEn | "two steel shields" | "Two shields" | skf-6304-2z#sealingEn |
| skf-6304-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6304-2z#descriptionEn |
| skf-6304-2rsl | rMin | absent | 1.1 | skf-6304-2rsl#rMin |
| skf-6304-2rsl | calculationFactorF0 | absent | 12 | skf-6304-2rsl#calculationFactorF0 |
| skf-6304-2rsl | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6304-2rsl#cageMaterialEn |
| skf-6304-2rsl | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6304-2rsl#cageMaterialFa |
| skf-6304-2rsl | clearanceOptions | [] | ["CN"] | skf-6304-2rsl#clearanceOptions |
| skf-6304-2rsl | sealingEn | "two low-friction seals" | "Two low-friction NBR seals" | skf-6304-2rsl#sealingEn |
| skf-6304-2rsl | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند کم‌اصطکاک NBR" | skf-6304-2rsl#sealingFa |
| skf-6304-2rsh | rMin | absent | 1.1 | skf-6304-2rsh#rMin |
| skf-6304-2rsh | calculationFactorF0 | absent | 12 | skf-6304-2rsh#calculationFactorF0 |
| skf-6304-2rsh | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6304-2rsh#cageMaterialEn |
| skf-6304-2rsh | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6304-2rsh#cageMaterialFa |
| skf-6304-2rsh | clearanceOptions | [] | ["CN"] | skf-6304-2rsh#clearanceOptions |
| skf-6304-2rsh | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6304-2rsh#sealingEn |
| skf-6304-2rsh | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6304-2rsh#sealingFa |
| skf-6005-2z | rMin | absent | 0.6 | skf-6005-2z#rMin |
| skf-6005-2z | calculationFactorF0 | absent | 14 | skf-6005-2z#calculationFactorF0 |
| skf-6005-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6005-2z#cageMaterialEn |
| skf-6005-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6005-2z#cageMaterialFa |
| skf-6005-2z | clearanceOptions | [] | ["CN"] | skf-6005-2z#clearanceOptions |
| skf-6005-2z | sealingEn | "two steel shields" | "Two shields" | skf-6005-2z#sealingEn |
| skf-6005-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6005-2z#descriptionEn |
| skf-6005-2rsl | rMin | absent | 0.6 | skf-6005-2rsl#rMin |
| skf-6005-2rsl | calculationFactorF0 | absent | 14 | skf-6005-2rsl#calculationFactorF0 |
| skf-6005-2rsl | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6005-2rsl#cageMaterialEn |
| skf-6005-2rsl | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6005-2rsl#cageMaterialFa |
| skf-6005-2rsl | clearanceOptions | [] | ["CN"] | skf-6005-2rsl#clearanceOptions |
| skf-6005-2rsl | sealingEn | "two low-friction seals" | "Two low-friction NBR seals" | skf-6005-2rsl#sealingEn |
| skf-6005-2rsl | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند کم‌اصطکاک NBR" | skf-6005-2rsl#sealingFa |
| skf-6005-2rsh | rMin | absent | 0.6 | skf-6005-2rsh#rMin |
| skf-6005-2rsh | calculationFactorF0 | absent | 14 | skf-6005-2rsh#calculationFactorF0 |
| skf-6005-2rsh | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6005-2rsh#cageMaterialEn |
| skf-6005-2rsh | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6005-2rsh#cageMaterialFa |
| skf-6005-2rsh | clearanceOptions | [] | ["CN"] | skf-6005-2rsh#clearanceOptions |
| skf-6005-2rsh | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6005-2rsh#sealingEn |
| skf-6005-2rsh | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6005-2rsh#sealingFa |
| skf-6205-2z | rMin | absent | 1 | skf-6205-2z#rMin |
| skf-6205-2z | calculationFactorF0 | absent | 14 | skf-6205-2z#calculationFactorF0 |
| skf-6205-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6205-2z#cageMaterialEn |
| skf-6205-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6205-2z#cageMaterialFa |
| skf-6205-2z | clearanceOptions | [] | ["CN"] | skf-6205-2z#clearanceOptions |
| skf-6205-2z | sealingEn | "two steel shields" | "Two shields" | skf-6205-2z#sealingEn |
| skf-6205-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6205-2z#descriptionEn |
| skf-6205-2rsl | rMin | absent | 1 | skf-6205-2rsl#rMin |
| skf-6205-2rsl | calculationFactorF0 | absent | 14 | skf-6205-2rsl#calculationFactorF0 |
| skf-6205-2rsl | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6205-2rsl#cageMaterialEn |
| skf-6205-2rsl | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6205-2rsl#cageMaterialFa |
| skf-6205-2rsl | clearanceOptions | [] | ["CN"] | skf-6205-2rsl#clearanceOptions |
| skf-6205-2rsl | sealingEn | "two low-friction seals" | "Two low-friction NBR seals" | skf-6205-2rsl#sealingEn |
| skf-6205-2rsl | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند کم‌اصطکاک NBR" | skf-6205-2rsl#sealingFa |
| skf-6205-2rsh | rMin | absent | 1 | skf-6205-2rsh#rMin |
| skf-6205-2rsh | calculationFactorF0 | absent | 14 | skf-6205-2rsh#calculationFactorF0 |
| skf-6205-2rsh | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6205-2rsh#cageMaterialEn |
| skf-6205-2rsh | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6205-2rsh#cageMaterialFa |
| skf-6205-2rsh | clearanceOptions | [] | ["CN"] | skf-6205-2rsh#clearanceOptions |
| skf-6205-2rsh | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6205-2rsh#sealingEn |
| skf-6205-2rsh | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6205-2rsh#sealingFa |
| skf-6305-2z | rMin | absent | 1.1 | skf-6305-2z#rMin |
| skf-6305-2z | calculationFactorF0 | absent | 12 | skf-6305-2z#calculationFactorF0 |
| skf-6305-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6305-2z#cageMaterialEn |
| skf-6305-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6305-2z#cageMaterialFa |
| skf-6305-2z | clearanceOptions | [] | ["CN"] | skf-6305-2z#clearanceOptions |
| skf-6305-2z | sealingEn | "two steel shields" | "Two shields" | skf-6305-2z#sealingEn |
| skf-6305-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6305-2z#descriptionEn |
| skf-6305-2rz | rMin | absent | 1.1 | skf-6305-2rz#rMin |
| skf-6305-2rz | calculationFactorF0 | absent | 12 | skf-6305-2rz#calculationFactorF0 |
| skf-6305-2rz | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6305-2rz#cageMaterialEn |
| skf-6305-2rz | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6305-2rz#cageMaterialFa |
| skf-6305-2rz | clearanceOptions | [] | ["CN"] | skf-6305-2rz#clearanceOptions |
| skf-6305-2rz | sealingEn | "two low-friction seals" | "Two non-contact NBR seals" | skf-6305-2rz#sealingEn |
| skf-6305-2rz | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند غیرتماسی NBR" | skf-6305-2rz#sealingFa |
| skf-6305-2rz | descriptionEn | "SKF sealed single-row deep groove ball bearing with two low-friction seals. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF 6305-2RZ single-row deep groove ball bearing with two non-contact NBR seals. Reference and limiting speeds are separate catalog ratings." | skf-6305-2rz#descriptionEn |
| skf-6305-2rz | descriptionFa | "بلبرینگ شیار عمیق تک‌ردیفه SKF با دو آب‌بند کم‌اصطکاک. ابعاد و ظرفیت‌ها از جدول کاتالوگ SKF ثبت شده‌اند؛ پیش از انتخاب مهندسی، صفحه فعلی محصول بررسی شود." | "بلبرینگ شیار عمیق تک‌ردیفه SKF 6305-2RZ با دو آب‌بند غیرتماسی NBR. سرعت مرجع و سرعت حدی، مشخصه‌های جداگانه کاتالوگ هستند." | skf-6305-2rz#descriptionFa |
| skf-6305-2rs1 | rMin | absent | 1.1 | skf-6305-2rs1#rMin |
| skf-6305-2rs1 | calculationFactorF0 | absent | 12 | skf-6305-2rs1#calculationFactorF0 |
| skf-6305-2rs1 | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6305-2rs1#cageMaterialEn |
| skf-6305-2rs1 | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6305-2rs1#cageMaterialFa |
| skf-6305-2rs1 | clearanceOptions | [] | ["CN"] | skf-6305-2rs1#clearanceOptions |
| skf-6305-2rs1 | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6305-2rs1#sealingEn |
| skf-6305-2rs1 | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6305-2rs1#sealingFa |
| skf-6006-2z | rMin | absent | 1 | skf-6006-2z#rMin |
| skf-6006-2z | calculationFactorF0 | absent | 15 | skf-6006-2z#calculationFactorF0 |
| skf-6006-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6006-2z#cageMaterialEn |
| skf-6006-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6006-2z#cageMaterialFa |
| skf-6006-2z | clearanceOptions | [] | ["CN"] | skf-6006-2z#clearanceOptions |
| skf-6006-2z | sealingEn | "two steel shields" | "Two shields" | skf-6006-2z#sealingEn |
| skf-6006-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6006-2z#descriptionEn |
| skf-6006-2rz | rMin | absent | 1 | skf-6006-2rz#rMin |
| skf-6006-2rz | calculationFactorF0 | absent | 15 | skf-6006-2rz#calculationFactorF0 |
| skf-6006-2rz | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6006-2rz#cageMaterialEn |
| skf-6006-2rz | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6006-2rz#cageMaterialFa |
| skf-6006-2rz | clearanceOptions | [] | ["CN"] | skf-6006-2rz#clearanceOptions |
| skf-6006-2rz | sealingEn | "two low-friction seals" | "Two non-contact NBR seals" | skf-6006-2rz#sealingEn |
| skf-6006-2rz | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند غیرتماسی NBR" | skf-6006-2rz#sealingFa |
| skf-6006-2rz | descriptionEn | "SKF sealed single-row deep groove ball bearing with two low-friction seals. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF 6006-2RZ single-row deep groove ball bearing with two non-contact NBR seals. Reference and limiting speeds are separate catalog ratings." | skf-6006-2rz#descriptionEn |
| skf-6006-2rz | descriptionFa | "بلبرینگ شیار عمیق تک‌ردیفه SKF با دو آب‌بند کم‌اصطکاک. ابعاد و ظرفیت‌ها از جدول کاتالوگ SKF ثبت شده‌اند؛ پیش از انتخاب مهندسی، صفحه فعلی محصول بررسی شود." | "بلبرینگ شیار عمیق تک‌ردیفه SKF 6006-2RZ با دو آب‌بند غیرتماسی NBR. سرعت مرجع و سرعت حدی، مشخصه‌های جداگانه کاتالوگ هستند." | skf-6006-2rz#descriptionFa |
| skf-6006-2rs1 | rMin | absent | 1 | skf-6006-2rs1#rMin |
| skf-6006-2rs1 | calculationFactorF0 | absent | 15 | skf-6006-2rs1#calculationFactorF0 |
| skf-6006-2rs1 | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6006-2rs1#cageMaterialEn |
| skf-6006-2rs1 | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6006-2rs1#cageMaterialFa |
| skf-6006-2rs1 | clearanceOptions | [] | ["CN"] | skf-6006-2rs1#clearanceOptions |
| skf-6006-2rs1 | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6006-2rs1#sealingEn |
| skf-6006-2rs1 | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6006-2rs1#sealingFa |
| skf-6206-2z | rMin | absent | 1 | skf-6206-2z#rMin |
| skf-6206-2z | calculationFactorF0 | absent | 14 | skf-6206-2z#calculationFactorF0 |
| skf-6206-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6206-2z#cageMaterialEn |
| skf-6206-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6206-2z#cageMaterialFa |
| skf-6206-2z | clearanceOptions | [] | ["CN"] | skf-6206-2z#clearanceOptions |
| skf-6206-2z | sealingEn | "two steel shields" | "Two shields" | skf-6206-2z#sealingEn |
| skf-6206-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6206-2z#descriptionEn |
| skf-6206-2rz | rMin | absent | 1 | skf-6206-2rz#rMin |
| skf-6206-2rz | calculationFactorF0 | absent | 14 | skf-6206-2rz#calculationFactorF0 |
| skf-6206-2rz | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6206-2rz#cageMaterialEn |
| skf-6206-2rz | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6206-2rz#cageMaterialFa |
| skf-6206-2rz | clearanceOptions | [] | ["CN"] | skf-6206-2rz#clearanceOptions |
| skf-6206-2rz | sealingEn | "two low-friction seals" | "Two non-contact NBR seals" | skf-6206-2rz#sealingEn |
| skf-6206-2rz | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند غیرتماسی NBR" | skf-6206-2rz#sealingFa |
| skf-6206-2rz | descriptionEn | "SKF sealed single-row deep groove ball bearing with two low-friction seals. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF 6206-2RZ single-row deep groove ball bearing with two non-contact NBR seals. Reference and limiting speeds are separate catalog ratings." | skf-6206-2rz#descriptionEn |
| skf-6206-2rz | descriptionFa | "بلبرینگ شیار عمیق تک‌ردیفه SKF با دو آب‌بند کم‌اصطکاک. ابعاد و ظرفیت‌ها از جدول کاتالوگ SKF ثبت شده‌اند؛ پیش از انتخاب مهندسی، صفحه فعلی محصول بررسی شود." | "بلبرینگ شیار عمیق تک‌ردیفه SKF 6206-2RZ با دو آب‌بند غیرتماسی NBR. سرعت مرجع و سرعت حدی، مشخصه‌های جداگانه کاتالوگ هستند." | skf-6206-2rz#descriptionFa |
| skf-6206-2rs1 | rMin | absent | 1 | skf-6206-2rs1#rMin |
| skf-6206-2rs1 | calculationFactorF0 | absent | 14 | skf-6206-2rs1#calculationFactorF0 |
| skf-6206-2rs1 | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6206-2rs1#cageMaterialEn |
| skf-6206-2rs1 | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6206-2rs1#cageMaterialFa |
| skf-6206-2rs1 | clearanceOptions | [] | ["CN"] | skf-6206-2rs1#clearanceOptions |
| skf-6206-2rs1 | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6206-2rs1#sealingEn |
| skf-6206-2rs1 | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6206-2rs1#sealingFa |
| skf-6306-2z | rMin | absent | 1.1 | skf-6306-2z#rMin |
| skf-6306-2z | calculationFactorF0 | absent | 13 | skf-6306-2z#calculationFactorF0 |
| skf-6306-2z | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6306-2z#cageMaterialEn |
| skf-6306-2z | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6306-2z#cageMaterialFa |
| skf-6306-2z | clearanceOptions | [] | ["CN"] | skf-6306-2z#clearanceOptions |
| skf-6306-2z | sealingEn | "two steel shields" | "Two shields" | skf-6306-2z#sealingEn |
| skf-6306-2z | descriptionEn | "SKF sealed single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF shielded single-row deep groove ball bearing with two steel shields. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | skf-6306-2z#descriptionEn |
| skf-6306-2rz | rMin | absent | 1.1 | skf-6306-2rz#rMin |
| skf-6306-2rz | calculationFactorF0 | absent | 13 | skf-6306-2rz#calculationFactorF0 |
| skf-6306-2rz | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6306-2rz#cageMaterialEn |
| skf-6306-2rz | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6306-2rz#cageMaterialFa |
| skf-6306-2rz | clearanceOptions | [] | ["CN"] | skf-6306-2rz#clearanceOptions |
| skf-6306-2rz | sealingEn | "two low-friction seals" | "Two non-contact NBR seals" | skf-6306-2rz#sealingEn |
| skf-6306-2rz | sealingFa | "دو آب‌بند کم‌اصطکاک" | "دو آب‌بند غیرتماسی NBR" | skf-6306-2rz#sealingFa |
| skf-6306-2rz | descriptionEn | "SKF sealed single-row deep groove ball bearing with two low-friction seals. Dimensions and ratings are transcribed from the SKF catalog table; check the current product page before engineering selection." | "SKF 6306-2RZ single-row deep groove ball bearing with two non-contact NBR seals. Reference and limiting speeds are separate catalog ratings." | skf-6306-2rz#descriptionEn |
| skf-6306-2rz | descriptionFa | "بلبرینگ شیار عمیق تک‌ردیفه SKF با دو آب‌بند کم‌اصطکاک. ابعاد و ظرفیت‌ها از جدول کاتالوگ SKF ثبت شده‌اند؛ پیش از انتخاب مهندسی، صفحه فعلی محصول بررسی شود." | "بلبرینگ شیار عمیق تک‌ردیفه SKF 6306-2RZ با دو آب‌بند غیرتماسی NBR. سرعت مرجع و سرعت حدی، مشخصه‌های جداگانه کاتالوگ هستند." | skf-6306-2rz#descriptionFa |
| skf-6306-2rs1 | rMin | absent | 1.1 | skf-6306-2rs1#rMin |
| skf-6306-2rs1 | calculationFactorF0 | absent | 13 | skf-6306-2rs1#calculationFactorF0 |
| skf-6306-2rs1 | cageMaterialEn | "" | "Pressed sheet steel, ball-guided" | skf-6306-2rs1#cageMaterialEn |
| skf-6306-2rs1 | cageMaterialFa | "" | "فولاد پرس‌کاری‌شده، با هدایت ساچمه" | skf-6306-2rs1#cageMaterialFa |
| skf-6306-2rs1 | clearanceOptions | [] | ["CN"] | skf-6306-2rs1#clearanceOptions |
| skf-6306-2rs1 | sealingEn | "two contact seals" | "Two contact NBR seals" | skf-6306-2rs1#sealingEn |
| skf-6306-2rs1 | sealingFa | "دو آب‌بند تماسی" | "دو آب‌بند تماسی NBR" | skf-6306-2rs1#sealingFa |

## Validation

See `validation.json` for executed checks. Generation alone validates coverage, types, stable identity, source-linked changes and conflict-aware planning; it does not claim that all manufacturer values or media are verified.
