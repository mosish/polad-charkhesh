# Exact-image follow-up — 2026-10-18

The owner requested another web search and publication of remaining product pictures, then explicitly chose exact matches only and preservation of unresolved images.

## Published result

NTN 5206S now uses a photograph of the bearing beside its matching marked NTN box from [Mara Industrial Supply](https://maraindustrial.com/cart/bearings/ntn-5206s-bearing-5206.html). The original 1000 × 1000 image is stored without visual edits and attributed in both languages. Supplier listing association is verified; the physical supplied unit and authenticity are not independently verified.

The new image SHA-256 is `a18c30a4e9a922188072d539e8b063782c9142523f30d6cfa7405008274f0d20`. Application release `bcdba02aa66adbca216b25feb9ee0e3c1e53ab66` is live on both domains. Later documentation commits do not alter that runtime release.

The guarded `catalog-review/media-followup-2026-10-18.patch.json` changes only this product's image URL (plus operational update metadata). No technical specifications, product identities or other product records changed. Cumulative image coverage is now 101 replacements: 58 supplier listing matches and the previously approved 43 labeled examples.

## Nine unresolved entries

| Product | Reason retained |
| --- | --- |
| FAG 6312-TB-P6 | Fresh supplier results add C3; not the requested exact suffix. |
| INA NK25/20 | Exact-code listings specify 25 × 33 × 20, while the catalog specifies 25 × 35 × 20. |
| KOYO 22218 RHR | Available candidate photos/listings add W33/C3 or show drawings. |
| NACHI 6008-2NSE9 | No usable exact photograph acquired; candidates were generic illustrations or inaccessible. |
| NACHI NUP310EG | Available candidate image shows a mixed bearing group; other sources supply drawings or no usable photo. |
| Corteco 12011153B | Readable exact-part photo identifies 40 × 52/58 × 7.5 BASLSF, conflicting with catalog 35 × 52 × 7 TC. |
| Corteco 12012014B | No matching listing or photograph established. |
| SKF 6302-2RSL | Exact listing yielded a cutaway rendering; photographs found had different suffixes. |
| SKF 6303-2RSL | No usable exact photo acquired; alternative images were different variants or brands. |

Fresh search and rejection evidence is retained in the four `catalog-review/media-batches/followup-*-2026-10-18.json` files and the cumulative [media ledger](catalog-review/media/ledger.json). Existing engineering verification limitations remain open.

## Deployment and validation

- Type checking, six relevant media/guard tests, production build, bundle checks and production smoke checks passed locally and on the VPS. The first restricted local smoke run could not reach localhost; its authorized network-enabled rerun passed.
- Preview against the live catalog reported one change without conflicts. Rehearsal against a private backup passed before activation.
- A fresh verified pre-update backup remains on the VPS only, per the owner's instruction. Owner accounts, settings, media, inquiries and sessions were checked for preservation. SQLite integrity passed.
- The service restarted successfully after the release switch and returned healthy. No rollback was required; the previous release and verified backup remain on the VPS.
- Both public catalog APIs returned all 110 products. The new image matched its SHA-256 on both domains; every other product and all technical fields matched the pre-update public snapshot.
- Catalog and product pages, source credits and health checks passed on both domains. English and Persian Quick View were inspected in the browser, including the actual image and source label.
- [Machine-readable verification](audit-evidence/catalog-deployment-2026-10-18.json) records the live checks.
