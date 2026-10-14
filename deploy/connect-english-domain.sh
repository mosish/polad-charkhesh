#!/usr/bin/env bash
# Existing VPS only: activate .com after the registrar unblocks it.
# Both .com records must remain DNS only until this command succeeds.
set -euo pipefail
test "$(id -u)" -eq 0 || { echo 'Run as root on the existing VPS.' >&2; exit 1; }
pc_ip=213.176.28.119
pc_pending=/etc/nginx/sites-available/polad-domains
pc_pending_link=/etc/nginx/sites-enabled/polad-domains
pc_config=/etc/nginx/sites-available/polad-com
pc_link=/etc/nginx/sites-enabled/polad-com
pc_template=/root/polad-preparation/nginx-com-https-ready.conf
pc_certbot=/opt/polad-certbot/bin/certbot
test -f "$pc_pending" && test -f "$pc_template" && test -x "$pc_certbot"
test "$(readlink -f "$pc_pending_link")" = "$pc_pending"
test "$(readlink -f /etc/nginx/sites-enabled/polad-ir)" = /etc/nginx/sites-available/polad-ir
if [ -e "$pc_config" ] || [ -L "$pc_link" ] || [ -e "$pc_link" ]; then
    echo 'English domain configuration already exists; inspect it rather than overwriting it.' >&2
    exit 1
fi
if grep -Eq 'server_name.*poladcharkhesh\.ir' "$pc_pending"; then
    echo 'Pending vhost still contains .ir; preserve the live Persian vhost before continuing.' >&2
    exit 1
fi
systemctl cat polad-certbot.service | grep -Fxq 'ExecStart=/opt/polad-certbot/bin/certbot renew --quiet'
systemctl is-enabled --quiet polad-certbot.timer
systemctl is-active --quiet polad-certbot.timer
for pc_resolver in 1.1.1.1 8.8.8.8; do
    for pc_name in poladcharkhesh.com www.poladcharkhesh.com; do
        pc_records=$(dig @"$pc_resolver" "$pc_name" A +short +time=5 +tries=1)
        pc_addresses=$(printf '%s\n' "$pc_records" | awk '/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/')
        if [ "$pc_addresses" != "$pc_ip" ]; then
            printf 'DNS not ready: %s via %s must resolve only to %s. No certificate or HTTPS change made.\n' "$pc_name" "$pc_resolver" "$pc_ip" >&2
            exit 1
        fi
        pc_ipv6=$(dig @"$pc_resolver" "$pc_name" AAAA +short +time=5 +tries=1 | awk '/:/')
        test -z "$pc_ipv6" || { echo 'Unexpected .com AAAA routing; inspect DNS first.' >&2; exit 1; }
    done
done
curl --fail --silent --show-error --resolve poladcharkhesh.ir:443:127.0.0.1 https://poladcharkhesh.ir/api/health
"$pc_certbot" certonly --non-interactive --webroot -w /var/www/letsencrypt \
    --cert-name polad-com -d poladcharkhesh.com -d www.poladcharkhesh.com
test -s /etc/letsencrypt/live/polad-com/fullchain.pem
test -s /etc/letsencrypt/live/polad-com/privkey.pem
pc_backup=$(mktemp -d /root/polad-preparation/com-activation.XXXXXX)
cp -a "$pc_pending" "$pc_backup/nginx-pending-before.conf"
pc_activated=0
pc_restore() {
    if [ "$pc_activated" -eq 0 ]; then
        rm -f "$pc_link" "$pc_config"
        ln -sfn "$pc_pending" "$pc_pending_link"
        nginx -t -q && systemctl reload nginx
    fi
}
trap pc_restore EXIT
install -m 0644 "$pc_template" "$pc_config"
ln -s "$pc_config" "$pc_link"
rm "$pc_pending_link"
nginx -t -q
systemctl reload nginx
# A fresh connection may reach an old worker while reload drains it; retry briefly.
for pc_name in poladcharkhesh.com poladcharkhesh.ir; do
    curl --retry 3 --retry-all-errors --retry-delay 1 --fail --silent --show-error \
        --resolve "$pc_name:443:127.0.0.1" "https://$pc_name/api/health"
    printf '\n'
done
pc_activated=1
printf 'English HTTPS activated independently. Pending-config backup: %s\n' "$pc_backup"
echo 'Next: check the external .com pages/admin, run certificate renewal dry-run, then set Cloudflare Full (strict) before enabling proxying.'
echo 'Keep .ir Persian and .com English; do not redirect one apex to the other.'
