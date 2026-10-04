# Search visibility and SEO

Updated: 2026-10-04. Implemented and tested locally; this document does not assert that either public domain is deployed, indexed or verified.

## Languages and URLs

The owner confirmed `https://poladcharkhesh.com` for English and `https://poladcharkhesh.ir` for Persian. Serve both domains from the same published application and persistent database. The hostname determines the default language. Explicit `?lang=en` / `?lang=fa` still works for local previews; production language switching follows the configured counterpart domain and retains the current section/product selection.

| Public resource | Search URL |
| --- | --- |
| Homepage and company sections | `/` |
| Complete component catalog | `/catalog` |
| Mechanical engineering reference workspace | `/engineering` |
| Individual specifications | `/product/{slug}` |

The site remains a single-page experience for normal navigation and floating product panels. Real specification links and dedicated catalog/engineering URLs remain available to search crawlers and visitors who open a link in another tab. Hash sections are not separate sitemap pages. Search/filter and panel query parameters canonicalize to the clean public route. Trailing slashes share the same normalized canonical.

Every indexable page has equivalent reciprocal English/Persian and `x-default` alternate URLs. Each language canonical points to its own configured domain. Initial language and metadata come from the same server snapshot, rather than a saved browser preference silently replacing the server language.

## Editing search content

Open **Admin → SEO**:

- Set English/Persian homepage titles and descriptions.
- Edit the catalog and engineering titles/descriptions independently under **Page-specific metadata**.
- Review a live search preview for public pages and every active product; the preview is illustrative, because search engines choose their final snippets.
- Set the canonical domains as clean HTTPS origins, without credentials, paths, query parameters or fragments.
- Set the social sharing image URL. The included branded image is `/brand/social-preview.png`, 1200 × 630 pixels; an uploaded public image can replace it.
- Paste only a real Google Search Console verification token if using HTML verification. Leave it blank until Google supplies the token; domain-property DNS verification is performed separately through the domain provider.

Open **Admin → Products → edit product → SEO** for product-specific English/Persian titles and descriptions. Missing fields receive descriptive defaults based on the product code/name and existing dimensions. Existing nonblank overrides are retained. On startup, the SEO migration fills missing metadata without normalizing engineering values, changing media or overwriting owner copy. Source-seeded metadata receives the same enrichment, and legacy backups add the new page-settings group on restore.

Keep titles distinctive and descriptions accurate. Character counts help editing, but there is no guaranteed character count at which Google displays a complete snippet. The legacy editorial keywords field is kept for administration; it does not produce a `meta keywords` tag or imply a Google ranking benefit.

## Content and structured data

In production, Express sends public content before JavaScript executes: published company sections, catalog links and product specifications, applicable document/source links and related components. The same HTML is served to every visitor; React then replaces the initial document with the interactive site. No bot detection, hidden keyword blocks, draft sections, account data or archived records are embedded. Hidden/disabled CMS sections are excluded. Interactive calculations and 3D models need JavaScript; their surrounding reference content remains accessible.

The browser refreshes the existing head through the same renderer used by the server. Only one JSON-LD graph is present. It includes Organization, WebSite and WebPage/CollectionPage data, breadcrumbs on standalone pages, an ItemList for the catalog, and Product specifications on product pages. Organization contact details and address come from the company settings. Family illustrations are labeled and omitted from Product.image; a non-reference product image can be used when available. A product with multiple referenced manufacturers is not assigned an invented brand or manufacturer part number.

There are no commerce offers, fabricated prices, ratings or reviews. Product schema is descriptive; it does not claim Google product rich-result eligibility. Google requires additional qualifying properties for product snippets, and those must never be invented just to satisfy a validator.

The image-credit utility page has `noindex,follow` and stays outside the sitemap. Admin, unpublished preview URLs, missing pages and archived products have `noindex,nofollow`. The server also sends an `X-Robots-Tag` for these responses. Unknown/archived specification pages return 404; malformed URL encoding is rejected with HTTP 400 by Express. Robots excludes API endpoints but allows Google to retrieve admin/preview pages and see their `noindex` directives. Admin/API authentication remains the protection for private functions.

## Sitemap and launch steps

`/sitemap.xml` is generated from active records on each domain. It currently lists 113 canonical URLs per language: three public pages plus 110 products. Each entry identifies the equivalent language URLs. Archived products disappear immediately. No false `lastmod` timestamp is generated from an old seed date or server startup. `/robots.txt` advertises the sitemap for the domain receiving the request.

After hosting and TLS are configured:

1. Confirm both HTTPS domains serve the same published app and the intended language. Configure HTTP and alternate-host redirects at the proxy/hosting layer.
2. Verify each domain in Google Search Console using the actual account-provided token or DNS record. Submit that domain's `/sitemap.xml`.
3. Inspect homepage, catalog, engineering and several product URLs in Search Console. Confirm the fetched HTML, selected canonical and language associations.
4. Test structured data in Google's Rich Results Test and the Schema.org validator. A noncommercial Product page is not promised an enhanced product listing.
5. Check the sharing image on the live host, and measure mobile Core Web Vitals/PageSpeed on the deployed site. Local correctness checks do not establish live performance scores.
6. Continue reviewing exact product photographs, authoritative engineering data, bilingual content, media licensing and accessibility/security release gates.

## Verification

Run `npm test`, `npm run typecheck`, `npm run build`, then `npm run smoke:production`. The smoke check uses a temporary database and upload folder; it exercises both domains, source HTML, metadata, sitemap counts, preview/admin exclusion, custom product metadata, archival and the sharing asset without editing the owner's local data.

Targeted isolated browser verification also checked all 220 product responses, unique titles, server/browser metadata parity, one schema graph, floating panels, language switching/reload, admin SEO editing/saving, Persian mobile overflow and content with JavaScript disabled. Repository-wide lint remains a separate unresolved check; this SEO work does not mark the project ready for deployment.

## Official references

- [Google: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: localized versions and hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: product snippet requirements](https://developers.google.com/search/docs/appearance/structured-data/product-snippet)
