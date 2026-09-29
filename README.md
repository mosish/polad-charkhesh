# Polad Charkhesh — پولاد چرخش

> **Project status:** Integration and launch preparation; not yet production ready
>
> **Source of truth for code:** GitHub `main`
>
> **Last status review:** 2026-09-29

Polad Charkhesh is a bilingual Persian/English industrial engineering website for presenting the company, bearings, technical product information, documents, interactive models, and engineering tools.

This is **not an online shop**. There are no prices, carts, checkout, payments, or Buy Now flows. The intended visitor journey is:

**Find a product → Review its specifications → Explore engineering guidance → Read its documents → Contact Polad Charkhesh**

---

## Current project status

The main local feature set is implemented. The current work is to **stabilize, verify data and content, test complete workflows, prepare deployment, and then launch**. A working local build does not mean the product data or production environment has been approved.

| Area | Status | What this means now |
| --- | --- | --- |
| Public website and industrial visual system | 🟢 Implemented | Responsive dark glass design, company branding, and public sections are in place; final device review remains. |
| Persian/English experience | 🟢 Implemented | RTL/LTR and language switching exist; final copy parity needs review. |
| Canonical product seed | ✅ Verified in tests | All 68 imported identities and engineering fields are preserved; manufacturer values still need business verification. |
| Catalog search and product comparison | ✅ Verified in tests | Family/code/dimension filtering and up to three-product comparison are implemented. |
| Product detail pages and documents | 🟢 Implemented | Specifications, 3D view, company-generated PDF, and attachment support exist; exact SKU media are incomplete. |
| Animated bearing visuals | 🟢 Implemented | Five homepage family illustrations and assembled/exploded views; the product-specific Explorer also separates its four main assemblies. Models are illustrative. |
| Engineering workspace | 🟢 Implemented | Basic life, fit/clearance guidance, comparison, and RPM-driven exploration; application review remains essential. |
| Express API and SQLite persistence | ✅ Verified in tests | Products, settings, inquiries, accounts, media metadata, and audit records persist locally. |
| Admin authentication and roles | ✅ Verified in tests | Server sessions, first-run setup, protected APIs, and role checks are implemented. |
| Admin content and product editing | 🟢 Implemented | Website, header, company, SEO, and product controls exist. The dashboard, duplicate draft, featured shortcut, and grouped company settings were checked locally; complete browser workflow audit remains. |
| Physical media upload | 🟢 Implemented | PNG, JPEG, WebP, and PDF upload/delete are supported; production storage and backup need checking. |
| Inquiry and audit workflows | ✅ Verified in tests | Inquiries persist with status changes; audit events are recorded. |
| Backup and restore | 🟢 Implemented | Data export/restore is tested; uploaded file bytes and account secrets are outside backup JSON. |
| Exact product photos and manufacturer PDFs | 🟡 Pending content | Family reference images and company-generated datasheets must not be presented as exact manufacturer assets. |
| Full browser, accessibility, and security audit | 🟡 Pending | Targeted checks exist, but a final end-to-end production review has not been completed. |
| Multi-contributor coordination | 🟢 Documented | The GitHub workflow guide covers branch checks and synchronization; no automated enforcement is configured. |
| VPS deployment and production smoke test | ⬜ Not started | No public deployment has been performed. |

**Legend:** ✅ verified in an applicable test or check · 🟢 implemented, with final review remaining · 🟡 pending work or validation · ⬜ not started · 🔴 blocked.

The last full automated suite passed **20 tests**. The latest admin integration passed TypeScript checking and a local browser interaction check, including saving a duplicated product into an isolated test database. These checks do not replace final device and product-data review.

---

## Admin and CMS status

