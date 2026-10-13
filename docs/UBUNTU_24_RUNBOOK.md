# Ubuntu 24.04 VPS runbook

[GitHub installer quick start](GITHUB_VPS_INSTALL.md) · [راهنمای گام‌به‌گام فارسی](UBUNTU_24_GUIDE_FA.md)

The optional first-install script uses `/opt/polad-node-v24.21.0/bin/node` and patches the service template accordingly. Substitute that executable for `/usr/bin/node` in this manual runbook when maintaining an installation created by the script. Its HTTPS step initially restricts access to the operator's IPv4; see the linked guide for staging and public-release steps.

Prepared 2026-10-13. **Staging preparation, not public-launch approval.** See [audit results and remaining gates](VPS_READINESS_2026-10-13.md). No server has been purchased or deployed by this workflow.

## Choose the host

The economical starting option is **1 vCPU / 2 GB RAM / 40 GB local SSD** for modest traffic, without a hosting control panel. The source checks and a small production HTTP sample pass under that CPU/RAM limit. For more comfortable upgrades, backups and traffic headroom, **2 vCPU / 4 GB RAM / 60 GB local SSD is recommended**. No traffic forecast or provider CPU benchmark is available. Test monthly before buying a year.

Use plain Ubuntu 24.04 LTS, root/sudo SSH access, persistent local storage, snapshots plus an independent off-server backup, and support for both domains. Do not add MariaDB: this application uses SQLite. Three.js renders on the visitor's device; the VPS does not need a GPU. Confirm bandwidth, renewal prices, snapshot retention and restore charges with the provider. Inspect storage with `findmnt -T /var/lib/polad-charkhesh`; SQLite WAL must not be put on NFS/SMB storage.

## Prepare the operating system

Keep the original SSH session open until a second key-authenticated administrator session works. Do not disable password access before verifying the key. Install Ubuntu security updates, `nginx`, `certbot`, `git`, `curl`, `ca-certificates`, and `unattended-upgrades`. Enable unattended security updates. Before enabling UFW, allow the **actual SSH port**, then allow HTTP/HTTPS. Do not expose port 3001 or Vite's 5173. No cPanel/Plesk is needed.

Install Node **24 LTS** from an official supported distribution and verify the downloaded checksum; the tested release is **24.21.0**. The Ubuntu default `nodejs` package may be too old. The service template expects `/usr/bin/node`; adjust `ExecStart` to the absolute path returned by `command -v node`. Confirm:

```bash
node --version
node -e "const {DatabaseSync}=require('node:sqlite');const db=new DatabaseSync(':memory:');console.log(db.prepare('select sqlite_version() v').get());db.close()"
npm install --global pnpm@11.25.0
sudo useradd --system --home /var/lib/polad-charkhesh --shell /usr/sbin/nologin polad-charkhesh
sudo install -d -m 0700 -o polad-charkhesh -g polad-charkhesh /var/lib/polad-charkhesh
sudo install -d -m 0700 /etc/polad-charkhesh /var/backups/polad-charkhesh
sudo install -d -m 0755 /opt/polad-charkhesh/releases /var/www/letsencrypt
```

Create the account only if it does not already exist. Use a separate ordinary deployment account to build source; do not run the application as root.

## Prepare an immutable release

Clone `https://github.com/mosish/polad-charkhesh.git` into a new release directory, check out the reviewed commit, and build **on Linux**, never by copying Windows `node_modules`. Keep releases separate from the database and uploads. Use the following checks before assigning `/opt/polad-charkhesh/current` to the reviewed release:

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

Lint currently fails; this is an open release gate, not permission to ignore the command. The other checks operate on disposable data. Once approved, retain at least the previous release and point `current` to the new absolute release directory using a symlink. The service user needs read/traverse permission on the code, not write access. Preserve the lockfile and install it frozen. `NODE_ENV=production` belongs to the running service, not the dependency-install/build shell.

Optional reproducible Ubuntu verification on a machine with Docker:

```bash
docker build -f deploy/ubuntu-check.Dockerfile -t polad-ubuntu-check .
docker run --rm --cpus 1 --memory 2g --memory-swap 2g polad-ubuntu-check
```

This image is a test environment, not the production deployment image. `.dockerignore` excludes databases, uploads, secrets, dependencies and local output. Its checks do not prove a real VPS reboot or provider storage persistence.

## Migrate existing owner data

**Do not launch a fresh seed database in place of the current admin data.** Stop local writes for the complete database-and-media snapshot, run `pnpm backup:data ABSOLUTE_BACKUP_DIRECTORY`, then `pnpm verify:backup ABSOLUTE_SNAPSHOT_DIRECTORY`. Transfer the entire verified snapshot privately over SSH/SFTP, including uploads and manifest. Do not put it in GitHub.

Verify the snapshot again on Linux before restoring. Keep the service stopped. For a first installation, copy `platform.sqlite` and the complete `uploads` directory into `/var/lib/polad-charkhesh/`, owned by `polad-charkhesh`, directory mode 0700 and files 0600. Never overwrite a running SQLite file. For replacement/rollback, first preserve the complete existing data directory, including WAL/SHM, in a separate private location while the service is stopped; restore the verified snapshot into a new clean data directory. Do not mix an older main database with newer WAL/SHM files.

