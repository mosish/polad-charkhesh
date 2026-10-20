# Security remediation — 20 October 2026

This package addresses the supplied security audit. Engineering approval remains
pending. Public indexing is disabled. Production activation and perimeter
verification are recorded below only after they actually occur.

## Application changes

- Production requires TOTP enrollment before private APIs are available. Pending
  enrollment sessions last ten minutes and cannot edit or export data. TOTP seeds
  use AES-256-GCM with a separate server key and account-bound authenticated data.
  Accepted time steps cannot be replayed. Ten random recovery codes are shown
  once and stored only as hashes; using one revokes older sessions.
- Five failed credential attempts lock an account for fifteen minutes across IP
  addresses. Existing IP throttles remain. Failures, account lockouts and recovery
  use generate audit events; lockouts and recovery use also generate structured
  journal warnings. System & security displays the latest alerts. No external
  email/notification destination is configured.
- Expired sessions, throttle rows and enrollment secrets are removed on startup
  and hourly. Business audit records are preserved.
- Audit-log access and metadata backup export require a superadministrator.
  Editors retain catalog, content, media and inquiry workflows.
- Optional Cloudflare Access origin validation verifies RS256 signature, issuer,
  application audience, expiry and identity. A header or cookie alone is not
  trusted. It covers admin pages, private reads, mutations and preview; public
  catalog reads and inquiry submission remain available.
- Uploaded PNG/JPEG/WebP images are decoded and re-encoded to WebP, removing
  metadata and trailing payloads. Limits: 5 MB input/output, 4000 × 4000 / 16
  million source pixels, one frame, 2560-pixel output, two concurrent disposable
  workers and a 25-second worker deadline. Workers do not inherit application
  secrets.
- PDFs require qpdf >= 11 structural validation. Parsed dictionaries, including
  escaped names and compressed objects, reject JavaScript, launch/automatic
  actions, forms, embedded files and other active content. Static page/zoom
  destinations and ordinary HTTPS/HTTP links are permitted. Encrypted, damaged
  and over-500-page files are rejected. PDF processing on Linux has per-command
  memory/CPU/file-size/time limits. Downloads retain attachment/nosniff headers.
  This is a restrictive document policy, not a malware-free certification.
- Script JSON additionally escapes `>`, `&` and Unicode separators. Public HTML
  carries only the active translation dictionary; the complete CMS dictionary
  is fetched when a same-origin language switch requires it.
- `ENABLE_SEARCH_INDEXING=true` is the only indexing switch. The default is
  false, independent of `NODE_ENV`. Server HTML, browser metadata and robots.txt
  use it. Nginx maps the upstream robots header and fails closed when missing;
  private routes retain noindex even after an eventual public launch.

## Required production configuration

Generate a persistent, independent `MFA_ENCRYPTION_KEY` (32 random bytes encoded
as 64 hex characters). Keep it in the private environment file; never in Git.
Production fails to start when mandatory MFA has no valid key. Do not rotate or
lose this key without planning account reenrollment.

When Access is enabled, set `CLOUDFLARE_ACCESS_ISSUER` to the account's HTTPS team
domain and `CLOUDFLARE_ACCESS_AUDIENCE` to the comma-separated application audiences.
The Access allow policy uses the owner's supplied email, with no Everyone bypass.
Keep cookie path restriction disabled so authenticated admin API requests can
carry the Access cookie.

Install `deploy/indexing-map.conf.example` in Nginx's http context. Replace each
proxied website's hardcoded robots header with the two directives documented in
that file. Leave `ENABLE_SEARCH_INDEXING=false` until explicit owner authorization
and engineering acceptance; restart the app after changing that variable.

Install qpdf, util-linux and age from the Ubuntu package repositories. Keep
system packages updated. The existing service restrictions and loopback API
binding remain in force.

## Recovery and backups

At first sign-in, the owner must add the displayed setup key to their own
authenticator, verify its code, and save the recovery codes privately. The agent
does not enroll or retain the owner's authenticator. A lost authenticator can be
recovered using password plus an unused recovery code. With no codes available,
an authorized server operator can run `scripts/reset-admin-mfa.ts USERNAME
--revoke-all-sessions` with the persistent database environment; this is audited,
revokes sessions and requires fresh enrollment.

`deploy/encrypted-backup.sh` runs as root under the existing daily timer. It checks
disk headroom, briefly stops writes for a consistent database/uploads snapshot,
restarts the service, encrypts the snapshot and private runtime configuration with
age, decrypts into a private scratch directory, verifies all hashes and SQLite
integrity, then retains the latest 30 successful encrypted archives. Previous
plaintext backup directories are preserved. Interrupted `.partial` archives are
not valid backups.

Archives stay under `/var/backups/polad-charkhesh/encrypted`; the age identity stays
in `/etc/polad-charkhesh/backup-age.key` with mode 0600. Plaintext scratch directories
are removed after the check. Restore only into an isolated root-owned directory
first, run `scripts/verify-backup.ts` on the restored snapshot, and follow the
existing deployment rollback procedure before replacing live data. Configuration
restoration includes the matching MFA encryption key.

**VPS-only storage remains a single point of failure.** Encryption and local
restore checks do not protect against complete host/disk loss. No backup is copied
off the VPS under the current owner instruction. SSH password login remains
unchanged at the owner's explicit request.

## Verification

Local Windows checks: 134 tests pass; TypeScript, required lint, production build,
bundle budgets and isolated production smoke pass. The locked dependency audit
reports no known vulnerabilities. Tests include RFC 6238 vectors, enrollment
authorization boundaries, OTP replay, one-time recovery, distributed account
lockout, role enforcement, expired-state cleanup, forged/expired Access tokens,
image metadata/dimension rejection and parsed active/compressed PDF rejection.

Browser: an isolated disposable account completed enrollment and recovery-code
acknowledgment, then reached the workspace; Persian sign-in and a 390-pixel mobile
viewport have no horizontal overflow. Public Persian content loads with the
localized dictionary. These checks do not constitute owner MFA enrollment.

Production activation, Ubuntu validation and Cloudflare/firewall checks: pending
at the time of this source checkpoint.

## Audit qualifications and remaining acceptance

The application already emitted CSP, HSTS, nosniff and secure session cookies.
HSTS preload/includeSubDomains is not enabled without an inventory and commitment
covering every subdomain. The existing CSP permits external product photographs;
blanket removal would break documented media.

The 110 product profiles remain subject to engineering review. No ratings,
manufacturer identities, approval registry or calculation gates are changed by
this security package. No indexing release, off-site backup or SSH login change
is implied by passing software checks.

References: [Sharp input limits](https://sharp.pixelplumbing.com/api-constructor/),
[qpdf parsed JSON](https://qpdf.readthedocs.io/en/stable/json.html),
[Cloudflare application paths](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/),
[OWASP MFA guidance](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html).
