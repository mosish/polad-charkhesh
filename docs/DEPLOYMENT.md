# VPS deployment preparation

The application is built for a Linux VPS with Node, Express and SQLite. Hosting has not been selected, and no public deployment has been performed. The checked-in files under `deploy/` are templates; update paths, domain names and certificate names before installing them.

## Release checks before choosing a host

From a clean checkout with Node 22.16+ (Node 24 is used for the current local verification) and pnpm:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm smoke:production
```

`smoke:production` starts the built server against a temporary SQLite database and temporary upload directory. It checks both language hosts, public and admin routes (including trailing slashes), product pages, assets, metadata, security headers, first-run admin setup, content/product edits, public inquiries, media uploads, backup access and logout. It does not touch the live database or prove that a real domain, TLS certificate or admin browser workflow works.

Before launch, approve the company contact details, both languages, canonical domains, and manufacturer specifications for the 68 legacy records and 42 new SKF additions. The current family illustrations are labeled references; attach approved exact product photographs and manufacturer-issued PDFs in the admin panel as they become available. Company-generated PDFs are not manufacturer publications.

## VPS layout and secrets

Use an unprivileged `polad-charkhesh` service account. Keep the built project at `/opt/polad-charkhesh/current`, runtime data at `/var/lib/polad-charkhesh`, and a root-owned environment file at `/etc/polad-charkhesh/env`. The service template is [polad-charkhesh.service.example](../deploy/polad-charkhesh.service.example). Adjust the Node executable path if it is not `/usr/bin/node`.

The environment file needs these values; do not commit the actual file:

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=3001
DATABASE_PATH=/var/lib/polad-charkhesh/platform.sqlite
UPLOAD_DIR=/var/lib/polad-charkhesh/uploads
SESSION_SECRET=REPLACE_WITH_INDEPENDENT_RANDOM_VALUE_OF_AT_LEAST_32_CHARACTERS
COOKIE_SECRET=REPLACE_WITH_DIFFERENT_RANDOM_VALUE_OF_AT_LEAST_32_CHARACTERS
SETUP_TOKEN=REPLACE_WITH_RANDOM_FIRST_RUN_VALUE_OF_AT_LEAST_24_CHARACTERS
```

Production startup refuses short session/cookie secrets, relative or missing data paths, and a missing setup token before the first administrator exists. The setup token can be removed after creating the first administrator. Generate each value independently, for example with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Keep the root-owned environment file readable only by the server administrator; systemd loads it for the service. Keep `/var/lib/polad-charkhesh` private; never put SQLite or uploads inside the code checkout or a public web directory.

Build after installing locked dependencies. Install the edited systemd template, reload systemd, and start the service. Keep the app bound to `127.0.0.1:3001`. Confirm `curl http://127.0.0.1:3001/api/health` returns `{"status":"ok"}` before connecting the reverse proxy. Monitor service logs and disk space.

## HTTPS and domains

Edit [nginx.conf.example](../deploy/nginx.conf.example) for the domain or domains you actually control and obtain certificates covering every listed name. Forward the original Host, the direct client address and HTTPS scheme. The app trusts loopback proxies only; do not expose port 3001 publicly. Enable the HTTPS configuration only after certificates exist. If one domain is used, configure both SEO canonical origins in the admin panel to valid origins you control and check the language/alternate-link behavior before launch.

On the real domain, check `/`, `/admin/`, `/catalog`, `/engineering`, a product page, `/robots.txt`, `/sitemap.xml`, fonts, images, and one uploaded file. Verify that admin login uses Secure, HttpOnly and SameSite cookies, public inquiries save, content edits appear publicly, and unauthenticated backup access is denied. Confirm the `.ir` host defaults to Persian and the `.com` host to English only if both domains are configured. The smoke script's sample Host headers are not a replacement for these live checks.

## Backup and restore drill

Back up both SQLite and uploaded bytes. The admin JSON export excludes passwords, sessions and file bytes; it is not a full disaster-recovery copy. For a complete, internally consistent file backup, stop the service while copying uploads, then run:

```bash
DATABASE_PATH=/var/lib/polad-charkhesh/platform.sqlite UPLOAD_DIR=/var/lib/polad-charkhesh/uploads pnpm backup:data /var/backups/polad-charkhesh
pnpm verify:backup /var/backups/polad-charkhesh/backup-REPLACE_WITH_CREATED_DIRECTORY
```

Run these commands as an account with read access to the live data and write access to the private backup directory, then restart the service. `backup:data` uses [Node's SQLite backup API](https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html), copies uploads, checks database integrity and media references, and writes SHA-256 hashes in a manifest. A failed copy leaves an `INCOMPLETE` marker; never restore it. `verify:backup` checks the copied files again, including after transfer. Keep backups encrypted and offsite with restricted access, and test restoration in a separate environment before relying on them. During a real restore, stop the service, preserve the existing data as a fallback, place a verified snapshot and its uploads in the configured persistent paths, then restart and smoke-test the site.

## Launch gates still open

- Choose and provision hosting, domain names, DNS and HTTPS certificates.
- Independently approve company information and imported manufacturer data; add approved exact media and source documents where required.
- Complete a browser audit of every admin module, public inquiry, keyboard/dialog interaction, both languages and representative phones/tablets.
- Run a restore drill and configure regular encrypted offsite backups on the chosen host.
- Review the repository-wide lint backlog and final accessibility/security findings before declaring a release candidate.

Pushing code to GitHub does not deploy this application. Sites/Cloudflare Worker hosting would require different persistence and authentication adapters; these Node/SQLite templates apply to a VPS.
