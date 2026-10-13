# Ubuntu VPS readiness review — 2026-10-13

**Decision: suitable for isolated Ubuntu staging; NOT APPROVED for public deployment.**

Owner database/accounts/uploads were preserved. Test writes used disposable databases. No purchase, DNS change or deployment occurred. Follow the [Ubuntu runbook](UBUNTU_24_RUNBOOK.md).

## Server recommendation

| Plan | Assessment |
| --- | --- |
| 1 vCPU / 2 GB / 40 GB | Economical viable start for modest traffic, without a control panel. Passed the constrained checks below. Monitor resource use and retain an upgrade path. |
| 2 vCPU / 4 GB / 60 GB | **Recommended for headroom** during updates, backups and traffic bursts. Start monthly with plain Ubuntu 24.04 LTS and persistent local SSD. |

Prices, provider CPU performance, bandwidth and backup terms were not supplied. This is not a traffic-capacity guarantee. No server GPU or MariaDB is needed.

## Fixes

- Removed unused Vinext/Cloudflare/RSC/shadcn tooling; updated Express, Vite, formatter and affected transitive dependencies. Initial production scan: 20 advisories, including one critical. Final full dependency audit: **zero known advisories**, a time-bound result rather than a penetration-test certificate.
- Production refuses a missing/zero-byte database without explicit first-install initialization. Restarting an intentionally emptied existing catalog no longer reseeds deleted records.
- Health checks query SQLite and return 503 on failure. Unique conflicts, temporary locks and internal failures have distinct safe responses. SIGTERM drains HTTP and closes SQLite.
- Production CSP blocks inline executable scripts and unrestricted WebSocket connections. Mutation origins now check scheme and host.
- Fixed Persian reverting to English during local production section navigation; canonical domain defaults remain intact. Disabled browser storage and malformed homepage hashes no longer break initialization.
- Added a source-only Ubuntu test image, Nginx certificate-bootstrap/HTTPS templates, config validation and migration/backup/rollback instructions. CI targets Ubuntu 24.04 and blocks on dependency advisories at moderate severity or above.

## Evidence

| Check | Result |
| --- | --- |
| Runtime | Node 24.21.0; Windows and Ubuntu 24.04 container |
| TypeScript / regression suite | Passed on both platforms; **57/57 tests** |
| Build / JS budgets | Passed; initial JS **81.8 KB gzip**, largest chunk **402.7 KB**, 18 chunks |
| Production smoke | Passed: bilingual pages, custom 404, metadata, admin setup, edits, inquiry, media, backup access, logout; Linux also verified clean SIGTERM exit |
| Resource constraint | All core checks passed under **1 CPU / 2 GiB / no swap**; build peak process RSS **653,772 KiB**, elapsed **2.91 seconds** |
| Config parsing | Both Nginx templates passed with throwaway certificates; service passed `systemd-analyze verify` |
| HTTP sample: 1 CPU / 2 GiB | 50 requests, concurrency 5, total 584 ms, p95 86 ms, server RSS 119,052 KiB |
| HTTP sample: 2 CPU / 4 GiB | 50 requests, concurrency 5, total 323 ms, p95 42 ms, server RSS 132,248 KiB |
| SEO | 110 products, 113 routes, 226 language variants; **0 findings** |
| Media | 35 local files tested with Pillow: 6 displayed family references decoded; **29 legacy paths failed** |
| Lint | **FAIL: 195 findings**, down from 203; no rules disabled to claim a pass |

Tests cover auth/roles, validation, engineering, catalog, media rejection, backup integrity/tamper detection, WAL recovery, database health and language behavior. The HTTP samples use loopback without Nginx/TLS, browser rendering, concurrent administrators or production uploads. They do not predict sustained traffic, internet latency, provider contention or whole-VPS memory. Reproduce with `node --import tsx scripts/capacity-check.ts` after building; it starts only its own disposable server.

Targeted browser checks covered English desktop, visible images/alt text, product image/exploded/documents panels, Escape/focus return, Persian navigation and product panels at 390 × 844, and no document horizontal overflow. No console errors were captured on these flows. The language-reset bug passed its browser retest. This is not a full screen-reader, Safari/Firefox/real-device or penetration audit.

## Open release gates

1. **Lint:** 146 explicit-`any` findings plus accessibility semantics, React effects/refs/dependencies, unused/deprecated API and configuration findings. Clean up typed API/CMS boundaries and components; do not disable the rules. CI lint remains advisory.
2. **Catalog:** 110 products lack approved exact-photo candidates and attached manufacturer PDFs; 42 have linked source-catalog PDFs, which are different. 68 lack source URLs, 42 have checked fields missing, and 57 require manufacturer/suffix review. Zero engineering differences from seed does not establish correctness. See [product checklist](CATALOG_CONTENT_AUDIT.md).
3. **Legacy assets:** reconcile 29 failed legacy references using approved exact assets. Current public presentation uses labeled family references; do not invent photographs or silently remove owner data.
4. **Host:** actual storage/WAL, service reboot/recovery, release persistence, firewall, both domains/TLS and renewal are unverified.
5. **Recovery:** migrate a verified complete owner-data backup and restore an off-server copy into staging. Provider snapshot claims are insufficient.
6. **Final audit:** finish admin UI upload/restore/role flows, cross-browser/accessibility/security and bilingual business-content review against the exact deployment commit.

A green core CI run does not approve public launch. Readiness is reported as evidence and open gates, not an invented completion percentage.
