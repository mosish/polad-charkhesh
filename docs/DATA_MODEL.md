# Data model

`products` stores unique id/code/slug, category, archived state, and the full engineering record as validated JSON. Code uniqueness is case-insensitive. Identity and discovery queries use SQLite indexes. Canonical seed values are not silently corrected.

Supported record groups: bilingual identity/descriptions, dimensions, mass, dynamic/static ratings, grease/oil/thermal speeds, cage, sealing, clearance, schematic family, chamfer, contact angle, X/e/Y/Y0/Y1/Y2/f0 factors, brands, bilingual applications, industries, media, technical sources, SEO and audit metadata. Technical sources may include manufacturer, reference, source type, catalog code, URL, verification date and notes.

Other tables: `admins`, `sessions`, `settings` (company/content/SEO), `inquiries`, `media`, `audit_logs`, `backup_snapshots`, and `rate_limits`.

Foreign keys link sessions to administrators. Session tokens are stored as keyed hashes. Password hashes use salted PBKDF2-HMAC-SHA512. JSON settings share one authoritative company record between public content, contact links and organization metadata.

SQLite uses WAL, foreign keys and a busy timeout. Multi-record restore runs in `BEGIN IMMEDIATE` with rollback. Backup exports contain products, settings, inquiries and media metadata; they exclude passwords, sessions, secrets and environment variables. Uploaded bytes must be backed up separately.

The imported image paths remain in the canonical records for provenance. They resolve through a media adapter because the reference WebP files were corrupted. Ball/tapered families use credited illustrative photographs; other components use dimensional envelopes. New admin uploads override that adapter.
