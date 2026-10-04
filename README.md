# Polad Charkhesh — پولاد چرخش

> **Project status:** Integration and launch preparation; not yet production ready
>
> **Source of truth for code:** GitHub `main`
>
> **Last status review:** 2026-10-04

Polad Charkhesh is a bilingual Persian/English industrial engineering website for presenting the company, bearings, technical product information, documents, interactive models, and engineering tools.

This is **not an online shop**. There are no prices, carts, checkout, payments, or Buy Now flows. The intended visitor journey is:

**Find a product → Review its specifications → Explore engineering guidance → Read its documents → Contact Polad Charkhesh**

---

## Current project status

The main local feature set is implemented. The current work is to **stabilize, verify data and content, test complete workflows, prepare deployment, and then launch**. A working local build does not mean the product data or production environment has been approved.

| Area | Status | What this means now |
| --- | --- | --- |
| Public website and industrial visual system | 🟢 Implemented | Responsive dark glass design, company branding, and a unified single-page public journey are in place; final device review remains. |
| Persian/English experience | 🟢 Implemented | RTL/LTR and language switching exist; final copy parity needs review. |
| Canonical product seed | ✅ Verified in tests | All 68 legacy identities are preserved, and 42 SKF sealed deep-groove designations bring the bundled catalog to 110 records. Current SKU verification remains a launch task. |
| Catalog search and product comparison | ✅ Verified in tests | Horizontal family filters and code/dimension search are in the catalog; up to three-product comparison is in the engineering workspace. |
| Product specifications and documents | 🟢 Implemented | A floating catalog panel groups images, specifications, exploded 3D, documents and contact actions. Related records open in the same panel and are ranked by family and dimensions. Exact SKU media are incomplete. |
| Animated bearing visuals | 🟢 Implemented | A T921-inspired tapered roller thrust illustration plus five existing family illustrations; reversible scroll-driven separation and recession into a subtle background, with manual assembly controls; the product-specific Explorer also separates its four main assemblies. Models are illustrative. |
| Engineering workspace | 🟢 Implemented | Life and known-load estimates show example results immediately and recalculate as inputs change. Fit limits, comparison, and unit conversion remain on the homepage; application review remains essential. |
| Express API and SQLite persistence | ✅ Verified in tests | Products, settings, inquiries, accounts, media metadata, and audit records persist locally. |
| Admin authentication and roles | ✅ Verified in tests | Server sessions, first-run setup, protected APIs, and role checks are implemented. |
| Admin content and product editing | 🟢 Implemented | Product editing, missing-content filters, bulk actions and reviewed JSON import/export are implemented and tested. SEO previews and saving were reviewed in an isolated browser session; full media, roles and restore UI review remains. |
| Physical media upload | 🟢 Implemented | PNG, JPEG, WebP, and PDF upload/delete are supported; production storage and backup need checking. |
| Inquiry and audit workflows | ✅ Verified in tests | Inquiries persist with status changes; audit events are recorded. |
| Backup and restore | 🟢 Implemented | Admin JSON export/restore is tested. A separate verified SQLite-and-uploads backup command is ready for an offline server backup; a live-host restore drill remains. |
| Technical SEO | ✅ Verified locally | English/Persian metadata for 110 products and three public pages, server-delivered content, canonical/hreflang, sitemap, structured data, sharing previews and admin editing pass targeted checks. Live Search Console and indexing remain post-launch tasks. |
| Exact product photos and manufacturer PDFs | 🟡 Pending content | Exact SKU photos are still missing. SKF's public product/image hosts blocked reliable access, so the 42 new records use clearly labeled family-reference visuals and link to SKF's official catalog. Admin uploads can replace each image later. |
| Full browser, accessibility, and security audit | 🟡 Pending | Targeted checks exist, but a final end-to-end production review has not been completed. |
| Repository lint | 🟡 Pending | TypeScript, tests, and production build pass; the repository-wide lint command still reports rule violations across application and test files. |
| Multi-contributor coordination | 🟢 Documented | The GitHub workflow guide covers branch checks and synchronization; no automated enforcement is configured. |
| VPS deployment and production smoke test | 🟡 Preparation | The built Node server passes an isolated production smoke check, and systemd/Nginx templates are available. Hosting, TLS, content approval and live verification remain. |

**Legend:** ✅ verified in an applicable test or check · 🟢 implemented, with final review remaining · 🟡 pending work or validation · ⬜ not started · 🔴 blocked.

The last full automated suite passed **34 tests**. TypeScript checking, a production build, and the isolated production smoke check pass. Targeted browser checks cover the public showroom and mobile layout; an isolated built-site session also verified admin setup, module navigation, product editing, unsaved website preview and save, inquiry review, and the phone-width module menu. These checks do not replace final device and product-data review.

