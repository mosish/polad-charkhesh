# Install the website and admin from GitHub

[راهنمای کامل فارسی](UBUNTU_24_GUIDE_FA.md) · [Detailed English runbook](UBUNTU_24_RUNBOOK.md)

The public repository includes the website, `components/admin/`, Express authentication/API, public assets, build configuration and deployment templates. It deliberately excludes credentials, SQLite, admin accounts, uploaded media, dependencies and generated builds. A GitHub source ZIP is **not** a backup of your current admin data.

## 1. Prepare the VPS and private data

Use a fresh, dedicated Ubuntu 24.04 VPS with sudo/root, public IPv4, persistent local disk and international connectivity. Recommended: 2 cores / 4 GB / 60 GB. No cPanel, MariaDB or GPU is necessary. Know the real SSH port; leave your SSH connection open while configuring the firewall. Test a second key-authenticated administrator login before restricting password/root login.

Apply `sudo apt-get update` and `sudo apt-get upgrade` first. If `/var/run/reboot-required` exists, reboot and reconnect before installing the application.

For existing content, stop local writes, explicitly set `DATABASE_PATH` and `UPLOAD_DIR` to the **actual active** paths, run `pnpm backup:data ABSOLUTE_BACKUP_ROOT`, and verify the printed snapshot using `pnpm verify:backup ABSOLUTE_SNAPSHOT`. The backup script does not automatically load `.env`. Privately transfer the complete snapshot (database, uploads, manifest) over SSH/SFTP to `/root/polad-transfer/`. A later local edit requires a new final snapshot. Never upload this snapshot to GitHub.

## 2. Download a specific installer revision

Run in a root SSH shell on the VPS, not Windows PowerShell:

```bash
apt-get update
apt-get install -y ca-certificates curl git
PC_COMMIT=$(git ls-remote https://github.com/mosish/polad-charkhesh.git refs/heads/main | cut -f1)
[[ "$PC_COMMIT" =~ ^[0-9a-f]{40}$ ]] || { echo 'Cannot resolve GitHub main'; exit 1; }
curl --fail --show-error --location \
  "https://raw.githubusercontent.com/mosish/polad-charkhesh/$PC_COMMIT/deploy/install-ubuntu.sh" \
  -o /root/install-ubuntu.sh
bash -n /root/install-ubuntu.sh
less /root/install-ubuntu.sh
```

Review the script, then press `q`. Pinning the download prevents a branch change from substituting a different installer during the same install. It does not itself approve that commit for public launch. Resolve `PC_COMMIT` again if you start another shell.

## 3. Install, preserving your admin data

Replace the SSH port and exact private snapshot name:

```bash
bash /root/install-ubuntu.sh install --ref "$PC_COMMIT" --ssh-port 22 \
  --backup /root/polad-transfer/backup-REPLACE_WITH_EXACT_NAME
```

**Alternative only for a deliberately new database:** replace `--backup ...` with `--initialize-empty`. This initializes bundled seed content and first-admin setup; it does not migrate existing edits or accounts. Do not run both variants.

The installer checks for an existing installation and refuses to overwrite it. It installs Nginx, Ubuntu's Certbot package, UFW and automatic security updates; allows the declared SSH port and HTTP/HTTPS; installs checksum-verified Node 24.21.0 and pnpm 11.25.0; clones the pinned commit; builds as an unprivileged user; runs audit/typecheck/tests/build/bundle/production-smoke checks; probes storage; verifies/restores the snapshot; generates private secrets; and starts the unprivileged systemd application on `127.0.0.1:3001`. Provider firewall settings remain separate.

Lint is recorded in `/etc/polad-charkhesh/install-lint.txt`. The known backlog permits **restricted staging only**, never public-launch approval. Other failing checks stop installation. If installation stops, inspect the error rather than deleting directories and rerunning. No automatic reset/resume is provided.

## 4. Point DNS and enable restricted HTTPS

Point the A records of `poladcharkhesh.com` and `poladcharkhesh.ir` to the VPS IPv4; preserve mail records. Do not publish AAAA without configured IPv6 or `www` without matching TLS/Nginx configuration. Moving an existing live domain requires a planned cutover. HTTP deliberately returns 503 until this step. Ensure ports 80/443 are allowed in the provider firewall too.

```bash
bash /root/install-ubuntu.sh https --allow-ip YOUR_PUBLIC_IPV4
```

Use the public **client** IPv4 of the internet connection you browse from, not the server IP. Certbot asks for email and agreement interactively, issues both domains, tests renewal and installs a reload hook. The site is IP-restricted with a noindex header; other visitors receive 403.

Visit `https://poladcharkhesh.com/admin/`. Restored accounts keep their previous credentials; sessions require a fresh login because secrets change. New installations need a first administrator: privately read `SETUP_TOKEN` in `/etc/polad-charkhesh/env`, enter it in the setup form, and choose your credentials. After successful setup/login, remove **only** `SETUP_TOKEN` and `ALLOW_INITIALIZE_DATABASE` from that file and restart the service. There are no default login credentials.

## 5. Verify and release deliberately

Check `/api/health`, login/logout, admin edits/uploads, both languages, products and engineering tools. Test reboot/startup, the persistence probe's printed `--verify` command, and an off-server backup restore. The installer logs the commit, readiness and storage probe under `/etc/polad-charkhesh/`. It does not configure scheduled/offsite backups: complete those before public launch. Use the [runbook](UBUNTU_24_RUNBOOK.md) with this installation's Node path, `/opt/polad-node-v24.21.0/bin/node`.

Only after the [open gates](VPS_READINESS_2026-10-13.md#open-release-gates) are resolved, back up the Nginx site file and remove the staging `allow`/`deny` directives and `X-Robots-Tag` line from the HTTPS `location /` block. Run `nginx -t` before reloading. Do not treat passing installation as content/security approval.

For updates, build a new release separately, verify it, back up data, switch `current`, and restart; retain a compatible rollback release/data snapshot. **Do not rerun the first-install script or git pull inside the running release.** Nothing in this workflow deploys automatically when GitHub changes.

## Installer verification scope

The dedicated GitHub Actions job runs ShellCheck and tests in a disposable Ubuntu 24.04 container: argument rejection, wrong SSH port, missing/conflicting backups, existing-data preservation, restricted HTTPS rendering parsed by real Nginx, repeated-install refusal, and configuration rollback without reload on failure. Certificate issuance, network calls and service-manager actions are stubbed in that test. This is not a real VPS installation, reboot, Let's Encrypt issuance or provider storage test. The existing application checks run separately.
