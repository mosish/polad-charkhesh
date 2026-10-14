# Loading performance — 2026-10-14

The owner confirmed that the published compatible 3D model appears and moves in Safari, then requested faster loading. This update keeps the same model geometry, motion, product specifications and bilingual presentation.

## Changes and measured payloads

| Payload | Before | After | Scope |
| --- | ---: | ---: | --- |
| Older Safari GPU modules | 320,962 bytes gzip | 134,679 bytes gzip | 58.0% less; capability detection selects one engine before downloading it |
| Modern GPU modules | 194,255 bytes gzip | 141,282 bytes gzip | 27.3% less; shared scene code uses explicit runtime imports |
| Six company font variants | 595,476 bytes | 272,688 bytes | 54.2% less; WOFF2 with the original TTF fallback |
| Seven family photos at the small display size | 3,439,046 bytes originals | 102,666 bytes WebP | 97.0% less across these seven assets; actual choices depend on viewport/DPR |
| Same small photo set, JPEG/PNG fallback | 3,439,046 bytes originals | 225,075 bytes | 93.5% less; older Safari retains supported fallback formats |
| Immediate public API refreshes | 4 requests | 0 requests | Fresh public records are already embedded in uncached production HTML |

Initial JavaScript is **84,203 bytes gzip**, compared with 84,039 before. It remains within the 100 KB budget; the main savings are deferred GPU modules, fonts and responsive pictures. These are reproducible asset-size comparisons, not a measured percentage improvement in whole-page load time or a Lighthouse score.

- The same Three.js model builder, geometry, RPM formulas, assembly/explosion and studio environment are used by both GPU engines. A modern context failure still attempts the compatible renderer; the existing SVG recovery remains available.
- Public HTML carries freshly read SQLite records. The provider parses this once and avoids downloading the same products/company/content/SEO immediately again. Dev/admin routes without a snapshot, explicit Retry and admin preview updates retain their API paths.
- Font encoding retains character maps, glyph order, horizontal metrics and layout tables. The company font remains IRANSans; original files are preserved.
- Responsive display copies derive only from seven existing family references, with their original attribution and status. Uploaded media and exact manufacturer URLs are unchanged. Product SEO HTML uses the same picture sources as React.
- Content-hashed WOFF2 and display images receive one-year immutable caching. Public data, authenticated pages and private APIs retain their existing cache policy.

## Verification

Windows TypeScript, **64 tests**, production build, module graph/bundle budgets and isolated production HTTP smoke pass. The smoke check also verifies WOFF2/WebP/JPEG delivery and immutable headers. Full repository lint remains at the existing 197 findings; targeted new files pass lint. No runtime dependencies were added.

A controlled 390px Chrome fixture denied WebGL 2, modern GPU downloads, newer media listeners and ResizeObserver. The real WebGL 1 model rendered, moved and paused; startup made zero duplicate public API requests, loaded WOFF2 instead of TTF and used a 480px WebP catalog picture. The product panel retained dimensions/load/speed fields and rendered its exploded model with WebGL 1. The normal path rendered a real WebGL 2 canvas with zero horizontal overflow. These controlled checks are distinct from a new physical Safari performance benchmark.

Private test fixtures, dependency encoders, request logs and databases remain excluded from Git.

## Publication

Revision `640b590a37aab56f4241d73565895f5ff6c9d74a` is active at the immutable VPS release directory. The transferred source archive SHA-256 is `466fa8c4205519d50195d492e87bedc8fe0574ac3773babc663b874edd38d46e`; checksum and safe archive paths passed. Package/lock inputs matched the previous release, so its installed Linux dependencies were reused. TypeScript, all **64 tests**, build, budgets and isolated smoke passed using the installed tools on Ubuntu.

A verified database/uploads backup preceded activation. The first attempt failed the health gate because root ownership made newly built private-mode output unreadable to the service account; the rollback restored the previous release. Read/execute access was corrected, checked as the service account and activation retried successfully. Published server/client entry files are root-owned mode 0644, with traversable directories. The previous release, hashed JavaScript and font assets are retained.

SQLite integrity and product/admin/settings/media row hashes matched before and after the successful switch. Counts remain **110 products / one administrator / zero registered uploads**. Application, Nginx and the certificate timer are active; domain/TLS, credentials and indexing settings remain unchanged.

External trusted-TLS verification passed **226 page/language variants, 110 products and six initial assets** at `2026-10-14T17:19:32.698Z`. Compressed font and both WebP/JPEG display copies return HTTP 200 with the correct MIME and one-year immutable headers. Live Chrome at **375 CSS pixels** renders a real moving WebGL 2 model, loads `/assets/index-Ddx4P9-B.js` and has zero horizontal overflow; the normal 1649px viewport also has zero overflow. A new physical Safari load-time benchmark was not performed.
