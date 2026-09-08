# Polad Charkhesh — Industrial Engineering Platform

A working B2B technical catalog and engineering application built from the Sites starter with a new public interface, new administration screens and a new Express/SQLite backend. It preserves the 68 canonical product records from `mosish/PoladCharkhesh` (main, revision prefix `12b8bc7`, inspected 2026-09-08).

## Run locally

Requirements: Node 24 and pnpm. Install with `pnpm install`, then run `pnpm dev`. The public site runs at `http://127.0.0.1:5173`; the API runs at `http://127.0.0.1:3001`. Both bind to loopback. SQLite initializes automatically and seeds an empty product table once.

`pnpm typecheck` checks application TypeScript. `pnpm test` runs isolated database/API/security/calculation regressions. `pnpm build` builds the frontend and Node backend. For production, configure the required secrets and set `NODE_ENV=production` before `pnpm start`.

## Capabilities

- Persian/English, RTL/LTR, domain-aware defaults and localized metadata.
- Search across codes, dimensions, names, applications and brands; family/dimension filters; grid/table display.
- Accessible native quick-view dialogs and dedicated `/product/:slug` pages.
- Product PDFs with names, specifications, sources, disclaimers and contact details.
- Idealized bearing motion, an axial half-section, dimensional envelopes and a labeled illustrative thermal model.
- Basic rating life, equivalent loads, static safety, reliability adjustment, unit conversion and clearance guidance.
- Persistent inquiry form; phone and WhatsApp consultation links. No e-commerce workflow.
- Protected administration for products, media, company, inquiries, bilingual content, SEO, backups and audit history.

## Important limits

The 68 technical records are preserved, not independently manufacturer-certified. Source verification dates are inherited. Corrupted reference images were replaced with credited family illustrations or dimensional drawings; these are not exact-SKU inventory photographs. Unsupported bearing arrangements stop with an engineering warning. The life tool is not complete modified ISO 281 life, and thermal values are illustrative.

The engineering model is idealized rather than a product-specific manufacturing model. Media association uses saved URLs; replacing a media item requires updating its associated product URLs. Backup JSON excludes uploaded bytes, which must be copied separately. Account roles are enforced, but there is no multi-user account editor. This local build has not been deployed.

The active brand assets use the logo and IRANSans font files supplied by the company. The original PNG is preserved unchanged; six font weights are self-hosted. Photograph attribution and share-alike license links are in `/asset-credits.html` and `public-site/reference-images`. The original corrupted images are excluded from active delivery.

See [architecture](docs/ARCHITECTURE.md), [data model](docs/DATA_MODEL.md), [administration](docs/ADMIN.md), [engineering calculations](docs/ENGINEERING_CALCULATIONS.md), [deployment](docs/DEPLOYMENT.md), and [validation report](docs/VALIDATION.md).
