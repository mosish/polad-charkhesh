# README and pending-work review — 2026-10-18

Scope: read the latest GitHub main, reconcile the README with dated project records, rerun repository lint, and make read-only public HTTP/DNS/catalog checks. This review does not deploy code, change hosting settings, log into Admin, run a host reboot, or repeat the complete release audit.

## Fresh observations

| Check | Result |
| --- | --- |
| Source baseline | GitHub `main` at `6624e78f06537afe368fbf71cc6dd5c875739702`; local source matched before this documentation update. |
| Public HTTPS | Both apex domains returned HTTP 200 with normal certificate verification; no TLS bypass used. |
| Health | Both `/api/health` responses were `{"status":"ok"}`. |
| Search indexing | Both homepage responses still include `X-Robots-Tag: noindex, nofollow`. |
| Public DNS | Both apex A records resolve to the VPS address through the configured resolver and explicit `1.1.1.1` queries. |
| Response path | Both apex requests returned `Server: nginx`, with no Cloudflare response identifiers observed. This is consistent with direct VPS delivery from this connection; it does not establish the Cloudflare dashboard, edge-certificate or Full (strict) configuration. |
| Public catalog | 110 records; 101 `/product-images/` primary image URLs; zero nonempty `pdfUrl` attachments. All 110 have technical-source entries, but only 61 have at least one URL in those entries. Entry presence is not manufacturer verification. |
| Repository lint | `oxlint --tsconfig tsconfig.platform.json --format json`: 197 diagnostics, all reported with error severity; exit code 1. No autofix or source edits performed. |

## Completed work supported by existing evidence

- Both language sites were deployed. The latest recorded application release is `326782d58fa8065c2219c6011a24a9eff1473ba3`; later documentation commits are not automatic deployments.
- The October 15 release applied 61 technical-record patches and 100 images. The October 18 follow-up added the matching NTN 5206S image, giving 101 replacements: 58 supplier-listing matches and 43 previously approved examples. Nine unresolved entries remain.
- Image-area labels and source captions were removed at the owner's request. Image assets, accessible alt text and the separate Image credits page remain.
- The VPS deployment record documents an isolated restore drill, service crash recovery and verified backups. These should not be listed as never performed. Full-host reboot acceptance is a separate outstanding check.
- Full external route checks passed on both domains on October 15 (226 page/language variants per domain). October 18 changes received targeted live checks and browser verification; this README review did not repeat all 452 checks.
- The balanced engineering toolbox project is defined and published to GitHub. Implementation has not begun.

## Work still open

1. **Engineering/catalog acceptance:** resolve exact identities, conflicting specifications, family/arrangement applicability and missing factors. The last technical ledger records 61 partial, 47 ambiguous and two blocked entries, with no fully verified record. Those review statuses are not replaced by the image count. Phase 0 of ENG-TOOLS-01 should establish calculation eligibility before expansion.
2. **Media and documents:** nine image replacements remain unresolved; 43 existing examples are not exact-SKU verification. Product PDF attachments remain absent across the current 110 records. Manufacturer-document sourcing and company datasheet production remain separate tasks, with company datasheets following technical verification.
3. **Code quality:** resolve 197 lint errors, then decide whether to make lint an enforcing CI gate. A passing advisory CI step does not clear this backlog.
4. **Final acceptance:** comprehensive admin role/restore/inquiry/media flows, accessibility, bilingual copy, mobile/device coverage and security review still need completion. Targeted checks are recorded but are not a blanket approval.
5. **Cloudflare and operational acceptance:** recheck both domains' current proxy/edge-certificate state before any change. English proxy activation was pending in the October 15 record; Persian proxying passed earlier but today's observations do not reproduce that delivery path. Review provider networking before the previously deferred full-host reboot test. Earlier SSH-hardening follow-up is not reverified here.
6. **Indexing:** keep the observed noindex gate until content and release acceptance permit an explicit indexing decision. Search Console verification/submission is not established by this review.
7. **Engineering expansion execution:** appoint the engineering reviewer, complete ENG-01–ENG-03, then implement the approved first-release scope. The estimated schedule remains a plan, not work already delivered.

Current owner preference is to keep backups on the VPS only. Recurring off-server transfer is not an authorized task and must not be presented as an automatic next action. Retention/recovery requirements can be reviewed without moving private data.

## README corrections

Updated the review date, cumulative image counts, image-caption behavior, actual deployment/restore status, document coverage and pending roadmap. Qualified hosting claims by evidence date, and marked historical development notes as snapshots so old “not deployed” statements are not mistaken for current status. Preserved the designer handoff, engineering project plan, architecture, business rules and historical evidence.

References: [October 15 catalog deployment](CATALOG_DEPLOYMENT_2026-10-15.md), [October 18 exact-image update](CATALOG_DEPLOYMENT_2026-10-18.md), [caption removal](IMAGE_LABEL_REMOVAL_2026-10-18.md), [VPS deployment](VPS_DEPLOYMENT_2026-10-14.md), [English-domain record](ENGLISH_DOMAIN_2026-10-15.md), [technical review](catalog-review/report.md), [engineering project](engineering-tools/PROJECT_PLAN.md).
