# Architecture

The Sites starter supplies the React/TypeScript project and UI dependencies. The requested Linux VPS target uses a Vite client build and an Express 5 API on Node 24. SQLite is authoritative; browser storage holds only the language preference. Nothing is published.

- `app/Router.tsx`: route selection and lazy loading for catalog, product detail, engineering and administration.
- `components/platform`: public interface, reusable modal, product views, inquiry form and geometry tools.
- `components/admin`: authenticated administration and grouped editors.
- `domain`: canonical product contracts, the 68-product migration seed and reference company information.
- `lib`: centralized API client, engineering calculations, metadata, media resolution and PDF generation.
- `api`: separate authentication, products, content/inquiries, media and backup domains.
- `tests`: isolated SQLite and HTTP regression tests.

New data mappings preserve complete JSON product records behind explicit validation. SQLite also stores indexed identity/category/archive columns. This prevents the source implementation's lost optional engineering fields. Source data is seeded only into an empty product table.

Reference: `mosish/PoladCharkhesh`, default branch main, revision prefix `12b8bc7`, downloaded 2026-09-08. All 68 product identities and technical fields were retained. Source source-verification claims are inherited and explicitly labeled as such.

The old public components, old API and unused administration implementation are not part of the new application. The new frontend and API do not use the reference's runtime data service or its local fallbacks. The bundled Sites/Vinext dependencies remain available; the VPS build is explicitly selected by `vite.vps.config.ts`.

## Hosting conflict resolved

The brief requests both Sites and a Node/Express/SQLite VPS, and explicitly says not to deploy. This deliverable therefore remains local, with a Sites-scaffolded project and a VPS-compatible build. It is not a Cloudflare Worker deployment. A future Sites-hosted runtime would require moving the persistence and auth adapters to supported platform services; do not upload the Node server archive as a Worker.
