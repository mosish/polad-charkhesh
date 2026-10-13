#!/usr/bin/env bash
# First-install helper for a dedicated Ubuntu 24.04 VPS. Never run with bash -x.
set -Eeuo pipefail
umask 022
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

usage() {
  cat <<'HELP'
Usage:
  sudo bash install-ubuntu.sh install --ref FULL_COMMIT_SHA --ssh-port PORT --backup /absolute/snapshot
  sudo bash install-ubuntu.sh install --ref FULL_COMMIT_SHA --ssh-port PORT --initialize-empty
  sudo bash install-ubuntu.sh https --allow-ip YOUR_PUBLIC_IPV4

install: fresh dedicated Ubuntu 24.04 only; preserves existing installations by refusing them.
         Builds public GitHub source, restores a verified PRIVATE snapshot or explicitly
         creates a new seeded database, starts loopback Node, and serves HTTP maintenance.
https:   after BOTH domains point here, obtains a certificate interactively and enables
         HTTPS restricted to your IP. Does NOT approve or enable a public launch.

Repository: https://github.com/mosish/polad-charkhesh.git
Domains: poladcharkhesh.com (English), poladcharkhesh.ir (Persian)
Never put passwords, env files, SQLite databases or private uploads in this repository.
HELP
}
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
MODE=${1:---help}
[[ $MODE != --help && $MODE != -h ]] || { usage; exit 0; }
shift
REF=''
BACKUP=''
ALLOW_IP=''
SSH_PORT=''
INITIALIZE=0
while (($#)); do
  case "$1" in
    --ref|--backup|--allow-ip|--ssh-port)
      (($# >= 2)) || die "Missing value for $1"
      case "$1" in
        --ref) REF=$2 ;; --backup) BACKUP=$2 ;;
        --allow-ip) ALLOW_IP=$2 ;; --ssh-port) SSH_PORT=$2 ;;
      esac
      shift 2 ;;
    --initialize-empty) INITIALIZE=1; shift ;;
    *) die "Unknown argument: $1" ;;
  esac
done
[[ $MODE == install || $MODE == https ]] || die 'Mode must be install or https.'
[[ $EUID == 0 ]] || die 'Run with sudo or as root.'
# shellcheck disable=SC1091
source /etc/os-release
[[ $ID == ubuntu && $VERSION_ID == 24.04 ]] || die 'Ubuntu 24.04 is required.'
BASE=/opt/polad-charkhesh
DATA=/var/lib/polad-charkhesh
CONFIG=/etc/polad-charkhesh
SITE=/etc/nginx/sites-available/polad-charkhesh
NODE_VERSION=24.21.0
NODE_ROOT=/opt/polad-node-v$NODE_VERSION
TOOLS=/opt/polad-tools
export PATH="$NODE_ROOT/bin:$TOOLS/bin:$PATH"
TMP=
cleanup() { [[ -z $TMP ]] || rm -rf -- "$TMP"; }
trap cleanup EXIT
trap 'printf "Installation stopped at line %s. Review the error; do not delete existing data or rerun blindly.\n" "$LINENO" >&2' ERR

