# VPS deployment preparation

The application is built for a Linux VPS with Node, Express and SQLite. Hosting has not been selected, and no public deployment has been performed. The checked-in files under `deploy/` are templates; update paths, domain names and certificate names before installing them.

## Host compatibility probe

For Ubuntu 24.04, use the [step-by-step runbook](UBUNTU_24_RUNBOOK.md) and [current readiness review](VPS_READINESS_2026-10-13.md). Container verification is complete; real-host acceptance and public-launch gates remain open.

Before using a purchased server for live data, run the standalone `scripts/hosting-check.mjs` with Node 22.16+ as the intended application service user against an existing absolute persistent directory:

```bash
node scripts/hosting-check.mjs /var/lib/polad-charkhesh
```

It creates a unique `polad-hosting-probe-*` subdirectory, exercises committed WAL recovery after abrupt process exit, concurrent reading during a write transaction, SQLite backup/integrity and an uploaded-file hash. No live application database or environment file is opened. The output gives a `nextCheck` argument array; run that `--verify` command after an actual reboot and again after a test deployment to check persistence. If uploads live on a separate mount, probe that location too. Probe files are retained for these checks; remove only the reported probe directory when finished.

Known NFS/SMB/CIFS filesystem types are rejected; other results do not certify storage architecture. Provider confirmation and mount inspection are still needed. A pass does not establish service supervision, host reboot behavior, HTTPS, load capacity or provider-backup restorability. See the [Persian hosting checklist](HOSTING_CHECK_FA.md). No server has been purchased or validated as of 2026-10-12.

## Release checks before choosing a host

From a clean checkout with Node 22.16+ (Node 24 is used for the current local verification) and pnpm:

```bash
pnpm install --frozen-lockfile
pnpm audit --audit-level=moderate
pnpm typecheck
pnpm test
pnpm build
pnpm check:bundles
pnpm smoke:production
pnpm lint
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

Production refuses a missing or zero-byte database. Restore the verified owner database before starting. Only for a deliberately new installation, set `ALLOW_INITIALIZE_DATABASE=1`, complete setup, then remove that setting and restart. Do not leave it enabled as a workaround for a missing mount or incorrect path.

Edit [nginx.conf.example](../deploy/nginx.conf.example) for the domain or domains you actually control and obtain certificates covering every listed name. Forward the original Host, the direct client address and HTTPS scheme. The app trusts loopback proxies only; do not expose port 3001 publicly. Enable the HTTPS configuration only after certificates exist. If one domain is used, configure both SEO canonical origins in the admin panel to valid origins you control and check the language/alternate-link behavior before launch.

On the real domain, check `/`, `/admin/`, `/catalog`, `/engineering`, a product page, `/robots.txt`, `/sitemap.xml`, fonts, images, and one uploaded file. Verify that admin login uses Secure, HttpOnly and SameSite cookies, public inquiries save, content edits appear publicly, and unauthenticated backup access is denied. Confirm the `.ir` host defaults to Persian and the `.com` host to English only if both domains are configured. The smoke script's sample Host headers are not a replacement for these live checks.

## Connect the two custom domains

This step is pending the VPS purchase and DNS access; saving domain names in the SEO editor does not connect them.

1. At each domain's DNS provider, point the root (`@`) A record to the VPS public IPv4 address. Publish AAAA only if the server actually has working public IPv6 and Nginx listens on it. Preserve existing MX/TXT mail records.
2. If `www` will be used, add it as a CNAME to the matching root domain. Include all four names in certificate coverage before enabling HTTPS redirects. Otherwise omit `www` from the configuration entirely.
3. Obtain a certificate covering `poladcharkhesh.com` and `poladcharkhesh.ir` (and the optional www names). Install the actual certificate paths in the Nginx template. Confirm renewal works.
4. Redirect HTTP to HTTPS. Redirect `www.poladcharkhesh.com` to `https://poladcharkhesh.com$request_uri` and `www.poladcharkhesh.ir` to `https://poladcharkhesh.ir$request_uri` if enabled. Keep `.ir` and `.com` as separate language origins; do not redirect one root to the other.
5. In Admin → SEO, retain the English `.com` and Persian `.ir` origins. From outside the VPS, check certificate validity, `/api/health`, both homepages, a product page, `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/favicon.svg` and an unknown URL returning HTTP 404. Verify each page has one canonical and the correct alternate-language links.
6. Verify each domain in Search Console, add its provided verification value or DNS TXT record, and submit each domain's sitemap. Inspect representative published URLs. Check the published company address and phone before requesting indexing.

The [SEO checklist](SEO_PREDEPLOY_CHECKLIST.md) separates completed local checks from these live launch checks. No DNS, certificate or server changes are performed by pushing this repository.

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
