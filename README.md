# Polad Charkhesh

An English/Persian website for Polad Charkhesh: a company showcase, technical bearing catalog, interactive 3D views, and engineering reference tools. The site presents products and helps visitors understand them. It has no cart, prices, checkout, or online sales flow.

**Project status (2026-09-28):** The website and admin application run locally. Source is synced to this repository. The site has not been publicly deployed. The 68 imported product records need company and manufacturer review before publication, and exact product photographs and manufacturer PDFs still need to be added.

## Progress

| Area | Current state | Remaining work |
| --- | --- | --- |
| Public website | Responsive bilingual pages, company content, product catalog, and contact/inquiry flow work locally. | Review final company copy and contact details. |
| Product showroom | 68 seeded records; family, code, and dimension search; filters; product pages; up to three products in technical comparison. | Verify each record against its manufacturer and add exact product media. |
| Bearing visuals | Three animated homepage families with assembled/exploded views. Product pages and Bearing Explorer use on-demand 3D geometry and selected-product dimensions/RPM. | Replace illustrative geometry with verified models if exact manufacturer CAD becomes available. |
| Engineering workspace | Basic bearing-life calculations, comparison, fit/clearance references, and explained results. Unsupported cases are identified. | Have an engineer review values and guidance for production use. |
| Administration | Product, media, company, page-content, header, SEO, inquiry, backup, and audit screens are implemented. `/admin` and `/admin/` both open the admin route. | Create the first administrator in each new local/production database; back up the database and uploaded files. |
| Production launch | Frontend and Node API build successfully. | Configure hosting, HTTPS, persistent storage, secrets, backups, and final acceptance checks. |

The status is expressed as completed capabilities and open work rather than a percentage: a percentage would imply that unverified product data and launch readiness have been measured.

### Milestones

- **2026-09-08 — Platform foundation:** Migrated 68 catalog records, added the bilingual public site, protected admin, media and content editing, SQLite persistence, and initial engineering tools.
- **2026-09-08 — Visual exploration:** Added the liquid-glass styling, three bearing families, exploded views, a double-row spherical roller showcase, and product-aware Bearing Explorer geometry.
- **2026-09-09 — Technical showroom:** Added code/dimension search, bookmarkable filters, three-product comparison, product media and PDF support, manufacturer reference links, and a fit-limit explorer.
- **2026-09-09 — Presentation refinement:** Improved homepage accessibility, image sizing, product cards, and dark visual details.
- **2026-09-28 — Admin route repair:** Fixed the trailing-slash route so `/admin/` opens the admin panel. Type checking and the production build passed. The latest full automated suite has 19 passing tests.

### Next priorities

1. Confirm company identity, contact details, and all 68 imported technical records with the business and original manufacturers.
2. Add exact product photos and manufacturer-issued documents through the admin panel. Current family reference images and company-generated datasheets must remain clearly labeled.
3. Prepare production hosting and a backup routine for the SQLite database **and** uploaded files, then perform a full browser and security review before launch.

When a website change is completed, update this section in the same commit: change the status date, record the outcome and verification in one milestone line, and revise the remaining work. Do not mark a capability complete solely because code was written. Changes made directly in the admin panel live in the local database, so GitHub cannot update this progress section automatically from those edits.

## Run locally

Requirements: Node.js **22.13 or newer** (Node 24 recommended) and pnpm.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the [website](http://127.0.0.1:5173/) or [admin panel](http://127.0.0.1:5173/admin/). The API listens on `http://127.0.0.1:3001`; both services bind to the local computer. On a fresh database, the admin page asks you to create the first administrator. There is no default username or password. Use a password of at least 12 characters.

```bash
pnpm typecheck
pnpm test
pnpm build
```

The local SQLite database is created in `data/platform.sqlite`, with uploads under `data/uploads`. These and local secrets are intentionally excluded from Git. Copy both data locations for a complete content backup. Admin backup JSON excludes account credentials and uploaded file bytes; see the [administration guide](docs/ADMIN.md).

## Technical scope and limits

The client uses React, TypeScript, Vite, and Three.js. The local/production server uses Express on Node and SQLite. Product records are seeded only when the product table is empty. Public pages and the API are separate parts of one local development process.

The 3D bearing geometry illustrates product families and uses catalog dimensions; internal raceways, cages, and rolling-element details are estimates rather than manufacturer CAD. The generated PDFs are Polad Charkhesh summaries of imported data, not manufacturer-issued certificates or catalogs. Reference images may represent a family rather than the exact SKU. Engineering calculations are guidance, not a substitute for manufacturer selection and application review.

This repository contains source and bundled public assets. It does **not** contain a running site's admin accounts, saved database content, or uploaded files. Pushing to GitHub does not deploy the website.

More detail: [architecture](docs/ARCHITECTURE.md), [data model](docs/DATA_MODEL.md), [administration](docs/ADMIN.md), [engineering calculations](docs/ENGINEERING_CALCULATIONS.md), [deployment](docs/DEPLOYMENT.md), and [validation history](docs/VALIDATION.md).
