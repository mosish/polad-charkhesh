# Safari startup and mobile recovery — 2026-10-14

**Status: local checks passed; VPS hotfix publication awaiting verification.** The owner reported that `poladcharkhesh.ir` briefly displayed its contents in Safari, then left only the blue background. The exact iOS/Safari version and device console error have not been supplied.

## Reproduced failures and correction

An isolated loopback test server with a disposable database reproduced an empty React root when modern MediaQueryList event methods and ResizeObserver were unavailable. The console reported `addEventListener is not a function` and `ResizeObserver is not a constructor`; root text length became zero. This establishes two real startup failure paths matching the symptom, but does not identify the exact exception on the owner's physical phone.

- Motion and navigation listeners now use MediaQueryList's legacy `addListener`/`removeListener` when EventTarget methods are unavailable, with matching cleanup.
- Resize and visibility observers are optional; existing window resize/scroll handling and static content remain usable without them.
- Scene, catalog and engineering failures are isolated by React error boundaries. A failed lazy scene cannot unmount the company page. A failed catalog retains the server-rendered list of published products with working product links.
- A final startup boundary preserves the escaped public HTML sent by the server if an unexpected application error escapes a section. Admin routes have no public HTML snapshot; authentication and account data are not included in this recovery path.
- Mobile scenes omit desktop companion models at construction time and disable expensive antialiasing. Environment-map and renderer failures fall back locally. Product dimensions, motion formulas, assembled scroll behavior, exploded mode and owner data are preserved.

## Verification

TypeScript, all **59 tests**, production build, bundle budgets and the isolated production smoke check passed on Windows. The two new regression tests cover modern and legacy motion subscriptions and cleanup. Initial JavaScript is **82.5 KB gzip**; the largest generated chunk is 402.7 KB, within the existing budget.

Chrome tests used a loopback-only, same-origin 390px iframe. Its content width was 375px with the scrollbar, and 390px while the product dialog locked scrolling; scroll width matched client width. Only the disposable fixture relaxed its iframe headers; production frame/CSP protections were unchanged. This is browser simulation, not a physical Safari audit.

| Scenario | Result |
| --- | --- |
| Legacy media listeners and missing ResizeObserver | Full interactive content remained; one WebGL canvas rendered; no new startup exception |
| Mobile navigation and `6204` search | Menu opened/closed; two matching products appeared; no horizontal overflow |
| Product panel and exploded view | Correct code/specifications remained; one product canvas rendered; dialog matched device width |
| Intentionally rejected scene JavaScript | Local fallback appeared; catalog and the rest of the page remained |
| Intentionally rejected catalog JavaScript | Readable links to all 110 products remained; engineering section remained |
| Intentionally thrown startup capability error | Readable server-rendered page, all 110 product links and contact link survived |
| WebGL unavailable | Model fallback appeared; company/catalog content remained |

Private test fixtures and screenshots remain under ignored `work/`; they are not included in the deployed application. No local owner database, account or uploaded media was used for testing. Actual-device confirmation is still requested after publication. The existing `.com` registrar blocker and Cloudflare network-check limitations are independent of these frontend corrections.

## VPS publication

Pending the pinned release, data-preservation check, server checks and live-domain verification. Keep existing domain routing, HTTPS settings and noindex acceptance gate in place.
