#!/usr/bin/env bash
# Disposable Ubuntu container only. Tests guards and HTTPS rendering without a live VPS.
set -Eeuo pipefail
[[ -f /.dockerenv && ${POLAD_INSTALLER_TEST:-} == 1 && $EUID == 0 ]] || {
  echo 'Run only in a disposable Ubuntu container with POLAD_INSTALLER_TEST=1.' >&2
  exit 1
}
ROOT=$(cd -- "$(dirname -- "$0")/.." && pwd)
INSTALLER="$ROOT/deploy/install-ubuntu.sh"
SHA=0123456789abcdef0123456789abcdef01234567
bash -n "$INSTALLER"
bash "$INSTALLER" --help >/dev/null
expect_failure() {
  local expected=$1 output
  shift
  if output=$(bash "$INSTALLER" "$@" 2>&1); then
    echo "Unexpected success: $*" >&2; exit 1
  fi
  [[ $output == *"$expected"* ]] || { printf 'Unexpected error: %s\n' "$output" >&2; exit 1; }
}
expect_failure 'Unknown argument' install --bogus
expect_failure 'Missing value' install --ref
expect_failure '40-character' install --ref main --ssh-port 22 --initialize-empty
expect_failure 'Invalid SSH port' install --ref "$SHA" --ssh-port 0 --initialize-empty
expect_failure 'Choose backup restore OR' install --ref "$SHA" --ssh-port 22 --initialize-empty --backup /missing
expect_failure 'complete private verified snapshot' install --ref "$SHA" --ssh-port 22
export SSH_CONNECTION='192.0.2.1 49123 192.0.2.2 2222'
expect_failure 'differs from the active connection' install --ref "$SHA" --ssh-port 22 --initialize-empty
unset SSH_CONNECTION
expect_failure 'Invalid IPv4' https --allow-ip 999.1.1.1
expect_failure 'PUBLIC client IPv4' https --allow-ip '1.2.3.4;echo unsafe'
mkdir -p /var/lib/polad-charkhesh
printf 'preserve me\n' > /var/lib/polad-charkhesh/owner-data
expect_failure 'Existing path' install --ref "$SHA" --ssh-port 22 --initialize-empty
[[ $(cat /var/lib/polad-charkhesh/owner-data) == 'preserve me' ]]
rm /var/lib/polad-charkhesh/owner-data
rmdir /var/lib/polad-charkhesh
expect_failure 'running systemd' install --ref "$SHA" --ssh-port 22 --initialize-empty

# Exercise the actual HTTPS mode, stubbing only external effects. Nginx parses for real.
mkdir -p /opt/polad-charkhesh /etc/polad-charkhesh /etc/letsencrypt/live/polad-charkhesh /var/www/letsencrypt
ln -s "$ROOT" /opt/polad-charkhesh/current
touch /etc/polad-charkhesh/env
cp "$ROOT/deploy/nginx-http.conf.example" /etc/nginx/sites-available/polad-charkhesh
rm -f /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/polad-charkhesh /etc/nginx/sites-enabled/polad-charkhesh
openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj /CN=poladcharkhesh.com \
  -keyout /etc/letsencrypt/live/polad-charkhesh/privkey.pem \
  -out /etc/letsencrypt/live/polad-charkhesh/fullchain.pem >/dev/null 2>&1
for command in curl certbot systemctl; do
  printf '#!/bin/sh\nprintf "%%s\\n" "%s $*" >> /tmp/polad-test-calls\nexit 0\n' "$command" > "/usr/local/bin/$command"
  chmod 0755 "/usr/local/bin/$command"
done
bash "$INSTALLER" https --allow-ip 192.0.2.10
grep -q 'allow 192.0.2.10;' /etc/nginx/sites-available/polad-charkhesh
grep -q 'deny all;' /etc/nginx/sites-available/polad-charkhesh
grep -q 'noindex, nofollow' /etc/nginx/sites-available/polad-charkhesh
grep -q 'renew --dry-run' /tmp/polad-test-calls
[[ -f /etc/polad-charkhesh/https-enabled ]]
expect_failure 'HTTPS is already configured' https --allow-ip 192.0.2.10

# Invalid generated config must restore the previous site without reloading it.
rm /etc/polad-charkhesh/https-enabled
cp /etc/nginx/sites-available/polad-charkhesh /tmp/site-before-failure
printf '#!/bin/sh\nexit 1\n' > /usr/local/bin/nginx
chmod 0755 /usr/local/bin/nginx
: > /tmp/polad-test-calls
expect_failure 'Previous HTTP configuration restored' https --allow-ip 192.0.2.11
cmp /tmp/site-before-failure /etc/nginx/sites-available/polad-charkhesh
if grep -q 'reload nginx' /tmp/polad-test-calls; then
  echo 'An invalid configuration triggered a reload.' >&2; exit 1
fi
printf 'Installer guards, data preservation, restricted HTTPS and config rollback passed.\n'
