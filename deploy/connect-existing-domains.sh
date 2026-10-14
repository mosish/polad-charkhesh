#!/usr/bin/env bash
# For the already-published 213.176.28.119 VPS only. Does not change DNS or data.
set -euo pipefail
test "$(id -u)" -eq 0 || { echo 'Run as root on the existing VPS.' >&2; exit 1; }
pc_ip=213.176.28.119
pc_names=(poladcharkhesh.ir www.poladcharkhesh.ir poladcharkhesh.com www.poladcharkhesh.com)
pc_config=/etc/nginx/sites-available/polad-domains
pc_template=/root/polad-preparation/nginx-domain-https-ready.conf
pc_certbot=/opt/polad-certbot/bin/certbot
test -f "$pc_config" && test -f "$pc_template" && test -x "$pc_certbot"
test "$(readlink -f /etc/nginx/sites-enabled/polad-domains)" = "$pc_config"
# Public resolvers must agree. Refuse unexpected IPv4/IPv6 routing before ACME.
for pc_resolver in 1.1.1.1 8.8.8.8; do
    for pc_name in "${pc_names[@]}"; do
        pc_records=$(dig @"$pc_resolver" "$pc_name" A +short +time=5 +tries=1)
        pc_addresses=$(printf '%s\n' "$pc_records" | awk '/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/')
        if [ "$pc_addresses" != "$pc_ip" ]; then
            printf 'DNS not ready: %s via %s must resolve only to %s. No HTTPS configuration changed.\n' "$pc_name" "$pc_resolver" "$pc_ip" >&2
            exit 1
        fi
        # This VPS has no verified public IPv6 service.
        pc_ipv6=$(dig @"$pc_resolver" "$pc_name" AAAA +short +time=5 +tries=1 | awk '/:/')
        if [ -n "$pc_ipv6" ]; then
            printf 'Unexpected AAAA record: %s. Correct public routing before retrying.\n' "$pc_name" >&2
            exit 1
        fi
    done
done
pc_certificate_args=()
for pc_name in "${pc_names[@]}"; do
    pc_certificate_args+=(-d "$pc_name")
done
"$pc_certbot" certonly --non-interactive --webroot -w /var/www/letsencrypt \
    --cert-name polad-domains "${pc_certificate_args[@]}"
test -s /etc/letsencrypt/live/polad-domains/fullchain.pem
test -s /etc/letsencrypt/live/polad-domains/privkey.pem
pc_backup=$(mktemp -d /root/polad-preparation/domain-activation.XXXXXX)
cp -a "$pc_config" "$pc_backup/nginx-before.conf"
pc_activated=0
pc_restore() {
    if [ "$pc_activated" -eq 0 ]; then
        cp -a "$pc_backup/nginx-before.conf" "$pc_config"
        nginx -t -q && systemctl reload nginx
    fi
}
trap pc_restore EXIT
install -m 0644 "$pc_template" "$pc_config"
nginx -t -q
systemctl reload nginx
for pc_name in poladcharkhesh.ir poladcharkhesh.com; do
    curl --fail --silent --show-error --resolve "$pc_name:443:127.0.0.1" "https://$pc_name/api/health"
    printf '\n'
done
# Existing timer must renew every lineage, including the new domain certificate.
if ! systemctl cat polad-certbot.service | grep -Fxq 'ExecStart=/opt/polad-certbot/bin/certbot renew --quiet'; then
    echo 'Configure the existing renewal service to renew all certificate lineages.' >&2
    exit 1
fi
systemctl is-enabled --quiet polad-certbot.timer
systemctl is-active --quiet polad-certbot.timer
pc_activated=1
printf 'Domain HTTPS activated. Previous config: %s\n' "$pc_backup/nginx-before.conf"
printf 'Run external checks: node /opt/polad-charkhesh/current/deploy/check-live.mjs https://poladcharkhesh.ir (and .com).\n'
