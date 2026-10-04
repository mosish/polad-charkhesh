# Administration

Open `/admin`. The first visit offers administrator provisioning; no credentials are supplied or hardcoded. Use a username of 3–64 permitted characters and a password of at least 12 characters. In production, the server-configured `SETUP_TOKEN` is required and setup closes permanently after the first administrator is created.

Modules: overview, products, media, company, inquiries, Website editor, Header, SEO, system/security and audit logs.

The navigation is grouped by dashboard, catalog, website, and administration. On phones, **Management modules** opens the module list. The Overview shows counts for products, new inquiries, recorded engineering factors, referenced brands, media files, and audit events. Factor coverage means values are present; it does not certify manufacturer accuracy.

The admin page has its own navigation without the public website header, footer or floating contact buttons. Use **View website** to open the public site and the language button to switch admin language.

## Edit your website

Choose **Website editor** from the sidebar (or the large **Edit website sections, text & images** button on Overview).

- **Sections & order:** show/hide and move the nine homepage sections; edit major bilingual headings and descriptions; add, edit or remove up to 20 custom text/image/button sections.
- **Header:** edit the company logo, bilingual top strip/name/subtitle/contact button, contact destination and menu links together. Also available directly from **Header** in the admin sidebar. The phone number is managed in **Company**.
- **All website text:** search English/Persian text entries across homepage, header/footer, catalog, product views, diagrams and engineering tools. Product records and company details have their own editors.
- **Brand & images:** change the logo, main/link/text colors, hero image, family reference images, and alternative text. Upload an image or choose one from the media library.
- **Cards & industries:** add, edit, reorder and remove capability, industry and benefit cards, including pictures and links.
- **Links & navigation:** edit menu labels, destinations and order; add/remove menu links; edit section button destinations.

The preview supports home, catalog, engineering and an example product, in English or Persian and mobile/desktop widths. Changes appear in the preview before they are saved. **Save website** updates this local website; **Discard changes** reloads saved content. Browser unload and changing admin modules warn about unsaved changes. The editor does not publish the site to the internet.

Calculations, validation rules and application code remain maintained in code; the panel manages content and the provided page structure, not arbitrary executable code. IRANSans remains the selected company typeface.

Products are edited in sections for identity, dimensions, loads, speeds, factors, technical details, applications, media, sources and SEO. Source records use an editable JSON array; string arrays use one value per line. Unknown product fields and invalid numeric/geometry inputs are rejected by the API. Saving shows errors from the server; metadata identifies the last editor. Unsaved product edits require a discard choice.

**Duplicate** opens a new-product draft with technical fields copied from a selected product. Enter a distinct code and URL slug and review the copied specifications before saving; the source record is not modified. The catalog list also has a **Featured** shortcut for active products. Company settings are grouped into Identity, Contact, Working hours, and Address & maps; all fields still save through the existing company record.

Archive is reversible. Permanent deletion requires a super-admin, an archived record and typed confirmation of its exact code. Restore from backup likewise requires super-admin access and typed confirmation. The UI has no default credentials or frontend-only auth shortcut.

Inquiries are stored immediately when the public form succeeds. Search/filter and status updates support new, reviewed, contacted and closed. No email or WhatsApp message is sent automatically.

Media supports JPEG, PNG, WebP and PDF up to 5 MB with MIME/signature checks. Image/PDF pickers are available directly inside product and website editors. Upload or choose a library file; its URL is inserted automatically. Product galleries support adding images and one URL per line. Deleting media still associated with a product or settings is refused. Uploaded PDFs are served as downloads, not embedded executable content.

Company and bilingual CMS fields are stored centrally. The SEO editor manages titles, descriptions, domains, keywords, verification and an existing OG image URL. Canonical domains must be HTTPS origins. No prices or Offer schema are generated.

Backups contain complete catalog/settings/inquiry/media metadata. Copy `data/uploads` separately. Restore validates data and creates a pre-restore snapshot transactionally. Authentication information is excluded. Password changes revoke all sessions, including the current one. Users must sign in again.

Older content backups are upgraded by adding the new editing controls while preserving their saved bilingual section copy. New backups include page order, hidden/custom sections, cards, navigation, images, colors and text overrides.

Editor and super-admin roles are enforced on the server. The first account is super-admin. A multi-user account-management interface is not included; provision additional accounts through an audited server administration process.

### Homepage bearing presentation

In Website editor > Brand & images, use Homepage display to choose Animated bearing or Uploaded photograph. Save website applies the choice; the existing hero image is preserved. Animation headings and labels are editable in All website text. The homepage motion is a slow illustrative showcase; dedicated product pages retain product-specific RPM inspection.


### Three-dimensional bearing family showcase
The animated homepage offers five illustrative families: Ball bearings, Roller bearings (double-row spherical roller), Bearings accessories, Engineered products (housed unit), and Track rollers (stud-type cam follower). Visitors select a family using five buttons. Pause/play applies across family changes. All family labels and descriptions are editable through All website text. The geometry and surface markings are illustrative Polad Charkhesh models, not SKF CAD or catalog product claims. No new products are inserted into the catalog.

