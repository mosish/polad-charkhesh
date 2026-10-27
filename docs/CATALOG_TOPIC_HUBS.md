# Catalog topic hubs

Requested expansion, 2026-10-27. The category pages connect the catalog to individual technical records without changing product data or engineering approval status.

| Route on each language domain | Coverage | English guide words | Persian guide words |
| --- | --- | ---: | ---: |
| `/catalog/ball-bearings` | Deep groove, angular contact, self-aligning and thrust ball bearings | 338 | 350 |
| `/catalog/roller-bearings` | Tapered, spherical, cylindrical, needle and spherical thrust roller bearings | 349 | 357 |
| `/catalog/pillow-blocks` | Mounted units and housings, including the published UCP/UCF/SNL records | 351 | 352 |
| `/catalog/oil-seals` | Published industrial seal records; NBR/FKM identification and compatibility guidance | 345 | 357 |

Word counts cover the four guide paragraphs in each language, excluding headings, navigation and references. The guides are original application-review content with links to manufacturer references. Product and family suitability still require the current source documentation and application review.

## Public behavior

- Both server HTML and the React view expose the same category headings, guide text and matching catalog products. Guides remain readable without JavaScript.
- Each hub has a distinct title, description, canonical URL, English/Persian/x-default alternatives, CollectionPage and ItemList schema, and breadcrumbs. Query filters and trailing slashes canonicalize to the clean route. Unknown category paths return 404.
- Catalog and homepage category links lead to the hubs. Product pages link back to their hub; lubricants remain in the full catalog. Search, dimensions and family counts are scoped to the active hub.
- The dynamic sitemap now includes seven public page routes plus active product URLs: 117 URLs per domain for the current 110-product catalog. Archiving still removes a product immediately. `/llms.txt` also links to the hubs.
- The guides are loaded with the catalog feature rather than the initial JavaScript shell. The existing bundle budgets remain required.

## Product presentation and identity

Standalone product H1 headings include the published product name and complete code, plus the manufacturer where it is supported by the record. Server HTML, browser tables and Product schema share presentation helpers.

Specification tables expose recorded d, D, B, C, C₀, weight and available speed fields. Reference, thermal, limiting, grease and oil speeds retain separate labels. Missing quantities are shown as an em dash and omitted from numeric structured properties; zero is not presented as an operating rating.

Product JSON-LD includes the recorded model code. Brand/manufacturer fields require one distinct recorded brand and an HTTPS official catalog or product-table reference naming the complete designation. Alternative suffixes, competing brands, generic manuals and photographs do not establish a single manufacturer. This rule describes the source-backed record; it does not certify stock authenticity or grant engineering approval. No “genuine,” “high speed,” fireproof, price, offer or review claims are generated.

Existing product metadata overrides, specifications, source records, media, stock flags and engineering methods are preserved. The entire expansion is a presentation/routing change and does not migrate product records.

## Verification and release boundaries

Automated checks cover category membership (including thrust balls versus spherical thrust rollers), guide lengths, source HTML, canonical/hreflang behavior, scoped ItemLists, unknown routes, source-gated manufacturer claims, semantic tables and unchanged catalog records. Production smoke exercises both domains, all hubs, product routes and sitemap coverage. Browser review covers English desktop and Persian desktop/mobile layouts.

The runtime and nginx indexing gates remain locked. Category metadata is prepared for a future approved indexing release; the site is not made searchable by this change. Product schema is semantic product information and does not promise Google rich-result eligibility or ranking. Directory submissions remain with the owner.

Implementation: `domain/catalog-hubs.ts`, `domain/catalog-hub-guides.ts`, `domain/product-presentation.ts`, the shared SEO renderer and the catalog/product views.
