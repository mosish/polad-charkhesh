# Safari startup and mobile recovery — 2026-10-14

**Status: startup hotfix published; owner confirmed content remains on Safari.** The owner reported that `poladcharkhesh.ir` briefly displayed its contents in Safari, then left only the blue background. After confirming recovery, the owner reported stationary bearing models; [the animation follow-up](MOBILE_ANIMATION_2026-10-14.md) addresses this separately. The exact iOS/Safari version and original device console error have not been supplied.

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

Private test fixtures and screenshots remain under ignored `work/`; they are not included in the deployed application. No local owner database, account or uploaded media was used for testing. After publication, the owner opened the fresh-query link in Safari and replied that it was fixed. This is owner confirmation, not a full physical-device accessibility audit. The existing `.com` registrar blocker and Cloudflare network-check limitations are independent of these frontend corrections.

## VPS publication

- Published pinned revision `ece390686c8a5d2f30eea94fc2d0f6e862cc46be` at `/opt/polad-charkhesh/releases/ece390686c8a5d2f30eea94fc2d0f6e862cc46be`. Source archive SHA-256 was verified before extraction; runtime files were excluded. Dependency inputs matched the previous release after CRLF/LF normalization, so the same installed dependencies were reused.
- Ubuntu TypeScript, all 59 tests, build, bundle budgets and isolated production smoke passed before activation. The previous release remained in service during preparation.
- A verified private database/uploads backup preceded the switch. `current` was switched atomically with a rollback trap, then the supervised application restarted. The first health attempt returned 502 during startup; retry returned healthy.
- Before/after checks verified SQLite integrity and identical row hashes for products, administrator, settings and media. Counts remained **110 products / one administrator / zero registered uploaded files**. Hashes and backup contents stay private.
- Retained previous hashed client assets alongside the new assets so tabs opened before rollout can finish their lazy imports. The live Persian HTML references `/assets/index-B44LGZDC.js` from the new build.
- The external trusted-TLS live check passed at **2026-10-14T14:37:36.396Z**, covering 226 page/language variants, 110 products, five referenced assets, admin/SEO/404 routes and private-API denial. This uses the workstation's public DNS path and does not prove all Cloudflare network paths.
- Chrome verified the new production bundle at 375 CSS pixels: full main content, one visible hero canvas, no recovery alert and no horizontal overflow. Temporary viewport changes were reset afterward.
- Domain routing, Full (strict), renewal, session secrets, account credentials and the noindex acceptance gate were retained. Nginx, application and the renewal timer were active. The owner opened `https://poladcharkhesh.ir/?mobile-check=ece3906` and confirmed: “بله، درست شد” (yes, it is fixed).
