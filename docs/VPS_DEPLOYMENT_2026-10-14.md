# VPS publication and verification — 2026-10-14

**Published at the owner's request on the temporary HTTPS origin:** [https://213.176.28.119/](https://213.176.28.119/). [Admin login](https://213.176.28.119/admin/).

**Later domain update:** [Persian `.ir`](https://poladcharkhesh.ir/) is now live through Cloudflare with trusted apex/www origin HTTPS, Full (strict) and automatic renewal. External checks of 226 page/language variants, existing-owner login, unchanged-company-settings saving and certificate renewal dry-run passed. `.com` remains blocked by HostIran's explicit NS-change suspension error; independent English activation is prepared. See [the domain connection record](DOMAIN_CONNECTION_2026-10-14.md).

**Earlier mobile hotfix:** Revision `ece390686c8a5d2f30eea94fc2d0f6e862cc46be` repaired Safari-compatible listeners, observer guards and section/startup recovery, preventing the reproduced empty-screen paths. All 59 tests and production checks passed on Windows and Ubuntu; the 226-page live check passed again. Owner row hashes and counts matched before/after, and previous client assets were retained. Live 375px Chrome checks passed; the owner confirmed content remains on Safari. [Recovery report](MOBILE_RECOVERY_2026-10-14.md).

**Current mobile 3D release:** `aac7b756d6b96fa02481007064996597c8327372` supersedes the startup and intermediate animated-SVG fixes. The owner confirmed page content and movement, then requested the Windows model's appearance. A lazy WebGL 1 renderer now uses the same geometry, studio and motion code. All 61 tests and production checks passed on Windows and Ubuntu, and the external 226-page check passed at `2026-10-14T16:12:15.660Z`. A verified backup, identical owner-row hashes and retained old assets protect the rollout. Physical confirmation of the latest 3D appearance remains pending. [Full evidence](MOBILE_ANIMATION_2026-10-14.md).

The owner initially selected a temporary address because DNS access was then unavailable. The original English `.com` and Persian `.ir` SEO origins remain configured. Nginx retains `X-Robots-Tag: noindex, nofollow` pending acceptance. The later Persian-domain activation does not close English connection, indexing or the previously documented catalog/lint/accessibility work.

## Release and preserved data

- Initial application source revision: `52243edd9f677267eeb5767f26c61fe774f5b2a3`. The installed follow-up revision is `174a233291ccd9ca81de25a3c669568e3d61548a`, which corrects the admin preview's local-only wording. Both were built and checked as the unprivileged preflight account on the actual Ubuntu 24.04 VPS. Subsequent evidence-only documentation commits do not change the running application.
- Immutable root-owned release at `/opt/polad-charkhesh/releases/<commit>`; `current` is a symlink to it. The running service uses `/usr/local/bin/node` (Node 24.21.0).
- Existing local owner database was backed up and verified, transferred privately over SSH, verified again on Linux, and restored into `/var/lib/polad-charkhesh/`.
- **110 products, one existing administrator and zero registered uploaded-media files** were preserved. The absence of uploads reflects the owner's snapshot; public branding/family illustrations are source assets. No replacement seed database or default administrator was used.
- Independent session/cookie secrets live only in a root-owned mode-0600 environment file. The application runs as `polad-charkhesh` on `127.0.0.1:3001`, behind Nginx. External application/development ports remain blocked.

## Trusted HTTPS and automatic renewal

Let's Encrypt issued a publicly trusted certificate with the server IPv4 in its subject alternative names. It is a short-lived IP certificate; the initial certificate expires on 2026-10-21 and must renew automatically. The [official IP-certificate guidance](https://letsencrypt.org/2026/03/11/shorter-certs-certbot) requires Certbot 5.4+ for webroot support.

Certbot 5.8.0 is isolated in `/opt/polad-certbot/`. The VPS could not reliably access Python's package host, so official PyPI wheels were downloaded in a disposable Ubuntu container, checksum-verified after SSH transfer, and installed offline. No TLS verification was disabled.

`polad-certbot.timer` checks renewal twice each hour. Its oneshot service runs the isolated Certbot. The older Ubuntu Certbot timer was disabled to prevent an incompatible client from handling the new certificate. A deployment hook validates Nginx and reloads it. Renewal dry-run, including the reload hook, passed. HTTP redirects to HTTPS, ACME validation remains reachable, and unexpected Host values are rejected.

## Checks that passed

| Scope | Evidence |
| --- | --- |
| Source verification on the VPS | Dependency audit reported no known advisories; TypeScript, all **57 tests**, production build, bundle budgets and isolated production smoke passed |
| Live HTTPS verification | `node deploy/check-live.mjs https://213.176.28.119` passed, including TLS validation; rerun after service recovery passed |
| All published routes | **226 language/page variants**: home, catalog, engineering and all 110 products; unique titles, canonical/hreflang and public-content checks |
| Other live routes | Admin with/without trailing slash, robots, sitemap, llms, favicon, asset credits and the custom HTTP 404 |
| Security | Private status/backup/media/inquiry APIs return 401 without login; CSP, HSTS, frame and MIME protections present; no account/secrets embedded in public HTML |
| Browser | English homepage/3D banner, `6204` search with two distinct matching records, floating product specifications, exploded view/labels, documents panel and Escape dismissal |
| Engineering browser flows | Known-load result recalculated from 3,417 to 427 hours when P changed from 2 to 4 kN; fit, comparison and converter views opened |
| Persian presentation | RTL language switch, labels and loaded visible images verified; no visible broken images or browser error logs on these flows |
| Owner administration | Existing owner login, product/company/header/website/SEO/media workspaces and protected APIs passed; unchanged settings saved; an isolated archived product was created, edited and removed; a test PNG was uploaded, downloaded and removed; original product/media counts restored |
| Owner account recovery | At the owner's explicit request, the existing account password was reset to a securely generated value and its old sessions revoked; login with the replacement passed; no additional administrator created and no password committed |
| Persian mobile preview | The live admin's built-in public preview rendered at 389 CSS pixels, with RTL, document width matching scroll width and no broken visible images; this is a browser preview, not a physical-device audit |
| Inquiry form | A synthetic browser submission saved successfully; its exact record was verified in SQLite and removed without modifying owner inquiries |
| Storage and recovery | WAL probe passed during preparation; production database integrity and original counts checked after deployment |
| Backups | Daily full database/uploads backup service enabled and manually executed; snapshots verified; a private off-server copy downloaded and reverified |
| Restore drill | Backup restored into a separate private data directory; a loopback-only isolated server became healthy; product/admin/settings/media rows matched production; drill service stopped |
| Actual website supervision | A controlled SIGKILL caused systemd to restart the real website after five seconds; HTTPS health returned OK and a subsequent complete live route check passed |

The follow-up release passed TypeScript, production build, bundle budgets and the isolated production smoke check on Windows and on the actual VPS. The external live check passed again at **2026-10-14T11:14:11.200Z** with all 226 page variants. A verified snapshot made after owner-account recovery was copied off-server and checked again locally; its administrator rows match production exactly. Product/admin/media counts remain 110/1/0.

## Verification limits and next work

- Automated approval review rejected adding a temporary superadmin, so none was created. The owner subsequently explicitly authorized recovery of the existing account, and authenticated checks used that account without granting new roles. Destructive role-management UI was not exercised on the sole owner account.
- The global browser viewport override did not apply to the hidden public tab and was reset. The admin's built-in live preview provided the verified 389px Persian layout instead. No physical-device, full screen-reader, Safari/Firefox or penetration audit is claimed.
- Exact SKU photos, original manufacturer PDFs, technical-data approval, the lint backlog and legacy-reference reconciliation remain as described in [the earlier readiness report](VPS_READINESS_2026-10-13.md). Publication does not certify manufacturer data.
- Daily backups currently stay on the VPS. One verified off-server copy exists in the ignored local workspace; recurring off-server storage/retention still needs a destination and policy. Backups and private logs are excluded from GitHub.
- Full-host reboot was not performed because the provider's initial contextualization service and duplicate-address/default-route observations remain unresolved. Service crash recovery was tested separately. Confirm provider networking before the reboot-persistence acceptance check.
- Persian delegation, origin certificate, Cloudflare strict proxying and external verification have passed. English delegation/certificate verification still requires registrar recovery; the owner has already contacted support. Keep noindex until domain/content acceptance permits indexing.
- The root password shared in chat remains unchanged; the owner should rotate it and establish a tested personal SSH-key/sudo login.

The private original/migrated snapshots and operational logs remain available for recovery. No runtime data, account credentials, certificate keys or uploaded bytes were committed. GitHub synchronization is source/documentation synchronization, not an automatic deployment watcher.