## Public site layout

The primary visitor experience is one continuous page at `/`: company introduction, full searchable catalog, product specifications and documents in a floating panel, mechanical engineering reference tools, industries, and contact. The header and major calls to action jump to these sections instead of opening separate catalog or engineering pages. The catalog shows two complete product rows and a faded preview of the third, then reveals more on request. Family filters form one horizontal row, and text search covers codes, dimensions and applications. Product selection in the engineering heading supplies the calculation context. Product-specific geometry remains available in the product specifications experience. Existing `/catalog`, `/engineering`, and `/product/:slug` URLs remain available for old bookmarks and indexing.

Shareable one-page links include `/#catalog`, `/?q=6204#catalog`, `/?item=6204-2rs#catalog`, and `/?product=6204-2rs#engineering`. The admin website preview offers these same section views. Previously saved CMS links to the old catalog, engineering, and product paths are translated to their one-page targets when shown publicly.

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

The 68 legacy products remain unchanged; 42 SKF catalog entries are added once to existing databases without overwriting admin edits or archived records. Future edits live in SQLite. Duplication does not alter the source record or silently create a catalog item: it opens a reviewable draft.

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
- **Runtime data:** SQLite is authoritative for saved products and website content. The bundled catalog seeds an empty product table; the one-time SKF expansion inserts missing records into existing databases without overwriting admin edits.
- **Local paths:** `data/platform.sqlite` for the database and `data/uploads` for uploaded files. Both are excluded from Git.

The current Node/SQLite application is prepared for a VPS. It is not a Cloudflare Worker deployment. Pushing source to GitHub does not publish the site. See [architecture](docs/ARCHITECTURE.md), [data model](docs/DATA_MODEL.md), and [deployment preparation](docs/DEPLOYMENT.md).

## Product and engineering principles

Products are engineering catalog entries, not retail merchandise. A product may include designation, family, manufacturer reference, dimensions, load/speed ratings, applications, source notes, gallery images, and documents.

The 3D views use catalog dimensions and vary rolling-element types, but raceways, cages, and internal details are illustrative estimates rather than manufacturer CAD. The generated PDFs are Polad Charkhesh summaries of imported records, **not manufacturer-issued documents**. Family reference images are labeled and are not exact-SKU photographs. Basic bearing-life and fit results are guidance, not a substitute for manufacturer selection or review of operating conditions. See [engineering calculations](docs/ENGINEERING_CALCULATIONS.md).

