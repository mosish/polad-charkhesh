# Purchased VPS preparation — 2026-10-14

**Infrastructure prepared and application checks passed on the actual VPS. Website not deployed publicly.** Credentials, host addresses and private operational logs are excluded from this report.

## Verified host and installed requirements

- Ubuntu 24.04.5 LTS, x86_64; 2 vCPU, about 4 GiB RAM, 60 GB disk and 2 GiB swap.
- Persistent path is on a local `ext4` mount. The application storage probe passed WAL activation, committed WAL recovery, reading during a write transaction, SQLite backup/integrity and uploaded-file hashing. A same-session persistence recheck also passed; this does **not** establish reboot persistence.
- Official Node 24.21.0 archive downloaded and verified against its SHA-256 checksum. Runtime installed in `/opt/node-v24.21.0` with `node`, `npm` and `npx` links in `/usr/local/bin`; pnpm 11.25.0 installed globally under `/usr/local`.
- Nginx, Certbot, Git, curl, xz-utils, OpenSSL, UFW, Fail2ban, unattended security updates and log rotation installed/available.
- UFW enabled: default deny inbound; only TCP 22, 80 and 443 allowed for IPv4/IPv6. No application or development port is exposed.
- Fail2ban SSH jail active using the systemd journal, five retries in ten minutes, one-hour ban. Existing SSH authentication settings remain unchanged. A new authenticated SSH connection succeeded after these changes.
- Daily package/security-update timers and Certbot renewal timer enabled. No certificate has been issued yet. Available OS upgrades were checked; three packages were deferred by Ubuntu's phased-update policy. No reboot-required marker was present.
- Nginx configuration validated. The original default configuration was backed up privately, then replaced with an HTTP 503 maintenance response and `noindex` header. External HTTP verification returned 503. There is no HTTPS listener yet.

## Application checks on the real VPS

Source revision: `6b02f2ec2467dfc5d93295a29dfeaae2fd54e880`.

The public repository was cloned to `/opt/polad-preflight/source`. Dependency installation and all application checks ran as the unprivileged, non-login `polad-check` account, using disposable test data. No owner database, admin account or uploaded media was transferred; the built application is not running as a permanent website service.

| Check | Result |
| --- | --- |
| Frozen dependency installation | Passed |
| Dependency audit | No known vulnerabilities reported at execution time |
| TypeScript | Passed |
| Regression suite | 57 passed, 0 failed |
| Production build | Passed |
| Bundle budgets | Passed: 81.8 KB initial JS gzip; 402.7 KB largest JS chunk |
| Isolated production smoke | Passed: pages/assets/metadata, admin setup, edits, inquiry, media, backup and logout |
| SQLite WAL/storage probe | Passed; same-session recheck passed |
| Fresh SSH connection / external HTTP | Passed / expected maintenance 503 |
| systemd crash recovery | Temporary unprivileged Node service restarted after SIGKILL; stopped and removed afterward. This was not the website service or a reboot test. |

Private server evidence is under `/root/polad-preparation/`: `source-checks.log`, `hosting-probe.json`, `systemd-check.log`, and `os-upgrade.log`. Probe files remain under `/var/lib/polad-preflight/` for later reboot verification. These paths contain operational evidence and are not published to GitHub.

## Provider issue and remaining work

The provider's `one-context-local.service` was already failed on arrival with `No contextualization found`. The interface also had two public IPv4 addresses and duplicate default routes. Connectivity currently works. No network settings were changed, the failure was not hidden/reset, and no reboot was performed. Ask the provider to confirm the intended addresses/routes and contextualization setup before the reboot/persistence acceptance test.

Before deployment: rotate the root password shared in chat, establish and test a personal SSH-key/sudo login, transfer a verified private owner-data snapshot, configure persistent application paths and systemd, verify domain DNS, issue/test TLS, schedule off-server backups and perform a restore drill. Keep the earlier lint, media/catalog and final browser/accessibility/security gates open. See [the readiness review](VPS_READINESS_2026-10-13.md).

DNS lookups from the VPS did not establish usable domain routing: the `.com` lookup returned `SERVFAIL`, while the `.ir` lookup returned name-not-found. These are resolver observations, not proof of domain ownership or registration status. DNS was not modified.

The first-install script's application paths and service-account names were not created during preparation. The preflight account and checkout are separate. That script installs its own pinned runtime at `/opt/polad-node-v24.21.0`; the global preflight runtime above does not replace its path requirements. Follow the [Persian guide](UBUNTU_24_GUIDE_FA.md) or [English guide](GITHUB_VPS_INSTALL.md) for owner-data deployment, rather than starting the test checkout as production.
