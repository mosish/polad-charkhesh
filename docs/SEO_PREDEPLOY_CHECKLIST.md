# Pre-deployment SEO checklist

Reviewed 2026-10-13. Source implementation and local verification only; **the website has not been deployed**. Hosting, DNS and HTTPS are still pending. The English origin remains `https://poladcharkhesh.com`; Persian remains `https://poladcharkhesh.ir`.

| Requested item | Status and evidence |
| --- | --- |
| Breadcrumbs | Visible semantic navigation on standalone catalog, engineering and product pages. The initial HTML, React navigation and BreadcrumbList JSON-LD use the same labels and hierarchy. Embedded homepage sections keep the one-page layout. |
| Connect custom domains | Configuration and launch instructions prepared; actual DNS and certificates require the selected server and domain access. See [deployment](DEPLOYMENT.md#connect-the-two-custom-domains). |
| robots.txt | Generated from the saved canonical domain; links to the matching sitemap and blocks `/api/`. Admin and missing pages serve `noindex,nofollow`, including an HTTP header in production. |
| Structured data | WebSite, WebPage/CollectionPage, catalog ItemList, descriptive Thing and BreadcrumbList. Noncommercial catalog entries do not emit incomplete Product snippets. No invented offers, prices or ratings; reference illustrations are not marked as exact item photos. |
| Canonical tags | One canonical per route, with query strings and trailing slashes normalized. English/Persian/x-default alternate links are included on public pages; unknown Host headers never become canonicals. |
| Meta descriptions | Saved bilingual page and product overrides are preserved; defaults fill blanks. Read-only audit covers all published records. |
| Custom 404 | Branded bilingual recovery page with catalog, home and engineering links. Unknown/archived product URLs return actual HTTP 404 from the production server. Vite preview alone is not an HTTP-status test. |
| Local business schema | LocalBusiness identity, logo, address, city, phone and email come from the published company record. No invented coordinates, reviews, hours or commercial claims. Owner verification of these details remains required. |
| sitemap.xml | Generated from SQLite published records, excluding archived products and admin routes. Both language hosts and alternate links are tested. |
| Favicon | Stable square SVG contains the supplied company logo unchanged, with a white surround. React no longer replaces it with the non-square original logo. |
| Internal links | Initial HTML exposes every published product and related components without JavaScript. The normal UI retains one-page section navigation and floating product panels. |
| Unique page titles | All 113 indexable routes audited separately in both languages. Owner SEO overrides remain editable; future duplicates cause audit failures. |
| Unique headings | Exactly one nonempty H1 per indexable initial page; titles/headings are checked for duplication. Hiding the hero leaves a visible company-name H1. Embedded sections use H2. |
| Reduce huge JS bundles | Three.js uses smaller lazy core/renderer chunks; the hero starts loading its scene near the viewport. Admin/PDF/3D remain outside the initial static module graph. Build budgets enforce a 450 KB maximum chunk and 100 KB initial gzip JS. |
| llms.txt | Dynamic UTF-8 guide with current company contact details, language origins, catalog, engineering and sitemap links. Discovered through a `rel="describedby"` link. This is an optional AI-reading proposal, not a substitute for robots, sitemap or search indexing. |
| Image alt text | Exact product images identify the component; reference images are described as references. Hero photo mode has an alt fallback. Decorative images next to equivalent text intentionally retain empty alt text. |
| Remove placeholder text | No recognized unfinished copy found in the published initial pages or metadata. Useful input hints, example calculation inputs and honest missing-media/reference notices remain. This automated scan does not replace an editorial review. |

## Repeatable verification

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm check:bundles
pnpm smoke:production
# Read the currently published public API without changing the database:
pnpm audit:seo --base http://127.0.0.1:5173
```

The smoke check uses its own disposable SQLite database, not owner data. It requests every indexable route on both language Host headers and checks initial titles, headings, canonicals and business schema, plus robots, sitemap, favicon, llms, private routes, 404 responses and existing admin/API workflows. The read-only audit writes findings under ignored `outputs/`; it never edits company/product records.

Local published snapshot: **110 products, 113 routes, 226 language variants, zero automated SEO-content findings**. Regression suite: **47 tests passed**. TypeScript, production build, bundle budgets and production smoke passed. Image licensing/exact-SKU correspondence, manufacturer ratings, full accessibility/security audit and repository lint remain separate release gates. The image-credits utility page is intentionally `noindex,follow` and excluded from the 113 indexable routes.

Final build: 19 JavaScript chunks, **81.8 KB initial gzip JavaScript**, **403.2 KB largest chunk** (PDF), versus a **546.9 KB** largest chunk before this phase. The 3D engine remains lazy, with separate core/renderer chunks of **189.3 KB** and **343.8 KB** plus its small environment module. Splitting improves individual chunk size and cache boundaries, not the total engine size; no measured network speedup or Core Web Vitals score is claimed.

Production browser checks used an isolated database: homepage canvas rendered; manual Exploded view retained Follow scroll; Persian catalog breadcrumb and H1 appeared; the mobile product panel rendered the exploded model and closed with Escape; the bilingual branded 404 rendered, with no horizontal overflow at 390 px. The favicon URL stayed stable after React initialization. The full device/browser matrix and formal accessibility review remain pending. Repository lint was rerun and remains at **210 existing findings**.

## References

- [Google: LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google: breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Google: favicon requirements](https://developers.google.com/search/docs/appearance/favicon-in-search)
- [llms.txt proposal](https://llmstxt.org/)
- [Rolldown: manual code splitting](https://rolldown.rs/in-depth/manual-code-splitting)

Rich-result display and search indexing are decided by search engines. Validate deployed URLs in Search Console and the Rich Results Test after HTTPS is active. Product markup here describes a technical showroom; do not fabricate prices, reviews or offers to satisfy commerce-result requirements.