Use the existing backup verification tool rather than opening/editing a live database manually. Test restored records, account login, product edits and uploaded bytes in an isolated staging instance before public launch.

## Configure secrets and service

Create `/etc/polad-charkhesh/env`, owned by root with mode 0600, using the values in [DEPLOYMENT.md](DEPLOYMENT.md#vps-layout-and-secrets). Generate independent cryptographic secrets; do not copy documentation placeholders. `DATABASE_PATH` and `UPLOAD_DIR` must point to the persistent paths above. Keep `HOST=127.0.0.1`, `PORT=3001`, `NODE_ENV=production`.

Production refuses a missing/empty database. **Only for an intentionally new installation**, set `ALLOW_INITIALIZE_DATABASE=1` and a random `SETUP_TOKEN`, create the first administrator privately, then remove both first-run values and restart. A restored database with an administrator does not need these settings. There are no default admin credentials.

```bash
sudo install -m 0644 deploy/polad-charkhesh.service.example /etc/systemd/system/polad-charkhesh.service
sudo systemd-analyze verify /etc/systemd/system/polad-charkhesh.service
sudo systemctl daemon-reload
sudo systemctl enable --now polad-charkhesh
curl --fail http://127.0.0.1:3001/api/health
sudo journalctl -u polad-charkhesh -n 100 --no-pager
```

The service drains HTTP requests and closes SQLite on SIGTERM, with a ten-second application deadline and a fifteen-second systemd stop deadline. Health returns 503 if the product table cannot be queried. It does not certify disk health or backup integrity.

## Connect domains and HTTPS

Point the `.com` and `.ir` root A records at the VPS; preserve mail records. Add AAAA only after IPv6 is configured end to end. The templates use IPv4. Optional `www` names require their own certificate coverage and redirects; do not publish unconfigured names.

For certificate bootstrap, preserve any existing Nginx configuration, disable the distribution's default site if it conflicts, and install `deploy/nginx-http.conf.example` as the enabled site. It serves ACME challenges and returns 503 elsewhere; it does not expose an unfinished admin setup. Run `sudo nginx -t` before every reload.

```bash
sudo certbot certonly --webroot -w /var/www/letsencrypt \
  -d poladcharkhesh.com -d poladcharkhesh.ir
```

Complete Certbot's email/agreement prompts as the domain owner. Replace the certificate-name placeholder in `deploy/nginx.conf.example` with the certificate directory Certbot actually created, install that final config, test, then reload Nginx. Keep the ACME challenge path for renewal. Check `sudo certbot renew --dry-run` and configure a renewal deploy hook that runs `nginx -t && systemctl reload nginx` as root. Confirm the certbot renewal timer is enabled. The final config rejects unknown hosts, compresses text responses, and forwards the trusted client address/protocol to the loopback API.

## Backup, updates and rollback

For each update: retain the current commit, stop the service briefly, take and verify a full SQLite/uploads backup, restart the existing release, build the new release separately, then switch the symlink and restart only after checks pass. Use the root operator's environment loader to pass the persistent paths to the backup command; shell environment in an interactive terminal is not inherited from systemd's EnvironmentFile. An explicit offline backup example:

```bash
sudo systemctl stop polad-charkhesh
sudo env DATABASE_PATH=/var/lib/polad-charkhesh/platform.sqlite \
  UPLOAD_DIR=/var/lib/polad-charkhesh/uploads \
  /usr/bin/node --import tsx scripts/backup-data.ts /var/backups/polad-charkhesh
# Verify the exact snapshot path printed by the command before relying on it.
sudo /usr/bin/node --import tsx scripts/verify-backup.ts /var/backups/polad-charkhesh/EXACT_SNAPSHOT_NAME
sudo systemctl start polad-charkhesh
```

Run from the current release directory and adjust the Node path if needed. If backup/verification fails, retain the old release, investigate, and restore service deliberately; do not proceed with the update. Schedule regular verified backups, alert on failures, and keep encrypted copies off-server. Provider snapshots alone are insufficient. Configure log rotation and monitor free disk, RAM, CPU, HTTP errors, and backup age; choose retention after measuring media growth. Do not automatically delete backups before a tested retention policy exists.

For a code-only failure, switch back to the previous release and restart. If a release changes the database schema or data, use its compatible backup/rollback procedure; code rollback alone is not always safe. Never reset production to bundled seed records.

## Final acceptance on the purchased VPS

- Run `node scripts/hosting-check.mjs /var/lib/polad-charkhesh` **as the service user**, record its probe directory, and run the printed `--verify` command after a real reboot and another release switch.
- Verify automatic startup after reboot and recovery after an intentionally stopped/crashed staging process. A deliberate `systemctl stop` should stay stopped.
- From an external network, verify both domains, TLS renewal, language defaults, canonical/hreflang, admin login/logout, uploads, product/content editing, inquiry handling and protected backup endpoints.
- Restore an off-server backup into an isolated instance and compare catalog counts and media hashes. Record the recovery procedure and timing.
- Complete catalog approval, lint cleanup, and full browser/accessibility/security review in the readiness report. Do not treat successful infrastructure checks as content approval.

Reference: [Node LTS policy](https://nodejs.org/en/about/previous-releases), [Ubuntu lifecycle](https://ubuntu.com/about/release-cycle), [SQLite WAL restrictions](https://www.sqlite.org/wal.html).