Assembled and Exploded view controls smoothly separate four labeled assemblies. Assembly changes also work while motion is paused and respect reduced-motion preferences. All five families support exploded views, with part labels appropriate to each model. The roller family uses two inclined rows of barrel-shaped rollers and a shared curved outer raceway. The stage adapts to desktop and phone widths.

The scene loads on demand and renders locally with Three.js. If WebGL is unavailable, assembled rolling families use the existing static drawing; exploded views show an explanatory label. No remote model or texture requests are required. Section 03 focuses on calculations and reference tools.

### Product-page Bearing Explorer 3D cutaway
Motion uses the physically shaded 3D renderer shared with the homepage. Bore, outside diameter and width use the selected catalog record with a uniform scale. Internal raceway profiles, count and cages remain illustrative estimates. Ball, angular-contact, self-aligning, cylindrical, needle, tapered and spherical/toroidal models vary their elements and row arrangement. Explicit double-row product names are respected. Section & dimensions remains the existing schematic; unsupported components retain that view. The former Thermal display was removed because its temperature estimate lacked the application inputs needed for a usable result.

For supported 3D products, the Explorer also provides Assembled and Exploded view controls. The latter separates the selected product's outer ring, rolling elements, cage, and inner ring, labels them, and pauses displayed rotation until reassembled. The selected RPM remains available as an operating input.

The product-page RPM input controls its viewer; the separate engineering life calculator has its own operating-speed input. Inner-ring, estimated cage and element-spin angles integrate elapsed time and the playback multiplier. Outer ring pose remains fixed. Pause, zero speed, hidden tabs and offscreen models stop the animation loop. At high RPM use 0.02x Inspection to see the parts clearly. A 2D fallback remains for unavailable WebGL. No product data or admin settings are replaced by this change.

### Product showroom and engineering references — 2026-09-09
The catalog supports horizontal family filtering and code, dimension or application text search, including Persian digits. Filter URLs can be bookmarked. The grid shows two complete rows and a faded third-row preview before **Show more components**; on phones, cards use one column. Select a card or table row to open the floating gallery and specification panel. Up to three records can be compared in the engineering workspace.

The floating product panel presents images, a dimensional drawing, available exploded view, ratings, dimensions and technical attributes together on desktop. It offers direct mobile and office call options from the saved company settings, a generated company datasheet, and any attached product PDF. Dedicated product pages retain the geometry viewer and relevant official manufacturer references. Upload the exact photograph/gallery and PDF in Products > Media. Product media overrides the bundled family references. Missing manufacturer documents remain explicitly identified. Reference illustrations are not exact product photographs; unmatched types retain dimensional drawings.

The 2026-09-29 SKF expansion adds 42 sealed deep-groove designations to an existing database once. It does not replace edited or archived products. Each new record has an official SKF catalog-table link, reference and limiting speeds, and no exact SKU image or attached PDF. Add an approved exact image in Products > Media and select it as the product image; the labeled family reference remains a fallback until then.

Engineering provides live life and known-equivalent-load estimates, a fit-limit explorer with worst-case clearance/interference ranges in micrometres, technical comparison, and unit conversion. Example calculation results appear immediately and update as inputs change. New text is registered in All website text. Source links are curated in code. No commercial workflow is included.


## Catalog maintenance (2026-10-04)

Products provides coverage cards and filters for missing product images, incomplete specifications, missing documents and English/Persian content gaps. Counts cover active records; filtering can also include archived records. These indicators describe recorded content, not manufacturer approval. Family reference images do not count as product images. Rolling-bearing coverage includes load ratings, a speed rating, cage and clearance fields; non-bearing components are not expected to have bearing load ratings.

Select individual rows or up to 200 filtered results, then choose feature/unfeature, archive/restore or set manufacturers. Review shows the selected codes, including selections outside the current filter. Manufacturer assignment replaces the selected records' brand lists. Archive removes records from public discovery; restore makes them visible again. Bulk operations never permanently delete records.

Export catalog JSON to edit or retain the product records, or download the import template. Import accepts a JSON array or an object containing a `products` array, with 1–200 entries and a maximum 2 MB file in the browser. New records require unique codes, slugs, both names, category, schematic and numeric fields. Existing records match by code without regard to case; fields omitted from a matching record remain unchanged. Expand each preview row to review before/after field values. Review the manufacturer information, check the review box and save. Invalid rows or conflicting slugs stop the entire batch. If any matching record changes after preview, preview the file again. Successful imports and bulk edits are audited and saved atomically.

Use exact code-matched photos when adding product media. The system cannot certify that an uploaded image is the exact manufacturer's product. Catalog JSON contains products only; use System backup for complete application-data backup, and the offline backup command for uploaded files.

### Catalog completion checklist

In Products, missing **Product PDFs** and missing **Source links** are separate filters. A catalog reference link no longer clears the product-document gap. **Export content checklist** downloads the current catalog's missing fields, photo candidates, source references and manufacturer/suffix review reasons as JSON. It is a read-only export; recorded images, PDFs and source dates still require independent verification.
