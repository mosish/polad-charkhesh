# Technical catalog structured data — 31 October 2026

Search Console reported missing `offers`, `review` or `aggregateRating` for the Persian `51210` and `skf-6206-2rz` entries. These are required alternatives for Google's Product snippets, but the technical showroom has no published qualifying price, offer or review data. The prior descriptive Product markup did not meet those rich-result requirements.

The shared metadata renderer now describes each catalog page as a WebPage with a linked Thing containing the published item name, designation, description and eligible exact image. The reciprocal main-entity links resolve within the graph. It does not emit Product, Offer, Review or AggregateRating nodes. Company identity, website, catalog lists and breadcrumbs remain present, and canonicals, language alternatives and indexing are unchanged. Visible technical tables and all catalog records remain authoritative; no price, rating, review, stock claim or engineering value is introduced.

This applies to both server-rendered and browser-generated metadata for every catalog entry on both domains, rather than patching only Google's two current examples. It deliberately forgoes product rich-result eligibility until genuine qualifying data and a corresponding product decision exist; normal page indexing remains enabled. It is not a ranking guarantee.

Local validation passed 158 tests, TypeScript, lint, production build, bundle budgets and the isolated production smoke test. Regression coverage checks the reported entries in both languages, entity identity, graph links, breadcrumbs and the absence of fabricated commerce/review markup. Existing specification-table tests continue to verify published values. Deployment and Google's asynchronous validation outcome are recorded separately after publication; the report is not considered cleared merely because source checks pass.

References: [Google Product snippet requirements](https://developers.google.com/search/docs/appearance/structured-data/product-snippet), [Schema.org WebPage](https://schema.org/WebPage), [Schema.org Thing](https://schema.org/Thing).
