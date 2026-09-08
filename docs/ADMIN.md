# Administration

Open `/admin`. The first visit offers administrator provisioning; no credentials are supplied or hardcoded. Use a username of 3–64 permitted characters and a password of at least 12 characters. In production, the server-configured `SETUP_TOKEN` is required and setup closes permanently after the first administrator is created.

Modules: overview, products, media, company, inquiries, Website editor, Header, SEO, system/security and audit logs.

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

Archive is reversible. Permanent deletion requires a super-admin, an archived record and typed confirmation of its exact code. Restore from backup likewise requires super-admin access and typed confirmation. The UI has no default credentials or frontend-only auth shortcut.

Inquiries are stored immediately when the public form succeeds. Search/filter and status updates support new, reviewed, contacted and closed. No email or WhatsApp message is sent automatically.

Media supports JPEG, PNG, WebP and PDF up to 5 MB with MIME/signature checks. Image/PDF pickers are available directly inside product and website editors. Upload or choose a library file; its URL is inserted automatically. Product galleries support adding images and one URL per line. Deleting media still associated with a product or settings is refused. Uploaded PDFs are served as downloads, not embedded executable content.

Company and bilingual CMS fields are stored centrally. The SEO editor manages titles, descriptions, domains, keywords, verification and an existing OG image URL. Canonical domains must be HTTPS origins. No prices or Offer schema are generated.

Backups contain complete catalog/settings/inquiry/media metadata. Copy `data/uploads` separately. Restore validates data and creates a pre-restore snapshot transactionally. Authentication information is excluded. Password changes revoke all sessions, including the current one. Users must sign in again.

Older content backups are upgraded by adding the new editing controls while preserving their saved bilingual section copy. New backups include page order, hidden/custom sections, cards, navigation, images, colors and text overrides.

Editor and super-admin roles are enforced on the server. The first account is super-admin. A multi-user account-management interface is not included; provision additional accounts through an audited server administration process.

### Homepage bearing presentation

In Website editor > Brand & images, use Homepage display to choose Animated bearing or Uploaded photograph. Save website applies the choice; the existing hero image is preserved. Animation headings and labels are editable in All website text. The homepage motion is a slow illustrative showcase; the engineering workspace retains its separate product RPM controls.


### Three-dimensional bearing family showcase
The animated homepage offers Super-precision (angular-contact balls), Rolling bearings (cylindrical rollers), and Plain bearings (a one-piece bronze sleeve with a cylindrical sliding bore). Visitors select a family using the three buttons. Pause/play applies across family changes. All family labels and descriptions are editable through All website text. The geometry and surface markings are illustrative Polad Charkhesh models, not SKF CAD or catalog product claims. No new products are inserted into the catalog.

Assembled and Exploded view controls smoothly separate the outer ring, rolling elements, cage and inner ring, with numbered labels. Assembly changes also work while motion is paused and respect reduced-motion preferences. The one-piece plain sleeve has no rolling elements or cage, so its exploded-view option is disabled. The stage adapts to desktop and phone widths.

The scene loads on demand and renders locally with Three.js. If WebGL is unavailable, assembled rolling families use the existing static drawing; the plain family and exploded views show an explanatory label. No remote model or texture requests are required. The engineering workspace continues to use its separate product-specific RPM tools.

### Bearing Explorer 3D cutaway
Motion and Thermal now share the physically shaded 3D renderer used by the homepage. Bore, outside diameter and width use the selected catalog record with a uniform scale. Internal raceway profiles, count and cages remain illustrative estimates. Ball, angular-contact, self-aligning, cylindrical, needle, tapered and spherical/toroidal models vary their elements and row arrangement. Explicit double-row product names are respected. Section & dimensions remains the existing schematic; unsupported components retain that view.

The RPM input remains shared with the calculator. Inner-ring, estimated cage and element-spin angles integrate elapsed time and the playback multiplier. Outer ring pose remains fixed. Pause, zero speed, hidden tabs and offscreen models stop the animation loop. At high RPM use 0.02x Inspection to see the parts clearly. A 2D fallback remains for unavailable WebGL. No product data or admin settings are replaced by this change.