if [[ $MODE == https ]]; then
  [[ -z $REF && -z $BACKUP && -z $SSH_PORT && $INITIALIZE == 0 ]] || die 'https only accepts --allow-ip.'
  [[ $ALLOW_IP =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]] || die 'Supply your current PUBLIC client IPv4 with --allow-ip.'
  IFS=. read -r -a octets <<< "$ALLOW_IP"
  for octet in "${octets[@]}"; do ((10#$octet <= 255)) || die 'Invalid IPv4.'; done
  [[ -L $BASE/current && -f $CONFIG/env && -f $SITE ]] || die 'Complete install first.'
  [[ ! -e $CONFIG/https-enabled ]] || die 'HTTPS is already configured; use the maintenance guide for changes.'
  curl --fail --silent http://127.0.0.1:3001/api/health
  printf '\nBoth domains must resolve to this VPS and TCP 80/443 must be reachable.\n'
  printf 'Certbot will ask for your email and agreement. No domain registration is performed.\n'
  certbot certonly --webroot -w /var/www/letsencrypt \
    --cert-name polad-charkhesh -d poladcharkhesh.com -d poladcharkhesh.ir
  TMP=$(mktemp -d /tmp/polad-https.XXXXXX)
  sed -e 's/REPLACE_WITH_CERTIFICATE_NAME/polad-charkhesh/g' \
    -e "/proxy_pass http:\/\/127.0.0.1:3001;/i\\        allow $ALLOW_IP;\n        allow 127.0.0.1;\n        deny all;\n        add_header X-Robots-Tag \"noindex, nofollow\" always;" \
    "$BASE/current/deploy/nginx.conf.example" > "$TMP/site.conf"
  cp -a "$SITE" "$CONFIG/nginx-before-https.conf"
  install -m 0644 "$TMP/site.conf" "$SITE"
  if ! nginx -t; then
    cp -a "$CONFIG/nginx-before-https.conf" "$SITE"
    die 'Invalid HTTPS configuration. Previous HTTP configuration restored; no reload performed.'
  fi
  install -d -m 0755 /etc/letsencrypt/renewal-hooks/deploy
  printf '#!/bin/sh\nset -eu\n/usr/sbin/nginx -t\n/usr/bin/systemctl reload nginx\n' \
    > /etc/letsencrypt/renewal-hooks/deploy/polad-nginx
  chmod 0755 /etc/letsencrypt/renewal-hooks/deploy/polad-nginx
  systemctl reload nginx
  systemctl enable --now certbot.timer
  certbot renew --dry-run
  touch "$CONFIG/https-enabled"
  printf '\nRestricted staging ready: https://poladcharkhesh.com/admin/\n'
  printf 'Only %s can browse it. Complete the guide before removing the restriction.\n' "$ALLOW_IP"
  exit 0
fi

[[ -z $ALLOW_IP ]] || die '--allow-ip belongs to the https step.'
[[ $REF =~ ^[0-9a-f]{40}$ ]] || die '--ref must be a reviewed full 40-character Git commit SHA.'
[[ $SSH_PORT =~ ^[0-9]{1,5}$ ]] || die 'Provide your actual SSH port, for example --ssh-port 22.'
((10#$SSH_PORT > 0 && 10#$SSH_PORT <= 65535)) || die 'Invalid SSH port.'
if [[ -n ${SSH_CONNECTION:-} ]]; then
  read -r _ _ _ ACTIVE_SSH_PORT <<< "$SSH_CONNECTION"
  [[ $SSH_PORT == "$ACTIVE_SSH_PORT" ]] || die '--ssh-port differs from the active connection.'
fi
if [[ $INITIALIZE == 1 ]]; then
  [[ -z $BACKUP ]] || die 'Choose backup restore OR initialize-empty, not both.'
else
  [[ $BACKUP == /* && -f $BACKUP/platform.sqlite && -f $BACKUP/manifest.json && -d $BACKUP/uploads ]] \
    || die 'Provide a complete private verified snapshot with --backup, or explicitly choose --initialize-empty.'
  [[ ! -e $BACKUP/INCOMPLETE ]] || die 'Incomplete backups cannot be restored.'
fi
for entry in "$BASE" "$DATA" "$CONFIG" "$SITE" "$NODE_ROOT" "$TOOLS" \
  /etc/systemd/system/polad-charkhesh.service /etc/systemd/system/polad-backup.service; do
  [[ ! -e $entry && ! -L $entry ]] || die "Existing path: $entry. This is not an upgrade/reset script."
done
if [[ -d /etc/nginx/sites-enabled ]]; then
  while IFS= read -r entry; do
    [[ $entry == /etc/nginx/sites-enabled/default ]] || die 'Other Nginx sites exist; use manual deployment.'
  done < <(find /etc/nginx/sites-enabled -mindepth 1 -maxdepth 1 -print)
fi
if [[ -d /etc/nginx/conf.d && -n $(find /etc/nginx/conf.d -maxdepth 1 -name '*.conf' -print -quit) ]]; then
  die 'Additional Nginx configuration exists; use manual deployment.'
fi
for account in polad-build polad-charkhesh; do
  if id "$account" >/dev/null 2>&1; then
    die "Existing account: $account. Use manual deployment to preserve its settings."
  fi
done
[[ -d /run/systemd/system ]] || die 'A VPS running systemd is required (not a normal Docker container).'
if command -v ss >/dev/null; then
  [[ -z $(ss -H -ltn 'sport = :3001') ]] || die 'Port 3001 is already occupied.'
fi
printf 'Installing commit %s as RESTRICTED STAGING, not approving a public launch.\n' "$REF"
apt-get update
apt-get install -y ca-certificates curl git xz-utils nginx certbot ufw openssl unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades
systemctl enable --now apt-daily.timer apt-daily-upgrade.timer
ufw allow "$SSH_PORT/tcp"
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose

case "$(dpkg --print-architecture)" in
  amd64) ARCH=x64 ;; arm64) ARCH=arm64 ;; *) die 'Only amd64 and arm64 are supported.' ;;
esac
TMP=$(mktemp -d /tmp/polad-install.XXXXXX)
ARCHIVE="node-v$NODE_VERSION-linux-$ARCH.tar.xz"
curl --fail --show-error --location "https://nodejs.org/dist/v$NODE_VERSION/$ARCHIVE" -o "$TMP/$ARCHIVE"
curl --fail --show-error --location "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt" -o "$TMP/SHASUMS256.txt"
(cd "$TMP"; awk -v name="$ARCHIVE" '$2 == name {print}' SHASUMS256.txt > CHECKSUM; \
  test -s CHECKSUM; sha256sum --check CHECKSUM)
install -d -m 0755 "$NODE_ROOT" "$TOOLS"
tar -xJf "$TMP/$ARCHIVE" --strip-components=1 -C "$NODE_ROOT"
node --version
node -e "const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync(':memory:');console.log(d.prepare('select sqlite_version() v').get());d.close()"
npm install --global --prefix "$TOOLS" pnpm@11.25.0
useradd --system --create-home --home-dir /var/lib/polad-build --shell /usr/sbin/nologin polad-build
useradd --system --home-dir "$DATA" --shell /usr/sbin/nologin polad-charkhesh
install -d -m 0755 "$BASE" "$BASE/releases"
RELEASE="$BASE/releases/$REF"
install -d -m 0755 -o polad-build -g polad-build "$RELEASE"
build_as_user() { runuser -u polad-build -- env PATH="$PATH" HOME=/var/lib/polad-build "$@"; }
build_as_user git clone https://github.com/mosish/polad-charkhesh.git "$RELEASE"
build_as_user git -C "$RELEASE" checkout --detach "$REF"
cd "$RELEASE"
build_as_user pnpm install --frozen-lockfile
build_as_user pnpm audit --audit-level=moderate
build_as_user pnpm typecheck
build_as_user pnpm test
build_as_user pnpm build
build_as_user pnpm check:bundles
build_as_user pnpm smoke:production
# The existing lint backlog prevents public launch, but not IP-restricted staging.
if build_as_user pnpm lint > "$TMP/lint.txt" 2>&1; then LINT_STATUS=passed; else LINT_STATUS=failed; fi
chown -R root:root "$RELEASE"
chmod -R go-w "$RELEASE"
install -d -m 0700 "$CONFIG" /var/backups/polad-charkhesh
install -m 0600 "$TMP/lint.txt" "$CONFIG/install-lint.txt"
printf '%s\n' "$REF" > "$CONFIG/source-commit"
printf 'lint=%s\npublic_launch=NOT_APPROVED\n' "$LINT_STATUS" > "$CONFIG/readiness"
install -d -m 0700 -o polad-charkhesh -g polad-charkhesh "$DATA"
findmnt -T "$DATA"
runuser -u polad-charkhesh -- "$NODE_ROOT/bin/node" scripts/hosting-check.mjs "$DATA" > "$CONFIG/hosting-probe.json"
if [[ -n $BACKUP ]]; then
  node --import tsx scripts/verify-backup.ts "$BACKUP"
  # A restored owner database must already have an administrator.
  node --input-type=module - "$BACKUP/platform.sqlite" <<'JS'
import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync(process.argv[2], {readOnly: true});
if (!db.prepare('SELECT count(*) AS n FROM admins').get().n) throw new Error('Snapshot has no administrator; use the manual setup procedure.');
db.close();
JS
  cp -a "$BACKUP/platform.sqlite" "$BACKUP/uploads" "$DATA/"
  chown -R polad-charkhesh:polad-charkhesh "$DATA"
  find "$DATA" -type d -exec chmod 0700 {} +
  find "$DATA" -type f -exec chmod 0600 {} +
fi
umask 077
{
  printf 'NODE_ENV=production\nHOST=127.0.0.1\nPORT=3001\n'
  printf 'DATABASE_PATH=%s/platform.sqlite\nUPLOAD_DIR=%s/uploads\n' "$DATA" "$DATA"
  printf 'SESSION_SECRET=%s\nCOOKIE_SECRET=%s\n' "$(openssl rand -hex 32)" "$(openssl rand -hex 32)"
  if [[ $INITIALIZE == 1 ]]; then
    printf 'ALLOW_INITIALIZE_DATABASE=1\nSETUP_TOKEN=%s\n' "$(openssl rand -hex 32)"
  fi
} > "$CONFIG/env"
umask 022
ln -s "$RELEASE" "$BASE/current"
sed "s|ExecStart=/usr/bin/node |ExecStart=$NODE_ROOT/bin/node |" deploy/polad-charkhesh.service.example \
  > /etc/systemd/system/polad-charkhesh.service
chmod 0644 /etc/systemd/system/polad-charkhesh.service
systemd-analyze verify /etc/systemd/system/polad-charkhesh.service
systemctl daemon-reload
systemctl enable --now polad-charkhesh
HEALTHY=0
for _ in {1..20}; do
  if curl --fail --silent http://127.0.0.1:3001/api/health; then HEALTHY=1; break; fi
  sleep 1
done
[[ $HEALTHY == 1 ]] || die 'Health failed. Run journalctl -u polad-charkhesh; data has been preserved.'
install -d -m 0755 /var/www/letsencrypt
if [[ -e /etc/nginx/sites-enabled/default || -L /etc/nginx/sites-enabled/default ]]; then
  mv /etc/nginx/sites-enabled/default "$CONFIG/nginx-original-default"
fi
install -m 0644 deploy/nginx-http.conf.example "$SITE"
ln -s "$SITE" /etc/nginx/sites-enabled/polad-charkhesh
nginx -t
systemctl enable nginx
systemctl restart nginx
printf '\nInstalled commit %s. HTTP intentionally returns 503 until HTTPS setup.\n' "$REF"
printf 'Lint: %s (report: %s/install-lint.txt). Public launch is not approved.\n' "$LINT_STATUS" "$CONFIG"
printf 'Next: point both domain A records here, then run:\n'
printf 'sudo bash install-ubuntu.sh https --allow-ip YOUR_PUBLIC_IPV4\n'
printf 'Guide: %s/current/docs/UBUNTU_24_GUIDE_FA.md\n' "$BASE"