The 42 new SKF entries are transcribed from the [official SKF sealed single-row deep-groove table, section 1.2](https://cdn.skfmediahub.skf.com/api/public/0901d1968063464b/pdf_preview_medium/0901d1968063464b_pdf_preview_medium.pdf). The table reports **reference** and **limiting** speed, which the site displays under those names rather than treating them as grease/oil-specific ratings. Blank cage, clearance, and application fields remain blank where this source did not identify them. These records are catalog references, not a claim that Polad Charkhesh stocks each variant.

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
- **2026-09-29 — Unified public page:** Brought the complete catalog, product specifications/documents, and the mechanical engineering reference tools into the homepage. Updated navigation, CTAs, saved-link compatibility, and admin preview targets to use section links. Retained legacy URLs for existing bookmarks. Removed horizontal overflow in English and Persian layouts.
- **2026-09-29 — Showroom refinement:** Moved product details into a compact image-and-specification panel, simplified the catalog to horizontal family filters and a two-row preview, and placed product selection beside the engineering heading. Removed the illustrative Thermal view because it did not calculate a defensible operating temperature.
- **2026-09-29 — Product specification actions:** Added an exploded view option to the floating product gallery and a direct exploded-view entry on full product pages for supported bearing models. Replaced the separate technical-inquiry action on full specifications with the existing product-specific engineering tools path; components without an applicable 3D assembly explain that limitation.
- **2026-09-29 — Product call choices:** Replaced the product specifications' engineering shortcut with direct mobile and central-office call actions in both the floating panel and full product pages. The numbers follow admin-managed company settings; the engineering workspace remains available from the main page.
- **2026-09-29 — Live engineering tools:** Removed the redundant Bearing Explorer and Clearance guide from section 03. Life and known-load modes now start with labeled example inputs and recalculate immediately on edits; a reset control restores the example. Fit limits, comparison, and unit conversion remain.
- **2026-09-29 — SKF catalog expansion:** Added 42 distinct SKF sealed deep-groove designations from an official SKF table, bringing the bundled catalog to 110. A one-time, conflict-safe migration adds them to existing admin databases; source links and separate reference/limiting speed fields keep provenance clear. Exact SKF SKU images remain pending a usable authorized asset source.
- **2026-09-29 — Deployment preparation:** Added an isolated built-server smoke check, corrected trailing-slash production routes including `/admin/`, required stable production secrets and absolute data paths, and created verified SQLite/upload backup tools plus generic VPS templates. Hosting and business-data approval are still pending.

### 2026-10-04 — Catalog workflow and experience

- Product panels now group documents and contact actions and offer nearby catalog records without leaving the panel. Suggestions rank family and dimensions; they do not certify interchangeability.
- Admin Products shows missing product images, incomplete specifications, missing source documents, and bilingual content gaps. Bulk feature/unfeature, archive/restore, and manufacturer assignment include a review step.
- JSON import/export and a downloadable template support up to 200 records per file. Imports match by code, preview individual field changes, validate the entire batch, reject stale previews, and save in one transaction. Existing omitted fields are preserved.
- Mobile navigation now opens as a compact menu, closes after selection or Escape, and supports both directions. 3D uses lower pixel density and 30 FPS on small screens, stops for reduced motion or hidden/offscreen views, and reuses per-frame objects. Product thumbnails load lazily.
- Validation: 26 automated tests, TypeScript, production build and smoke checks pass. A separate browser session verified related-product browsing, exploded geometry, Persian mobile navigation, admin bulk editing, import preview/save and JSON export without modifying the live database. Repository-wide lint and the broader final launch audit remain open.

## Remaining roadmap

1. **Integration audit:** Check each visible admin flow from UI through API and SQLite to the public site, including product editing/archive, company settings, CMS preview/save, uploads, inquiry statuses, SEO, account roles, restore, and audit logs.
2. **Data and media verification:** Review company details and the 68 legacy records against original manufacturer data. Recheck the 42 SKF additions against current SKU pages and attach exact product photographs and manufacturer-issued documents when an authorized asset source is available.
3. **Browser and accessibility QA:** Exercise desktop, tablet, mobile, Persian RTL, English LTR, forms, dialogs, loading/error states, keyboard access, and reduced motion.
4. **Production readiness:** Verify secrets, HTTPS and reverse proxy behavior, cookies, rate limits, persistent paths, permissions, logs, and recoverable backups of SQLite and uploads.
5. **Deployment candidate:** Once launch blockers are resolved, rerun type checks, tests, build, and end-to-end checks; identify the release commit or tag.
6. **VPS deployment and smoke test:** Deploy the approved candidate, then verify domains, assets, login, content edits, product pages, inquiries, backups, and logs in production.

Any visible admin control should work end to end or be clearly disabled before launch. Future work should prioritize verified gaps and launch blockers over speculative features.

---

## Run locally

Requires Node.js **22.16 or newer** (Node 24 recommended) and pnpm.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the [public site](http://127.0.0.1:5173/) or [admin panel](http://127.0.0.1:5173/admin/). The API listens at `http://127.0.0.1:3001`. First-run admin setup requires a username and a password of at least 12 characters. In production, a server-side setup token is also required.

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm smoke:production
```

Do not commit `.env`, `data/`, uploaded files, or credentials. GitHub contains the application source and bundled public assets, not the running site's private content. The [GitHub workflow guide](docs/GITHUB.md) explains synchronization.

## README update policy

This is the living project-status document. With **each completed source change**, update it in the same commit: review the date and status table, record a meaningful milestone or revision, and change the roadmap when a blocker is resolved or discovered. Use ✅ only when the relevant behavior has been verified, not merely implemented. Review the latest `main` and other active work before editing so one contributor does not overwrite another's changes.

Admin-only edits change the local database rather than this repository. They cannot update the README automatically; record them here when they become a meaningful project milestone. Older plans and screenshots provide context, while the current code and verified behavior determine status.

## Current development rule

GitHub `main` is the source of truth for application code. Before work, read the latest branch, recent commits, and any active work so changes are not duplicated or overwritten. Preserve catalog identities and engineering integrity. Make the smallest necessary change, run checks appropriate to it, update this status document, and sync the verified result.

## Launch philosophy

Major local features are already present. Prioritize launch blockers, real product data, integration defects, security, backups, and deployment preparation. Defer unrelated feature expansion until the site is stable and the business approves its public content.


### 2026-10-04 — Bilingual SEO overhaul

- Filled missing English/Persian product titles and descriptions for the 110-record catalog without changing technical data, media or existing custom SEO copy. New and restored products receive descriptive defaults when saved.
- Added independent homepage, catalog and engineering metadata, editable search previews, product coverage counts, sharing-image settings and Search Console token support in **Admin → SEO**.
- Unified the server/browser head: canonical URLs, reciprocal `en`/`fa` and `x-default` links, Open Graph/Twitter cards and one Organization/WebSite/WebPage/Product/Breadcrumb graph. Product schema carries factual specifications, with no invented prices, reviews, stock offers or manufacturer identity.
- Added published HTML content and genuine product links before JavaScript starts. Product cards still open the floating panel; their real links also support opening a specification page in a new tab.
- Added domain-specific XML sitemaps and robots sitemap discovery. Admin, previews, missing and archived product pages receive `noindex`; missing/archived product routes return 404.
- Checked 220 product pages (110 per language), 220 unique titles, server/browser metadata parity, no-JavaScript browsing, admin SEO saving, the product modal and Persian phone-width layout. Automated suite: 30 tests; typecheck, production build and isolated production smoke passed.
- Scope: source and local verification. Hosting, both domains/TLS, Search Console verification/submission, exact SKU media, engineering reconciliation, full accessibility/security review and repository lint remain separate launch gates.

See [SEO configuration and launch guide](docs/SEO.md) for editable fields, URL rules and post-launch verification.

### Scroll-driven bearing introduction (2026-10-04)

The homepage defaults to a tapered roller thrust illustration. Its envelope proportions reference [Timken T921-902A1](https://cad.timken.com/item/thrust-tapered-roller-bearings/thrust-tapered-roller-bearings-type-tthd/t921-902a1); internal construction is illustrative, not manufacturer CAD or a new catalog record. Scroll separates two race washers, radial tapered rollers and cage, then recedes the assembly into a faint decorative background. All six selected illustrations now continue into matching background silhouettes: thrust, ball, double-row spherical roller, mounting accessories, housed units and track rollers. Scrolling upward reverses it. The five previous families remain selectable.

Tall desktop screens briefly pin the introduction using normal document scrolling. Mobile avoids pinning and the persistent background. Reduced-motion preferences disable automatic scroll animation; manual assembled/exploded views remain available. Pause freezes scroll response. The existing renderer is reused, capped at 30 FPS for the hero and stopped offscreen or in hidden tabs. Targeted browser checks cover desktop reversal, pause/manual controls, Persian mobile and reduced motion.

The closing homepage assembly now returns the selected family to an assembled 3D view while fading its background silhouettes. Scroll upward to separate it again. The finale loads its renderer only on approach and stops it offscreen; hero pause and reduced-motion settings apply to both ends. Photo-only hero mode omits the assembly finale.

### Continuous background experience (2026-10-04)

The approved background experience carries the selected family through the background of every public route. The parts open during the first portion of page scrolling, drift behind the content and close near the page end. It uses a passive scroll listener, a reused canvas and rendering only while the view changes; the admin is excluded. Reduced-motion preferences suppress this layer. The background is now enabled by default, with the selected family retained in the current browser session. The footer preview switch was removed at the owner's request. Direct preview URLs accept `?motion=background` or `?motion=classic`.

The previous completed version is preserved at commit `9e46c318f7647cd907ecf7bd70cd282285c34589` and branch `preview-before-continuous-background`. No production deployment has occurred. Use the classic preview URL to compare the prior presentation; source changes can also be reverted without restoring runtime data.

The continuous background is retained at the owner's request. Choosing **Assembled** or **Exploded view** previews that state immediately while **Follow scroll** remains enabled. The next scroll resumes the hero animation; the shared background and closing assembly keep their scroll behavior throughout. Pause and reduced-motion preferences still prevent automatic movement.

### Catalog completion audit (2026-10-04)

The [current catalog checklist](docs/CATALOG_CONTENT_AUDIT.md) covers 110 published local products. All 110 need exact product-photo review and attached product PDFs; 42 retain linked SKF source-catalog PDFs. There are 68 missing source links, 42 records missing cage/clearance details, and 57 records needing manufacturer/suffix identity review. No engineering differences were found between this local snapshot and the bundled seed; that is not independent manufacturer verification. Six displayed reference images decode correctly, while 29 legacy image paths fail browser decoding and are bypassed by the media adapter. No owner data or engineering values were changed.

Admin Products now separates missing PDFs from missing source links and offers **Export content checklist**. The read-only `npm run audit:catalog` command regenerates the report from the running local API; `--base`, `--out`, `--date` and `--media-results` customize its input/output. Browser media results are optional; absent probes mean media decoding has not been checked. The generated JSON evidence is in `docs/audit-evidence/catalog-content-audit-2026-10-04.json`. This checklist does not clear the launch gate; exact assets and independent specification review remain.

The catalog category strip now follows the supplied icon-tile reference: compact horizontal tiles, individual category sketches, product counts and a blue selected-state underline. It supports keyboard focus and horizontal scrolling in both Persian and English. Sketches are decorative category symbols, not exact product images.