The admin panel is a website control center at [`/admin/`](http://127.0.0.1:5173/admin/). Both `/admin` and `/admin/` are supported. A new database shows **Create administrator**; there are no default credentials. Administrator accounts are local runtime data and are not stored in GitHub.

Its current modules are Overview, Products, Media, Company, Inquiries, Website editor, Header, SEO, System & security, and Audit logs.

### Product management

Administrators can:

- Create and edit product identity, specifications, applications, sources, and technical fields.
- Start a new product draft from an existing record, then enter a new code and slug and review its technical fields before saving.
- Toggle a product's featured status from the catalog list.
- Set featured/availability fields and attach a gallery image or PDF document.
- Archive and restore records; permanent deletion requires an archived record, a super-admin, and typed confirmation.

The 68 imported products are preserved as a seed; future edits live in SQLite. Duplication does not alter the source record or silently create a catalog item: it opens a reviewable draft.

### Website content and company settings

The bilingual editor covers major homepage sections, their order and visibility, custom sections, cards, navigation, public text, brand colors and images, and a preview before saving. Header, company/contact information, product records, and SEO each have dedicated controls.

Routine changes to company identity, addresses, phone/WhatsApp/email, headings, descriptions, logos, and imagery can be made without editing source code. Public components should use that saved content instead of duplicating it. Engineering formulas and arbitrary page code cannot be changed in the panel.

### Inquiries, media, and backups

Inquiries follow **New → Reviewed → Contacted → Closed**. The Media module stores actual uploaded image/PDF files under `data/uploads` and keeps their metadata in SQLite. Product and website editors can select uploaded media. Deletion is refused while a file is still referenced.

Backup JSON includes catalog, content/settings, inquiries, and media metadata. It excludes passwords, sessions, and the uploaded file bytes. A complete backup must also copy `data/uploads` and preserve the SQLite database with a safe database backup procedure. See the [admin guide](docs/ADMIN.md).

---

## Architecture and data authority

- **Frontend:** React 19, TypeScript, Vite, Three.js, responsive Persian/English and RTL/LTR UI.
- **Backend:** Express on Node, SQLite, server-side sessions, signed HttpOnly cookies, protected admin endpoints, validation, and audit logging.
- **Runtime data:** SQLite is authoritative for saved products and website content. The bundled catalog seeds an empty product table; it does not overwrite later admin edits.
- **Local paths:** `data/platform.sqlite` for the database and `data/uploads` for uploaded files. Both are excluded from Git.

The current Node/SQLite application is prepared for a VPS. It is not a Cloudflare Worker deployment. Pushing source to GitHub does not publish the site. See [architecture](docs/ARCHITECTURE.md), [data model](docs/DATA_MODEL.md), and [deployment preparation](docs/DEPLOYMENT.md).

## Product and engineering principles

Products are engineering catalog entries, not retail merchandise. A product may include designation, family, manufacturer reference, dimensions, load/speed ratings, applications, source notes, gallery images, and documents.

The 3D views use catalog dimensions and vary rolling-element types, but raceways, cages, and internal details are illustrative estimates rather than manufacturer CAD. The generated PDFs are Polad Charkhesh summaries of imported records, **not manufacturer-issued documents**. Family reference images are labeled and are not exact-SKU photographs. Basic bearing-life and fit results are guidance, not a substitute for manufacturer selection or review of operating conditions. See [engineering calculations](docs/ENGINEERING_CALCULATIONS.md).

## Design and language direction

The site uses the company-supplied logo and self-hosted **IRANSans** font, with a dark blue glass interface and restrained metallic accents. The brand colors are configurable in the admin editor. Persian is the default on `.ir`, English on `.com`, and visitors can switch language manually. New content should remain readable and usable in both directions.

## Business rules

Keep the public experience focused on company presentation, technical discovery, and direct consultation. Do not add online prices, a cart, checkout, payment, Buy Now, or retail purchasing flows. Product accuracy and clear explanations matter more than adding new visual features.

---

## Development history

- **2026-09-08 — Foundation:** Built the public site, migrated the 68-product seed, added Express/SQLite, server-side admin authentication, editing, inquiries, backups, and initial engineering tools.
- **2026-09-08 — Bearing experience:** Added liquid-glass styling, animated families, exploded views, double-row spherical rollers, and product-aware 3D Bearing Explorer models.
- **2026-09-09 — Showroom and engineering:** Added code/dimension search, bookmarkable filters, comparison, product media/PDF support, fit-limit exploration, and manufacturer reference links.
- **2026-09-09 — Presentation refinement:** Improved homepage accessibility, image sizing, cards, and dark visual details.
- **2026-09-28 — Admin route repair:** Made `/admin/` resolve to the same admin page as `/admin`; type checking and production build passed.
- **2026-09-28 — Project documentation:** Established this status dashboard and a same-commit README update practice.
- **2026-09-28 — Family showcase and Explorer:** Expanded Precision in Motion to ball bearings, roller bearings, bearing accessories, engineered products, and track rollers. Added an assembled/exploded control to the product-specific Bearing Explorer, with labeled assemblies and paused rotation during inspection.
- **2026-09-29 — Admin control center integration:** Compared the separate `PoladCharkhesh-local` admin and brought its useful dashboard and product-management patterns into this panel: grouped icon navigation, catalog and activity metrics, duplicate-as-draft, featured shortcut, and grouped bilingual company fields. The separate database and credentials were not imported because its catalog has unresolved differences.

## Remaining roadmap

1. **Integration audit:** Check each visible admin flow from UI through API and SQLite to the public site, including product editing/archive, company settings, CMS preview/save, uploads, inquiry statuses, SEO, account roles, restore, and audit logs.
2. **Data and media verification:** Review company details and all 68 imported records against original manufacturer data. Add exact product photographs and manufacturer-issued documents where approved.
3. **Browser and accessibility QA:** Exercise desktop, tablet, mobile, Persian RTL, English LTR, forms, dialogs, loading/error states, keyboard access, and reduced motion.
4. **Production readiness:** Verify secrets, HTTPS and reverse proxy behavior, cookies, rate limits, persistent paths, permissions, logs, and recoverable backups of SQLite and uploads.
5. **Deployment candidate:** Once launch blockers are resolved, rerun type checks, tests, build, and end-to-end checks; identify the release commit or tag.
6. **VPS deployment and smoke test:** Deploy the approved candidate, then verify domains, assets, login, content edits, product pages, inquiries, backups, and logs in production.

Any visible admin control should work end to end or be clearly disabled before launch. Future work should prioritize verified gaps and launch blockers over speculative features.

---

## Run locally

Requires Node.js **22.13 or newer** (Node 24 recommended) and pnpm.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the [public site](http://127.0.0.1:5173/) or [admin panel](http://127.0.0.1:5173/admin/). The API listens at `http://127.0.0.1:3001`. First-run admin setup requires a username and a password of at least 12 characters. In production, a server-side setup token is also required.

```bash
pnpm typecheck
pnpm test
pnpm build
```

Do not commit `.env`, `data/`, uploaded files, or credentials. GitHub contains the application source and bundled public assets, not the running site's private content. The [GitHub workflow guide](docs/GITHUB.md) explains synchronization.

## README update policy

This is the living project-status document. With **each completed source change**, update it in the same commit: review the date and status table, record a meaningful milestone or revision, and change the roadmap when a blocker is resolved or discovered. Use ✅ only when the relevant behavior has been verified, not merely implemented. Review the latest `main` and other active work before editing so one contributor does not overwrite another's changes.

Admin-only edits change the local database rather than this repository. They cannot update the README automatically; record them here when they become a meaningful project milestone. Older plans and screenshots provide context, while the current code and verified behavior determine status.

## Current development rule

GitHub `main` is the source of truth for application code. Before work, read the latest branch, recent commits, and any active work so changes are not duplicated or overwritten. Preserve catalog identities and engineering integrity. Make the smallest necessary change, run checks appropriate to it, update this status document, and sync the verified result.

## Launch philosophy

Major local features are already present. Prioritize launch blockers, real product data, integration defects, security, backups, and deployment preparation. Defer unrelated feature expansion until the site is stable and the business approves its public content.
