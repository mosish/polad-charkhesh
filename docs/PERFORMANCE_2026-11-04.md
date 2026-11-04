# Public rendering and resource improvements

The catalog could mount a short Suspense placeholder before its route module was ready, moving the footer above the results and then back down. Keep the public server HTML until the selected module is available and pass that resolved component into the router. Route chunks remain split; loading failures still enter the existing recovery boundary.

The primary CMS headline now paints complete before subsequent typing transitions. Its animated text does not participate in grid sizing. Scroll-reveal reads geometry before applying classes and ignores text-only mutations, avoiding repeated layout work as the title types. GPU capability detection waits until after the first portable scene/headline paint; renderer compatibility fallback, pause, reduced motion, trio and scroll controls remain intact.

The bundled logo gets content-hashed 64/128px WebP sources with the original PNG in picture fallback; custom uploaded logos stay authoritative. The 48px PNG favicon is 1,933 bytes, compared with the existing 22,282-byte SVG. Both original assets remain available. Only hashed brand assets get immutable caching. The used medium font joins the regular weight preload; other weights remain demand-loaded.

Controlled before/after checks use production-mode loopback servers, identical synthetic catalog defaults, 390×844 viewport, 4× CPU slowdown and Fast 4G emulation with warm resource caches. They do not measure the production network or real-user INP:

| Page | Before LCP / CLS | After LCP / CLS |
| --- | --- | --- |
| English catalog | 1,443 ms / 0.23 | 413–498 ms / 0.00–0.03 |
| Persian catalog | 1,536 ms / 0.23 | 626–674 ms / 0.00–0.02 |
| English home | 1,400 ms / 0.01 | 705 ms / 0.01 |

These are individual lab runs, not field percentiles. Full performance traces and private account evidence are kept outside source control. Source-quality and production-smoke checks are required separately from browser/target acceptance.

The live check now includes all four catalog guides, exact language-domain canonical/hreflang targets and parseable JSON-LD. It does not invent commerce offers, change product identities, approve engineering data or alter indexing. Existing source SEO audit passes against both public snapshots (110 products, 117 routes and 234 generated language variants per snapshot). Search Console outcomes are recorded only in the owner's private handoff.
